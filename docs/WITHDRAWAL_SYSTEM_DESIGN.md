# Withdrawal System Design
## Secure Withdrawal Flow Implementation

**Security-First Architecture** - All withdrawals are backend-controlled with multiple validation layers.

---

## 🔒 SECURITY REQUIREMENTS

### Backend Validation (MOST CRITICAL)
All validation MUST happen on the backend. Frontend validation is for UX only.

1. **Balance Check**
   - Verify user has sufficient balance
   - Check reserved balance (bets in progress)
   - Atomic balance deduction

2. **Velocity Limits**
   - Max withdrawals per day (e.g., 3)
   - Cooldown period between withdrawals (e.g., 60 minutes)
   - Track per-user withdrawal frequency

3. **Abnormal Behavior Detection**
   - Unusual withdrawal patterns
   - Multiple failed attempts
   - Address changes
   - Velocity spikes

4. **Daily Caps**
   - Per-user daily limit (e.g., 45 USDT)
   - Track cumulative daily withdrawals
   - Reset at midnight UTC

5. **Address Validation**
   - Format validation (chain-specific)
   - Blacklist checks
   - New address warnings

---

## 📋 WITHDRAWAL FLOW

### Step 1: User Initiates Request (Frontend)
```
User enters:
- Amount (must be ≤ 15 USDT per request - HIDDEN LIMIT)
- Destination address
- Chain/Network
- Signs authentication message (not transaction!)
```

### Step 2: Backend Validation
```javascript
// Backend checks (ALL MUST PASS):
1. Balance sufficient?
2. Amount within limits? (10-15 USDT)
3. Daily limit not exceeded?
4. Velocity limit not exceeded?
5. Cooldown period passed?
6. Address format valid?
7. Address not blacklisted?
8. No abnormal behavior flags?
9. Signature valid?
10. Nonce valid and not reused?
```

### Step 3: Queue Withdrawal
```
- Create withdrawal record
- Status: 'pending_auto' or 'pending_manual'
- Set auto-approval timestamp (if applicable)
- Deduct balance atomically
- Log audit event
```

### Step 4: Approval Logic

#### Small Withdrawals (≤ 10 USDT)
- Status: `pending_auto`
- Auto-approval delay: 2 hours
- After delay: Automatically approve
- Send to wallet service for processing

#### Large Withdrawals (10-15 USDT)
- Status: `pending_manual`
- Manual approval required
- Admin notification sent
- Processing delay: 24 hours after approval
- Admin can approve/reject with reason

### Step 5: Wallet Service Processing
```
- Isolated wallet service (separate from main backend)
- Reads approved withdrawals from queue
- Signs transactions with hot wallet
- Sends to blockchain
- Updates withdrawal status
- Records transaction hash
```

### Step 6: Completion
```
- Status: 'completed'
- Transaction hash recorded
- User notification sent
- Audit log finalized
```

---

## 🗄️ DATABASE SCHEMA

### `withdrawals` Table
```sql
CREATE TABLE withdrawals (
  withdrawal_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id),
  amount DECIMAL(18, 8) NOT NULL,
  token VARCHAR(10) NOT NULL,
  chain VARCHAR(20) NOT NULL,
  destination_address VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL, -- pending_auto, pending_manual, approved, rejected, completed, failed
  risk_level VARCHAR(10), -- low, medium, high
  requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
  auto_approve_at TIMESTAMP,
  approved_at TIMESTAMP,
  approved_by UUID REFERENCES admins(admin_id),
  rejected_at TIMESTAMP,
  rejected_by UUID REFERENCES admins(admin_id),
  rejection_reason TEXT,
  completed_at TIMESTAMP,
  tx_hash VARCHAR(255),
  nonce_used VARCHAR(255) NOT NULL,
  signature TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
CREATE INDEX idx_withdrawals_requested_at ON withdrawals(requested_at);
CREATE INDEX idx_withdrawals_auto_approve_at ON withdrawals(auto_approve_at) WHERE status = 'pending_auto';
```

### `withdrawal_limits` Table (Per User Tracking)
```sql
CREATE TABLE withdrawal_limits (
  user_id UUID PRIMARY KEY REFERENCES users(user_id),
  daily_withdrawn DECIMAL(18, 8) DEFAULT 0,
  daily_request_count INT DEFAULT 0,
  last_withdrawal_at TIMESTAMP,
  last_reset_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 🔐 API ENDPOINTS

### POST `/api/withdrawals/nonce`
Request nonce for withdrawal signature.

**Response:**
```json
{
  "nonce": "uuid-v4",
  "expiresAt": "2024-01-01T12:00:00Z"
}
```

### POST `/api/withdrawals/request`
Submit withdrawal request.

**Request:**
```json
{
  "address": "T...",
  "amount": 15.00,
  "token": "USDT",
  "chain": "tron",
  "signature": "0x...",
  "nonce": "uuid-v4"
}
```

**Response (Success):**
```json
{
  "withdrawalId": "uuid",
  "status": "pending_auto",
  "autoApproveAt": "2024-01-01T14:00:00Z",
  "message": "Withdrawal request submitted"
}
```

**Response (Error):**
```json
{
  "error": "Insufficient balance",
  "code": "INSUFFICIENT_BALANCE"
}
```

### GET `/api/withdrawals/limits`
Get user's withdrawal limits.

**Response:**
```json
{
  "minAmount": 10,
  "maxAmount": 15,
  "dailyLimit": 45,
  "dailyUsed": 15,
  "dailyRemaining": 30,
  "velocityLimit": 3,
  "velocityUsed": 1,
  "cooldownMinutes": 60,
  "token": "USDT"
}
```

### GET `/api/withdrawals/history`
Get user's withdrawal history.

**Response:**
```json
{
  "withdrawals": [
    {
      "id": "uuid",
      "status": "completed",
      "amount": 15,
      "token": "USDT",
      "chain": "tron",
      "destinationAddress": "T...",
      "requestedAt": "2024-01-01T12:00:00Z",
      "completedAt": "2024-01-01T14:05:00Z",
      "txHash": "0x..."
    }
  ]
}
```

### GET `/api/withdrawals/:withdrawalId`
Get withdrawal status.

---

## ⚙️ BACKEND VALIDATION LOGIC

```javascript
async function validateWithdrawal(userId, amount, address, chain, nonce, signature) {
  // 1. Validate nonce
  const nonceValid = await validateNonce(nonce, userId);
  if (!nonceValid) throw new Error('Invalid or expired nonce');

  // 2. Verify signature
  const addressMatches = await verifySignature(signature, nonce, userId);
  if (!addressMatches) throw new Error('Invalid signature');

  // 3. Check balance
  const balance = await getBalance(userId);
  const reservedBalance = await getReservedBalance(userId);
  if (amount > balance - reservedBalance) {
    throw new Error('Insufficient balance');
  }

  // 4. Validate amount limits
  if (amount < 10 || amount > 15) {
    throw new Error('Amount must be between 10 and 15 USDT');
  }

  // 5. Check daily limit
  const limits = await getUserLimits(userId);
  if (limits.dailyUsed + amount > limits.dailyLimit) {
    throw new Error('Daily withdrawal limit exceeded');
  }

  // 6. Check velocity limit
  if (limits.velocityUsed >= limits.velocityLimit) {
    throw new Error('Maximum withdrawals per day reached');
  }

  // 7. Check cooldown
  if (limits.lastWithdrawalAt) {
    const cooldownMs = limits.cooldownMinutes * 60 * 1000;
    const timeSinceLast = Date.now() - limits.lastWithdrawalAt.getTime();
    if (timeSinceLast < cooldownMs) {
      const remaining = Math.ceil((cooldownMs - timeSinceLast) / 60000);
      throw new Error(`Cooldown period active. Try again in ${remaining} minutes`);
    }
  }

  // 8. Validate address format
  if (!validateAddressFormat(address, chain)) {
    throw new Error('Invalid address format');
  }

  // 9. Check blacklist
  if (await isBlacklisted(address)) {
    throw new Error('Address is blacklisted');
  }

  // 10. Check abnormal behavior
  const riskLevel = await assessRisk(userId, amount, address);
  if (riskLevel === 'high') {
    // Require manual approval for high-risk
    return { requiresManualApproval: true, riskLevel };
  }

  return { requiresManualApproval: false, riskLevel };
}
```

---

## 🔄 AUTO-APPROVAL SERVICE

Background service that processes auto-approved withdrawals:

```javascript
async function processAutoApprovals() {
  const pendingAuto = await db.query(`
    SELECT * FROM withdrawals
    WHERE status = 'pending_auto'
    AND auto_approve_at <= NOW()
    ORDER BY auto_approve_at ASC
    LIMIT 10
  `);

  for (const withdrawal of pendingAuto) {
    await approveWithdrawal(withdrawal.withdrawal_id, null); // null = system approval
    await sendToWalletService(withdrawal);
  }
}
```

---

## 💼 WALLET SERVICE (ISOLATED)

Separate service that handles blockchain transactions:

```javascript
// Wallet Service (Separate Process/Container)
class WalletService {
  async processWithdrawal(withdrawal) {
    // 1. Verify withdrawal is approved
    if (withdrawal.status !== 'approved') {
      throw new Error('Withdrawal not approved');
    }

    // 2. Check hot wallet balance
    const hotWalletBalance = await getHotWalletBalance(withdrawal.chain, withdrawal.token);
    if (hotWalletBalance < withdrawal.amount) {
      // Alert admin, pause processing
      await alertLowBalance();
      throw new Error('Insufficient hot wallet balance');
    }

    // 3. Sign transaction (HSM or encrypted key storage)
    const tx = await signTransaction({
      to: withdrawal.destination_address,
      amount: withdrawal.amount,
      token: withdrawal.token,
      chain: withdrawal.chain
    });

    // 4. Broadcast transaction
    const txHash = await broadcastTransaction(tx, withdrawal.chain);

    // 5. Update withdrawal record
    await updateWithdrawal(withdrawal.withdrawal_id, {
      status: 'completed',
      tx_hash: txHash,
      completed_at: new Date()
    });

    // 6. Log transaction
    await logTransaction(withdrawal, txHash);

    return txHash;
  }
}
```

---

## 🚨 ERROR HANDLING

### Common Errors:
- `INSUFFICIENT_BALANCE` - User doesn't have enough balance
- `DAILY_LIMIT_EXCEEDED` - Daily withdrawal limit reached
- `VELOCITY_LIMIT_EXCEEDED` - Too many withdrawals today
- `COOLDOWN_ACTIVE` - Must wait before next withdrawal
- `INVALID_ADDRESS` - Address format invalid
- `BLACKLISTED_ADDRESS` - Address is blacklisted
- `HIGH_RISK` - Requires manual approval
- `INVALID_SIGNATURE` - Signature verification failed
- `NONCE_EXPIRED` - Nonce expired or already used

---

## 📊 MONITORING & ALERTS

### Key Metrics:
- Pending withdrawals count
- Average processing time
- Failed withdrawals rate
- Hot wallet balance
- Daily withdrawal volume
- Velocity limit breaches

### Alerts:
- Hot wallet balance < threshold
- High-risk withdrawal detected
- Abnormal withdrawal pattern
- Wallet service errors
- Failed transaction broadcasts

---

## ✅ SECURITY CHECKLIST

- [ ] All validation happens on backend
- [ ] Atomic balance updates (database transactions)
- [ ] Nonce system for replay protection
- [ ] Signature verification for all requests
- [ ] Rate limiting on withdrawal endpoints
- [ ] Wallet service isolated from main backend
- [ ] Private keys never in main backend
- [ ] Hot wallet has limited funds
- [ ] Cold wallet for reserves
- [ ] Audit logs for all withdrawals
- [ ] Manual approval for high-risk withdrawals
- [ ] Daily limits enforced
- [ ] Velocity limits enforced
- [ ] Cooldown periods enforced
- [ ] Address blacklist checking
- [ ] Abnormal behavior detection
- [ ] Transaction monitoring
- [ ] Error handling and logging
- [ ] Admin notifications for manual approvals

---

**Remember: This system handles REAL MONEY. Security is not optional!**

