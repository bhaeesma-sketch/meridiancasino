# Implementation Examples
## Crypto Payment System - Code Examples

These are production-ready code examples following the security design.

---

## 1. DEPOSIT ENDPOINT EXAMPLE (Node.js/Express)

```typescript
// src/controllers/depositController.ts
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { recoverAddress } from 'ethers';
import { db } from '../db';
import { nowPaymentsAPI } from '../services/nowPayments';
import { createAuditLog } from '../services/audit';
import { rateLimiter } from '../middleware/rateLimiter';
import { validateChain, validateToken } from '../utils/validation';

/**
 * POST /deposits/initiate
 * Initiate a deposit request
 */
export async function initiateDeposit(req: Request, res: Response) {
  const userId = req.user.userId; // From JWT middleware
  const { chain, token, signature, nonce } = req.body;

  // Start transaction for atomicity
  const client = await db.getClient();
  await client.query('BEGIN');

  try {
    // 1. Validate nonce
    const nonceResult = await client.query(
      `SELECT nonce, expires_at, used_at, user_id
       FROM auth_nonces
       WHERE nonce = $1`,
      [nonce]
    );

    if (nonceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid nonce' });
    }

    const nonceData = nonceResult.rows[0];

    if (nonceData.used_at) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Nonce already used' });
    }

    if (new Date(nonceData.expires_at) < new Date()) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Nonce expired' });
    }

    if (nonceData.user_id !== userId) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Nonce does not belong to user' });
    }

    // 2. Validate chain and token
    if (!validateChain(chain)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Unsupported chain' });
    }

    if (!validateToken(token, chain)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Unsupported token for chain' });
    }

    // 3. Verify signature
    const message = {
      nonce,
      timestamp: nonceData.created_at,
      action: 'deposit_init',
      expiry: nonceData.expires_at
    };

    const messageString = JSON.stringify(message);
    const recoveredAddress = await recoverAddress(messageString, signature);

    // Get user's wallet address
    const userResult = await client.query(
      `SELECT wallet_address FROM users WHERE user_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    const userAddress = userResult.rows[0].wallet_address.toLowerCase();
    const recoveredAddressLower = recoveredAddress.toLowerCase();

    if (recoveredAddressLower !== userAddress) {
      await client.query('ROLLBACK');
      await createAuditLog({
        event_type: 'signature_verification_failed',
        user_id: userId,
        action: 'deposit_initiate',
        changes: { recovered: recoveredAddressLower, expected: userAddress }
      });
      return res.status(403).json({ error: 'Signature verification failed' });
    }

    // 4. Mark nonce as used (atomic operation)
    await client.query(
      `UPDATE auth_nonces SET used_at = NOW() WHERE nonce = $1`,
      [nonce]
    );

    // 5. Create NOWPayments invoice
    const invoiceId = `deposit_${uuidv4()}`;
    const nowPaymentsResponse = await nowPaymentsAPI.createInvoice({
      price_amount: 0, // No expected amount
      price_currency: 'USD',
      pay_currency: token,
      order_id: invoiceId,
      order_description: `Deposit for user ${userId}`,
      ipn_callback_url: process.env.NOWPAYMENTS_IPN_URL,
      success_url: `${process.env.FRONTEND_URL}/deposits/success`,
      cancel_url: `${process.env.FRONTEND_URL}/deposits/cancel`
    });

    if (!nowPaymentsResponse.success) {
      await client.query('ROLLBACK');
      return res.status(500).json({ error: 'Failed to create payment invoice' });
    }

    const depositAddress = nowPaymentsResponse.payment_address;

    // 6. Create deposit record
    const depositId = uuidv4();
    await client.query(
      `INSERT INTO deposits (
        deposit_id, user_id, invoice_id, deposit_address,
        chain, token, status, nonce_used, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [
        depositId,
        userId,
        invoiceId,
        depositAddress,
        chain,
        token,
        'pending',
        nonce
      ]
    );

    // 7. Create audit log
    await createAuditLog({
      event_type: 'deposit_initiated',
      user_id: userId,
      action: 'deposit_initiate',
      entity_type: 'deposit',
      entity_id: depositId,
      changes: {
        chain,
        token,
        deposit_address: depositAddress,
        invoice_id: invoiceId
      },
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    await client.query('COMMIT');

    res.json({
      deposit_id: depositId,
      deposit_address: depositAddress,
      qr_code: nowPaymentsResponse.qr_code || null,
      chain,
      token,
      expiry_minutes: 30
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Deposit initiation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
}
```

---

## 2. WITHDRAWAL ENDPOINT EXAMPLE

```typescript
// src/controllers/withdrawalController.ts
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { recoverAddress } from 'ethers';
import { db } from '../db';
import { createAuditLog } from '../services/audit';
import { validateAddress, calculateNetworkFees } from '../utils/validation';
import { assessRiskLevel, checkVelocityLimits } from '../services/riskAssessment';

const WITHDRAWAL_LIMITS = {
  min_amount: {
    ethereum: 10,
    tron: 5,
    bsc: 10
  },
  max_amount_per_day: 5000,
  max_count_per_day: 10,
  auto_approval_limit: 100,
  min_interval_minutes: 60
};

/**
 * POST /withdrawals/request
 * Request a withdrawal
 */
export async function requestWithdrawal(req: Request, res: Response) {
  const userId = req.user.userId;
  const { destination_address, amount, token, chain, signature, nonce } = req.body;

  // Start transaction with highest isolation level
  const client = await db.getClient();
  await client.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE');
  await client.query('BEGIN');

  try {
    // 1. Validate nonce (same as deposit)
    const nonceResult = await client.query(
      `SELECT nonce, expires_at, used_at, user_id
       FROM auth_nonces
       WHERE nonce = $1`,
      [nonce]
    );

    if (nonceResult.rows.length === 0 || 
        nonceResult.rows[0].used_at || 
        new Date(nonceResult.rows[0].expires_at) < new Date() ||
        nonceResult.rows[0].user_id !== userId) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid or expired nonce' });
    }

    // 2. Verify signature includes amount and destination
    const message = {
      nonce,
      timestamp: nonceResult.rows[0].created_at,
      action: 'withdrawal_request',
      amount: parseFloat(amount),
      destination: destination_address,
      expiry: nonceResult.rows[0].expires_at
    };

    const messageString = JSON.stringify(message);
    const recoveredAddress = await recoverAddress(messageString, signature);

    const userResult = await client.query(
      `SELECT wallet_address FROM users WHERE user_id = $1 FOR UPDATE`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'User not found' });
    }

    const userAddress = userResult.rows[0].wallet_address.toLowerCase();
    if (recoveredAddress.toLowerCase() !== userAddress) {
      await client.query('ROLLBACK');
      await createAuditLog({
        event_type: 'signature_verification_failed',
        user_id: userId,
        action: 'withdrawal_request'
      });
      return res.status(403).json({ error: 'Signature verification failed' });
    }

    // 3. Validate address format
    if (!validateAddress(destination_address, chain)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid address format' });
    }

    // 4. Validate amount
    const amountDecimal = parseFloat(amount);
    const minAmount = WITHDRAWAL_LIMITS.min_amount[chain as keyof typeof WITHDRAWAL_LIMITS.min_amount];
    
    if (isNaN(amountDecimal) || amountDecimal <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (amountDecimal < minAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: `Minimum withdrawal is ${minAmount} ${token}` 
      });
    }

    // 5. Calculate fees
    const fees = await calculateNetworkFees(chain, token);
    const totalRequired = amountDecimal + fees;

    // 6. Lock and verify balance (FOR UPDATE prevents race conditions)
    const balanceResult = await client.query(
      `SELECT balance, reserved_balance 
       FROM user_balances 
       WHERE user_id = $1 
       FOR UPDATE`,
      [userId]
    );

    if (balanceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(500).json({ error: 'Balance record not found' });
    }

    const availableBalance = parseFloat(balanceResult.rows[0].balance) - 
                           parseFloat(balanceResult.rows[0].reserved_balance);

    if (availableBalance < totalRequired) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Insufficient balance',
        available: availableBalance,
        required: totalRequired
      });
    }

    // 7. Check pending withdrawals don't exceed balance
    const pendingResult = await client.query(
      `SELECT COALESCE(SUM(amount + fees), 0) as pending_total
       FROM withdrawals
       WHERE user_id = $1 
       AND status IN ('pending_approval', 'pending_auto', 'approved', 'queued', 'processing')`,
      [userId]
    );

    const pendingTotal = parseFloat(pendingResult.rows[0].pending_total);
    if (availableBalance - pendingTotal < totalRequired) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Insufficient balance (pending withdrawals)' });
    }

    // 8. Velocity and frequency checks
    const velocityCheck = await checkVelocityLimits(client, userId, amountDecimal);
    if (!velocityCheck.allowed) {
      await client.query('ROLLBACK');
      return res.status(429).json({ 
        error: velocityCheck.reason,
        retry_after: velocityCheck.retry_after
      });
    }

    // 9. Risk assessment
    const riskLevel = await assessRiskLevel(userId, amountDecimal, destination_address);

    // 10. Mark nonce as used
    await client.query(
      `UPDATE auth_nonces SET used_at = NOW() WHERE nonce = $1`,
      [nonce]
    );

    // 11. Reserve balance (atomic operation)
    await client.query(
      `UPDATE user_balances 
       SET reserved_balance = reserved_balance + $1,
           updated_at = NOW()
       WHERE user_id = $2`,
      [totalRequired, userId]
    );

    // 12. Create withdrawal record
    const withdrawalId = uuidv4();
    const status = (amountDecimal <= WITHDRAWAL_LIMITS.auto_approval_limit && 
                   riskLevel === 'low') ? 'pending_auto' : 'pending_approval';
    
    const autoApproveAt = status === 'pending_auto' 
      ? new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours delay
      : null;

    await client.query(
      `INSERT INTO withdrawals (
        withdrawal_id, user_id, destination_address, amount, fees,
        token, chain, status, risk_level, auto_approve_at, nonce_used, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
      [
        withdrawalId,
        userId,
        destination_address,
        amountDecimal,
        fees,
        token,
        chain,
        status,
        riskLevel,
        autoApproveAt,
        nonce
      ]
    );

    // 13. Create audit log
    await createAuditLog({
      event_type: 'withdrawal_requested',
      user_id: userId,
      action: 'withdrawal_request',
      entity_type: 'withdrawal',
      entity_id: withdrawalId,
      changes: {
        amount: amountDecimal,
        fees,
        destination_address,
        status,
        risk_level: riskLevel
      },
      ip_address: req.ip,
      user_agent: req.get('user-agent')
    });

    await client.query('COMMIT');

    res.json({
      withdrawal_id: withdrawalId,
      status,
      amount: amountDecimal,
      fees,
      estimated_fees: fees,
      auto_approve_at: autoApproveAt?.toISOString() || null,
      risk_level: riskLevel
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Withdrawal request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
}

/**
 * Check velocity and frequency limits
 */
async function checkVelocityLimits(
  client: any,
  userId: string,
  amount: number
): Promise<{ allowed: boolean; reason?: string; retry_after?: number }> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Check count in last 24h
  const countResult = await client.query(
    `SELECT COUNT(*) as count
     FROM withdrawals
     WHERE user_id = $1 
     AND created_at >= $2
     AND status != 'rejected'`,
    [userId, oneDayAgo]
  );

  const count = parseInt(countResult.rows[0].count);
  if (count >= WITHDRAWAL_LIMITS.max_count_per_day) {
    const nextReset = new Date(oneDayAgo);
    nextReset.setDate(nextReset.getDate() + 1);
    return {
      allowed: false,
      reason: 'Maximum withdrawal count per day exceeded',
      retry_after: Math.floor((nextReset.getTime() - now.getTime()) / 1000)
    };
  }

  // Check amount in last 24h
  const amountResult = await client.query(
    `SELECT COALESCE(SUM(amount), 0) as total
     FROM withdrawals
     WHERE user_id = $1 
     AND created_at >= $2
     AND status != 'rejected'`,
    [userId, oneDayAgo]
  );

  const dailyTotal = parseFloat(amountResult.rows[0].total);
  if (dailyTotal + amount > WITHDRAWAL_LIMITS.max_amount_per_day) {
    return {
      allowed: false,
      reason: 'Maximum withdrawal amount per day exceeded'
    };
  }

  // Check minimum interval since last withdrawal
  const lastResult = await client.query(
    `SELECT created_at
     FROM withdrawals
     WHERE user_id = $1
     AND status != 'rejected'
     ORDER BY created_at DESC
     LIMIT 1`,
    [userId]
  );

  if (lastResult.rows.length > 0) {
    const lastWithdrawal = new Date(lastResult.rows[0].created_at);
    const minutesSinceLast = (now.getTime() - lastWithdrawal.getTime()) / (1000 * 60);
    
    if (minutesSinceLast < WITHDRAWAL_LIMITS.min_interval_minutes) {
      const retryAfter = WITHDRAWAL_LIMITS.min_interval_minutes - minutesSinceLast;
      return {
        allowed: false,
        reason: 'Minimum interval between withdrawals not met',
        retry_after: Math.floor(retryAfter * 60)
      };
    }
  }

  return { allowed: true };
}
```

---

## 3. WEBHOOK HANDLER (NOWPayments IPN)

```typescript
// src/controllers/webhookController.ts
import { Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { createAuditLog } from '../services/audit';

const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET!;
const NOWPAYMENTS_IP_WHITELIST = [
  '52.31.139.75',
  '52.49.173.169',
  '52.214.14.220'
];

/**
 * POST /webhooks/nowpayments
 * Handle NOWPayments IPN webhook
 */
export async function handleNOWPaymentsWebhook(req: Request, res: Response) {
  // 1. Verify source IP
  const clientIp = req.ip || req.connection.remoteAddress;
  if (!NOWPAYMENTS_IP_WHITELIST.includes(clientIp)) {
    console.error(`Webhook from unauthorized IP: ${clientIp}`);
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // 2. Verify signature
  const signature = req.headers['x-nowpayments-sig'] as string;
  if (!signature) {
    return res.status(400).json({ error: 'Missing signature' });
  }

  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha512', NOWPAYMENTS_IPN_SECRET)
    .update(payload)
    .digest('hex');

  if (signature !== expectedSignature) {
    console.error('Invalid webhook signature');
    await createAuditLog({
      event_type: 'webhook_signature_failed',
      action: 'nowpayments_webhook',
      changes: { ip: clientIp }
    });
    return res.status(403).json({ error: 'Invalid signature' });
  }

  // 3. Process webhook asynchronously (always return 200 immediately)
  processWebhookPayload(req.body).catch(error => {
    console.error('Webhook processing error:', error);
  });

  // Always return 200 to prevent NOWPayments retries
  res.status(200).json({ received: true });
}

/**
 * Process webhook payload (idempotent)
 */
async function processWebhookPayload(payload: any) {
  const {
    payment_id,
    invoice_id,
    payment_status,
    pay_address,
    actually_paid,
    pay_currency,
    price_amount,
    outcome_amount
  } = payload;

  // Only process confirmed payments
  if (payment_status !== 'confirmed') {
    console.log(`Payment ${payment_id} status: ${payment_status}, skipping`);
    return;
  }

  const client = await db.getClient();
  await client.query('BEGIN');

  try {
    // Find deposit by invoice_id
    const depositResult = await client.query(
      `SELECT deposit_id, user_id, status, confirmed_amount
       FROM deposits
       WHERE invoice_id = $1
       FOR UPDATE`,
      [invoice_id]
    );

    if (depositResult.rows.length === 0) {
      await client.query('ROLLBACK');
      console.error(`Deposit not found for invoice: ${invoice_id}`);
      return;
    }

    const deposit = depositResult.rows[0];

    // Idempotency check: if already processed, skip
    if (deposit.status === 'confirmed' && deposit.confirmed_amount) {
      await client.query('ROLLBACK');
      console.log(`Deposit ${deposit.deposit_id} already processed`);
      return;
    }

    // Validate amount
    const paidAmount = parseFloat(actually_paid);
    if (isNaN(paidAmount) || paidAmount <= 0) {
      await client.query('ROLLBACK');
      console.error(`Invalid amount for deposit ${deposit.deposit_id}: ${actually_paid}`);
      return;
    }

    // Update deposit record
    await client.query(
      `UPDATE deposits
       SET status = 'confirmed',
           confirmed_amount = $1,
           tx_hash = $2,
           confirmed_at = NOW()
       WHERE deposit_id = $3`,
      [paidAmount, payment_id, deposit.deposit_id]
    );

    // Credit user balance (atomic operation)
    // Get current balance before update
    const balanceResult = await client.query(
      `SELECT balance FROM user_balances WHERE user_id = $1 FOR UPDATE`,
      [deposit.user_id]
    );

    const balanceBefore = balanceResult.rows.length > 0 
      ? parseFloat(balanceResult.rows[0].balance) 
      : 0;

    // Update balance
    await client.query(
      `INSERT INTO user_balances (user_id, balance, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET 
         balance = user_balances.balance + $2,
         updated_at = NOW()`,
      [deposit.user_id, paidAmount]
    );

    const balanceAfter = balanceBefore + paidAmount;

    // Create ledger entry (immutable)
    const ledgerId = require('uuid').v4();
    await client.query(
      `INSERT INTO balance_ledger (
        ledger_id, user_id, amount, transaction_type,
        reference_id, balance_before, balance_after, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [
        ledgerId,
        deposit.user_id,
        paidAmount,
        'deposit',
        deposit.deposit_id,
        balanceBefore,
        balanceAfter
      ]
    );

    // Create audit log
    await createAuditLog({
      event_type: 'deposit_confirmed',
      user_id: deposit.user_id,
      action: 'deposit_confirm',
      entity_type: 'deposit',
      entity_id: deposit.deposit_id,
      changes: {
        amount: paidAmount,
        tx_hash: payment_id,
        invoice_id
      }
    });

    await client.query('COMMIT');

    // Send confirmation email (async, non-blocking)
    // sendDepositConfirmationEmail(deposit.user_id, paidAmount);

    console.log(`Deposit ${deposit.deposit_id} confirmed: ${paidAmount} ${pay_currency}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing webhook:', error);
    throw error;
  } finally {
    client.release();
  }
}
```

---

## 4. SIGNATURE VERIFICATION UTILITY

```typescript
// src/utils/signature.ts
import { recoverAddress, verifyMessage } from 'ethers';
import { tronweb } from '../services/tron';

/**
 * Verify signature for Ethereum/BSC chains
 */
export async function verifyEVMSignature(
  message: string | object,
  signature: string,
  expectedAddress: string
): Promise<boolean> {
  try {
    const messageString = typeof message === 'string' 
      ? message 
      : JSON.stringify(message);
    
    const recoveredAddress = recoverAddress(messageString, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('EVM signature verification error:', error);
    return false;
  }
}

/**
 * Verify signature for TRON
 */
export async function verifyTronSignature(
  message: string | object,
  signature: string,
  expectedAddress: string
): Promise<boolean> {
  try {
    const messageString = typeof message === 'string'
      ? message
      : JSON.stringify(message);
    
    const messageBytes = tronweb.utils.stringToHex(messageString);
    const recoveredAddress = tronweb.trx.verifyMessage(messageBytes, signature);
    return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
  } catch (error) {
    console.error('TRON signature verification error:', error);
    return false;
  }
}

/**
 * Universal signature verification
 */
export async function verifySignature(
  chain: 'ethereum' | 'tron' | 'bsc',
  message: string | object,
  signature: string,
  expectedAddress: string
): Promise<boolean> {
  if (chain === 'tron') {
    return verifyTronSignature(message, signature, expectedAddress);
  } else {
    return verifyEVMSignature(message, signature, expectedAddress);
  }
}
```

---

## 5. NONCE GENERATION SERVICE

```typescript
// src/services/nonceService.ts
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';

const NONCE_EXPIRY_MINUTES = 5;
const NONCE_CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour

/**
 * Generate and store nonce for user action
 */
export async function generateNonce(
  userId: string,
  actionType: 'deposit_init' | 'withdrawal_request' | 'address_change'
): Promise<{ nonce: string; expires_at: Date }> {
  const nonce = uuidv4();
  const expiresAt = new Date(Date.now() + NONCE_EXPIRY_MINUTES * 60 * 1000);

  await db.query(
    `INSERT INTO auth_nonces (nonce, user_id, action_type, expires_at, created_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [nonce, userId, actionType, expiresAt]
  );

  return { nonce, expires_at: expiresAt };
}

/**
 * Cleanup expired nonces (scheduled job)
 */
export async function cleanupExpiredNonces() {
  await db.query(
    `DELETE FROM auth_nonces 
     WHERE expires_at < NOW() 
     AND used_at IS NOT NULL`,
    []
  );
}

// Start cleanup job
setInterval(cleanupExpiredNonces, NONCE_CLEANUP_INTERVAL);
```

---

## 6. RATE LIMITER MIDDLEWARE

```typescript
// src/middleware/rateLimiter.ts
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
}

export function rateLimiter(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = config.keyGenerator 
      ? config.keyGenerator(req)
      : `rate_limit:${req.ip}`;
    
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, Math.ceil(config.windowMs / 1000));
    }
    
    if (current > config.maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        retry_after: Math.ceil(config.windowMs / 1000)
      });
    }
    
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, config.maxRequests - current));
    
    next();
  };
}

// Example usage
export const depositRateLimit = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5,
  keyGenerator: (req) => `rate_limit:deposit:${req.user?.userId || req.ip}`
});

export const withdrawalRateLimit = rateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 3,
  keyGenerator: (req) => `rate_limit:withdrawal:${req.user?.userId || req.ip}`
});
```

---

These examples follow security best practices:
- ✅ Atomic database operations
- ✅ Signature verification
- ✅ Nonce system prevents replay
- ✅ Rate limiting
- ✅ Input validation
- ✅ Audit logging
- ✅ Idempotent processing
- ✅ Balance reservation for withdrawals

