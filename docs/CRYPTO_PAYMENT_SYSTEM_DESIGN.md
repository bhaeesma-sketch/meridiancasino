# Production-Ready Crypto Payment System Design
## Casino Deposit & Withdrawal System

**Security-First Architecture** - Assume active attackers, bots, and insider threats.

---

## 1. SECURE DEPOSIT FLOW

### Flow Diagram (Text Description)

```
[USER FRONTEND]
    ↓
1. User connects wallet (MetaMask/TronLink/WalletConnect)
2. Frontend detects chain ID and validates supported chain
3. User initiates deposit request
    ↓
[SECURITY LAYER]
    ↓
4. Frontend requests nonce from backend (GET /auth/nonce)
5. Backend generates unique nonce, stores with expiry (5min)
6. Frontend prompts user to sign message:
   {
     nonce: "uuid-v4",
     timestamp: UnixTimestamp,
     action: "deposit_init",
     amount: 0, // No amount in signature for deposits
     expiry: UnixTimestamp + 300
   }
7. User signs message with wallet
    ↓
[BACKEND API]
    ↓
8. Frontend sends deposit request (POST /deposits/initiate)
   {
     address: userWalletAddress,
     chain: "ethereum" | "tron" | "bsc",
     token: "USDT" | "USDC" | "TRX",
     amount: null, // Amount determined by actual transfer
     signature: signedMessage,
     nonce: nonceFromStep5
   }
9. Backend validates:
   - Nonce exists and not expired
   - Signature matches address (recover/recoverTron)
   - Chain is supported
   - Nonce not reused (mark as used immediately)
10. Backend creates NOWPayments invoice:
    - Generate unique invoice_id
    - Request deposit address from NOWPayments API
    - Map: user_id → chain → address → invoice_id
11. Backend stores pending deposit record:
    {
      deposit_id: UUID,
      user_id: userId,
      invoice_id: nowPaymentsInvoiceId,
      deposit_address: addressFromNOWPayments,
      chain: chainType,
      token: tokenType,
      expected_amount_min: null, // No expected amount for deposits
      status: "pending",
      created_at: timestamp,
      nonce_used: nonceFromStep5
    }
12. Backend returns deposit_address to frontend
    ↓
[USER ACTION]
    ↓
13. User sends crypto to deposit_address via their wallet
14. Transaction broadcast to blockchain
    ↓
[NOWPAYMENTS WEBHOOK (ONLY SOURCE OF TRUTH)]
    ↓
15. NOWPayments detects transaction on blockchain
16. NOWPayments waits for required confirmations:
    - Ethereum: 12 confirmations
    - BSC: 20 confirmations
    - TRON: 20 confirmations
17. NOWPayments sends IPN webhook to backend:
    POST /webhooks/nowpayments
    {
      payment_id: string,
      invoice_id: string, // Maps to our deposit_id
      payment_status: "confirmed",
      pay_address: deposit_address,
      price_amount: decimal,
      price_currency: "USD",
      pay_amount: decimal,
      pay_currency: "USDT",
      actually_paid: decimal, // Actual amount received
      order_id: string,
      outcome_amount: decimal,
      outcome_currency: "USD"
    }
    + IPN signature for verification
    ↓
[BACKEND WEBHOOK HANDLER]
    ↓
18. Backend validates webhook:
    - Verify IPN signature with NOWPayments secret
    - Verify request from NOWPayments IP whitelist
    - Check invoice_id exists in pending deposits
    - Ensure payment_status = "confirmed"
    - Verify actually_paid > 0
19. Backend performs idempotent deposit processing:
    - Check if deposit_id already processed (database constraint)
    - Start database transaction
    - Update deposit record:
      status = "confirmed"
      confirmed_amount = actually_paid
      confirmed_at = timestamp
      tx_hash = payment_id
    - Credit user balance atomically:
      INSERT INTO balance_ledger
      (
        ledger_id,
        user_id,
        amount,
        transaction_type,
        reference_id,
        created_at
      )
      VALUES
      (
        UUID(),
        userId,
        actually_paid,
        'deposit',
        deposit_id,
        NOW()
      )
    - Update user balance (atomic operation):
      UPDATE user_balances
      SET balance = balance + actually_paid,
          updated_at = NOW()
      WHERE user_id = userId
    - Commit transaction
20. Backend logs audit entry (immutable)
21. Backend sends confirmation email to user
22. Backend returns 200 OK to NOWPayments

[FALLBACK: If webhook fails]
23. Backend has scheduled job (every 5 minutes):
    - Poll NOWPayments API for pending invoices
    - Check blockchain directly for confirmations
    - Process any confirmed deposits
```

**CRITICAL SECURITY POINTS:**
- ✅ Frontend cannot trigger balance credit
- ✅ Only NOWPayments webhook confirms deposits
- ✅ All balance updates are atomic database transactions
- ✅ Nonces prevent replay attacks
- ✅ Signature verification proves wallet ownership
- ✅ Idempotent processing prevents double credits

---

## 2. SECURE WITHDRAWAL FLOW

### Flow Diagram (Text Description)

```
[USER FRONTEND]
    ↓
1. User connects wallet (must be same address used for deposits)
2. Frontend requests withdrawal form (GET /withdrawals/initiate)
3. Backend returns:
   - Available balance
   - Pending withdrawals
   - Withdrawal limits
   - Estimated fees
4. User enters:
   - Withdrawal address (must match connected wallet OR new verification)
   - Amount
   - Token type
    ↓
[SECURITY LAYER]
    ↓
5. Frontend requests nonce from backend (GET /auth/nonce)
6. Backend generates unique nonce with expiry
7. Frontend prompts user to sign message:
   {
     nonce: "uuid-v4",
     timestamp: UnixTimestamp,
     action: "withdrawal_request",
     amount: withdrawalAmount, // Amount IN signature
     destination: withdrawalAddress,
     expiry: UnixTimestamp + 300
   }
8. User signs message with wallet
    ↓
[BACKEND API - VALIDATION LAYER]
    ↓
9. Frontend submits withdrawal request:
   POST /withdrawals/request
   {
     destination_address: string,
     amount: decimal,
     token: "USDT" | "USDC" | "TRX",
     chain: "ethereum" | "tron" | "bsc",
     signature: signedMessage,
     nonce: nonceFromStep6
   }
10. Backend performs comprehensive validation:
    [A] Authentication & Authorization:
        - Verify nonce exists and not expired
        - Recover address from signature
        - Verify recovered address = user.wallet_address
        - Check nonce not reused (atomic check-and-set)
    
    [B] Address Validation:
        - Validate address format for chain
        - Check address is not blacklisted
        - For new addresses: require additional verification
        - Verify destination address != deposit address
    
    [C] Amount Validation:
        - amount > 0
        - amount >= minimum_withdrawal (chain-specific)
        - amount <= daily_withdrawal_limit - daily_withdrawn
        - amount <= available_balance
        - Include network fees in calculation
    
    [D] Balance Verification:
        - Start database transaction (SERIALIZABLE isolation)
        - Lock user row: SELECT ... FOR UPDATE
        - Verify current balance >= (amount + fees)
        - Verify no pending withdrawals would exceed balance
    
    [E] Velocity & Frequency Checks:
        - Check withdrawal count in last 24h < max_per_day
        - Check withdrawal amount in last 24h < max_amount_per_day
        - Check time since last withdrawal > min_interval
        - Check user account age > minimum (prevent new account abuse)
    
    [F] Risk Assessment:
        - Query user activity patterns
        - Check for anomalies (sudden large withdrawal)
        - Flag if amount > risk_threshold for manual review
        - Check user is not flagged for suspicious activity
        ↓
[BACKEND - WITHDRAWAL PROCESSING]
    ↓
11. Backend creates withdrawal record:
    - Start database transaction
    - Reserve balance:
      UPDATE user_balances
      SET balance = balance - (amount + fees),
          reserved_balance = reserved_balance + (amount + fees)
      WHERE user_id = userId
    - Create withdrawal record:
      INSERT INTO withdrawals
      (
        withdrawal_id,
        user_id,
        destination_address,
        amount,
        fees,
        token,
        chain,
        status, // "pending_approval" or "pending_auto"
        risk_level, // "low" | "medium" | "high"
        auto_approve_at, // NULL for manual, or timestamp for auto
        created_at
      )
    - Log audit entry
    - Commit transaction
    
12. Backend determines approval path:
    
    [AUTOMATIC APPROVAL PATH]
    IF amount <= auto_approval_limit (e.g., $100)
       AND risk_level = "low"
       AND velocity_checks_pass
       AND account_age > 7_days:
        - Set status = "pending_auto"
        - Set auto_approve_at = NOW() + delay_period (e.g., 2 hours)
        - Send email notification to user
        - Schedule approval job
    
    [MANUAL APPROVAL PATH]
    ELSE:
        - Set status = "pending_approval"
        - Set risk_level based on amount/patterns
        - Notify admin team via secure channel
        - Alert system if amount > alert_threshold
        - Hold withdrawal for manual review
        ↓
[APPROVAL PROCESS]
    ↓
13. [AUTOMATIC] Scheduled job runs every minute:
    - Query withdrawals WHERE status = "pending_auto" 
      AND auto_approve_at <= NOW()
    - For each withdrawal:
      - Re-validate all checks (balance, limits, etc.)
      - If still valid: change status to "approved"
      - Trigger withdrawal execution
    
    [MANUAL] Admin reviews via secure admin panel:
    - Admin authenticates with MFA
    - Admin reviews withdrawal details
    - Admin checks user history, patterns
    - Admin approves/rejects via signed action
    - System logs admin action with audit trail
    - If approved: status = "approved"
    ↓
[WALLET SERVICE (ISOLATED)]
    ↓
14. Approved withdrawals queued for execution:
    - Status changed to "queued"
    - Withdrawals sorted by priority (FIFO, with VIP priority)
    - Batch processing (group by chain/token for efficiency)
    
15. Wallet Service receives withdrawal batch:
    POST http://wallet-service/internal/withdrawals/execute
    {
      withdrawals: [
        {
          withdrawal_id: UUID,
          destination: address,
          amount: decimal,
          token: string,
          chain: string
        }
      ]
    }
    (Authenticated via internal service-to-service auth)
    
16. Wallet Service validates:
    - Request comes from API service (mTLS or service token)
    - Hot wallet has sufficient balance
    - Each withdrawal still valid (double-check)
    
17. Wallet Service constructs transactions:
    - For each withdrawal:
      - Calculate exact network fees
      - Build transaction payload
      - Sign transaction (using encrypted keys or HSM)
      - Generate transaction hash
    
18. Wallet Service broadcasts transactions:
    - Send to blockchain network
    - Track transaction IDs
    - Monitor for confirmations
    
19. Wallet Service updates withdrawal status:
    - Update status = "processing"
    - Store tx_hash
    - Store broadcast timestamp
    
20. Wallet Service monitors confirmations:
    - Poll blockchain for transaction status
    - Wait for required confirmations
    - On confirmation:
      - Update status = "completed"
      - Release reserved balance:
        UPDATE user_balances
        SET reserved_balance = reserved_balance - (amount + fees)
        WHERE user_id = userId
      - Log completion audit entry
      - Send confirmation email to user
    
21. Wallet Service handles failures:
    - If transaction fails/reverts:
      - Update status = "failed"
      - Refund reserved balance to available balance
      - Notify user and admin
      - Log failure reason
    - If timeout (stuck transaction):
      - Attempt to resubmit with higher gas (EVM)
      - Or mark for manual investigation
    
[POST-COMPLETION]
    ↓
22. System logs immutable audit entry
23. User receives confirmation
24. Admin dashboard updated
25. Reporting system updated
```

**CRITICAL SECURITY POINTS:**
- ✅ No direct wallet connections from frontend
- ✅ Multi-layer validation (amount, balance, velocity, risk)
- ✅ Automatic holds for suspicious withdrawals
- ✅ Delayed auto-approval prevents instant cash-out abuse
- ✅ Manual approval for large amounts
- ✅ Isolated wallet service (no keys in main backend)
- ✅ Atomic balance operations prevent double-spending
- ✅ Reserved balance prevents balance race conditions
- ✅ Transaction monitoring and failure handling

---

## 3. BACKEND ARCHITECTURE

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERNET / BLOCKCHAIN                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
┌───────▼────────┐          ┌─────────▼─────────┐
│   NOWPayments  │          │  Blockchain Nodes │
│   Webhook IPN  │          │  (Ethereum/TRON)  │
└───────┬────────┘          └─────────┬─────────┘
        │                             │
        │                             │
┌───────▼─────────────────────────────▼─────────┐
│           API GATEWAY / LOAD BALANCER          │
│  - Rate Limiting                               │
│  - DDoS Protection                             │
│  - SSL/TLS Termination                         │
└───────┬───────────────────────────────────────┘
        │
┌───────▼───────────────────────────────────────┐
│              API SERVICE (Main Backend)        │
│  ┌─────────────────────────────────────────┐  │
│  │  REST API Endpoints                     │  │
│  │  - /auth/*                              │  │
│  │  - /deposits/*                          │  │
│  │  - /withdrawals/*                       │  │
│  │  - /balance/*                           │  │
│  │  - /webhooks/*                          │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │  Business Logic                         │  │
│  │  - Validation                           │  │
│  │  - Balance Management                   │  │
│  │  - Risk Assessment                      │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │  Database Access Layer                  │  │
│  └─────────────────────────────────────────┘  │
└───────┬───────────────────────────────────────┘
        │
        │ (Internal Network - No Internet Access)
        │
┌───────▼───────────────────────────────────────┐
│         DATABASE CLUSTER (PostgreSQL)          │
│  ┌─────────────────────────────────────────┐  │
│  │  Primary Database                       │  │
│  │  - Users                                │  │
│  │  - Deposits                             │  │
│  │  - Withdrawals                          │  │
│  │  - Balance Ledger (immutable)           │  │
│  │  - Audit Logs (immutable)               │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │  Replica Database (Read-only)           │  │
│  └─────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│       WALLET SERVICE (Isolated Service)       │
│  ┌─────────────────────────────────────────┐  │
│  │  - Transaction Construction             │  │
│  │  - Transaction Signing                  │  │
│  │  - Blockchain Interaction               │  │
│  │  - Confirmation Monitoring              │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │  Key Management                         │  │
│  │  - Encrypted Key Storage                │  │
│  │  - Or HSM Integration                   │  │
│  └─────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────┐  │
│  │  Hot Wallet                             │  │
│  │  - Limited funds only                   │  │
│  │  - Auto-replenish from cold wallet      │  │
│  └─────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘
        │
        │ (Automated, Scheduled)
        │
┌───────▼───────────────────────────────────────┐
│         COLD WALLET (Multisig)                │
│  - Stores majority of funds                   │
│  - Requires M-of-N signatures                 │
│  - Manual or scheduled replenishment only     │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│         ADMIN SERVICE (VPN-Only)              │
│  ┌─────────────────────────────────────────┐  │
│  │  - IP Allowlist                         │  │
│  │  - Hardware MFA Required                │  │
│  │  - Withdrawal Approval                  │  │
│  │  - Audit Log Viewer                     │  │
│  │  - Alert Dashboard                      │  │
│  └─────────────────────────────────────────┘  │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│         MONITORING & ALERTING                 │
│  - Withdrawal spike alerts                    │
│  - Balance mismatch detection                 │
│  - Failed webhook alerts                      │
│  - Anomaly detection                          │
└───────────────────────────────────────────────┘
```

### Database Schema (Key Tables)

```sql
-- Users
CREATE TABLE users (
    user_id UUID PRIMARY KEY,
    wallet_address VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMP,
    account_status VARCHAR(50) DEFAULT 'active', -- active, suspended, frozen
    kyc_status VARCHAR(50) DEFAULT 'pending',
    INDEX idx_wallet_address (wallet_address)
);

-- Balance Management
CREATE TABLE user_balances (
    user_id UUID PRIMARY KEY,
    balance DECIMAL(36, 18) NOT NULL DEFAULT 0,
    reserved_balance DECIMAL(36, 18) NOT NULL DEFAULT 0, -- For pending withdrawals
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Immutable Balance Ledger (Append-only)
CREATE TABLE balance_ledger (
    ledger_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    amount DECIMAL(36, 18) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL, -- deposit, withdrawal, game_win, game_loss, adjustment
    reference_id UUID, -- Links to deposit_id, withdrawal_id, etc.
    balance_before DECIMAL(36, 18) NOT NULL,
    balance_after DECIMAL(36, 18) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    metadata JSONB, -- Additional context
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_user_id_created (user_id, created_at),
    INDEX idx_reference_id (reference_id)
);

-- Nonce Management (Prevent Replay)
CREATE TABLE auth_nonces (
    nonce UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_user_expires (user_id, expires_at),
    INDEX idx_used (used_at)
);

-- Deposits
CREATE TABLE deposits (
    deposit_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    invoice_id VARCHAR(255) NOT NULL UNIQUE, -- NOWPayments invoice ID
    deposit_address VARCHAR(255) NOT NULL,
    chain VARCHAR(50) NOT NULL,
    token VARCHAR(50) NOT NULL,
    expected_amount_min DECIMAL(36, 18) NULL,
    confirmed_amount DECIMAL(36, 18) NULL,
    status VARCHAR(50) NOT NULL, -- pending, confirmed, failed, expired
    tx_hash VARCHAR(255) NULL,
    nonce_used UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (nonce_used) REFERENCES auth_nonces(nonce),
    INDEX idx_user_status (user_id, status),
    INDEX idx_invoice_id (invoice_id),
    INDEX idx_status_created (status, created_at)
);

-- Withdrawals
CREATE TABLE withdrawals (
    withdrawal_id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    destination_address VARCHAR(255) NOT NULL,
    amount DECIMAL(36, 18) NOT NULL,
    fees DECIMAL(36, 18) NOT NULL,
    token VARCHAR(50) NOT NULL,
    chain VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL, -- pending_approval, pending_auto, approved, queued, processing, completed, failed, rejected
    risk_level VARCHAR(50) NOT NULL, -- low, medium, high
    tx_hash VARCHAR(255) NULL,
    auto_approve_at TIMESTAMP NULL,
    approved_by UUID NULL, -- Admin user_id if manually approved
    approved_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    failure_reason TEXT NULL,
    nonce_used UUID NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (nonce_used) REFERENCES auth_nonces(nonce),
    INDEX idx_user_status (user_id, status),
    INDEX idx_status_auto_approve (status, auto_approve_at),
    INDEX idx_created_at (created_at)
);

-- Audit Logs (Immutable)
CREATE TABLE audit_logs (
    log_id UUID PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    user_id UUID NULL,
    admin_id UUID NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    changes JSONB NOT NULL, -- Before/after state
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    INDEX idx_created_at (created_at),
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type)
);
```

---

## 4. API ENDPOINT STRUCTURE

### Authentication Endpoints

```
GET  /auth/nonce
    Query: ?action=deposit_init|withdrawal_request
    Response: { nonce: UUID, expires_at: ISO8601 }

POST /auth/verify-signature
    Body: {
      address: string,
      message: string,
      signature: string,
      nonce: UUID
    }
    Response: { valid: boolean, token?: JWT }
```

### Deposit Endpoints

```
POST /deposits/initiate
    Headers: Authorization: Bearer JWT
    Body: {
      chain: "ethereum" | "tron" | "bsc",
      token: "USDT" | "USDC" | "TRX",
      signature: string,
      nonce: UUID
    }
    Response: {
      deposit_id: UUID,
      deposit_address: string,
      qr_code: string,
      chain: string,
      token: string,
      expiry_minutes: number
    }

GET  /deposits/:deposit_id/status
    Headers: Authorization: Bearer JWT
    Response: {
      deposit_id: UUID,
      status: "pending" | "confirmed" | "failed",
      amount: decimal,
      confirmations: number,
      required_confirmations: number
    }

GET  /deposits/history
    Headers: Authorization: Bearer JWT
    Query: ?limit=50&offset=0
    Response: { deposits: [...], total: number }
```

### Withdrawal Endpoints

```
POST /withdrawals/request
    Headers: Authorization: Bearer JWT
    Body: {
      destination_address: string,
      amount: decimal,
      token: "USDT" | "USDC" | "TRX",
      chain: "ethereum" | "tron" | "bsc",
      signature: string,
      nonce: UUID
    }
    Response: {
      withdrawal_id: UUID,
      status: "pending_approval" | "pending_auto",
      estimated_fees: decimal,
      auto_approve_at: ISO8601 | null
    }

GET  /withdrawals/:withdrawal_id/status
    Headers: Authorization: Bearer JWT
    Response: {
      withdrawal_id: UUID,
      status: string,
      tx_hash: string | null,
      confirmations: number | null
    }

GET  /withdrawals/history
    Headers: Authorization: Bearer JWT
    Query: ?limit=50&offset=0&status=pending_approval
    Response: { withdrawals: [...], total: number }

DELETE /withdrawals/:withdrawal_id/cancel
    Headers: Authorization: Bearer JWT
    Response: { success: boolean }
    Note: Only cancellable if status = pending_approval
```

### Balance Endpoints

```
GET  /balance
    Headers: Authorization: Bearer JWT
    Response: {
      available: decimal,
      reserved: decimal, // For pending withdrawals
      total: decimal
    }

GET  /balance/ledger
    Headers: Authorization: Bearer JWT
    Query: ?limit=100&offset=0&type=deposit
    Response: { transactions: [...], total: number }
```

### Webhook Endpoints

```
POST /webhooks/nowpayments
    Headers: 
      X-NowPayments-Sig: signature
      Content-Type: application/json
    Body: NOWPayments IPN payload
    Response: 200 OK (always, to prevent retries on validation errors)
    Note: 
      - Verify IPN signature
      - Verify source IP is NOWPayments whitelist
      - Process asynchronously
```

### Internal Service Endpoints (No Public Access)

```
POST /internal/withdrawals/execute
    Headers: X-Internal-Service-Token: secret
    Body: { withdrawals: [...] }
    Note: Called by wallet service

GET  /internal/deposits/pending
    Headers: X-Internal-Service-Token: secret
    Query: ?chain=ethereum
    Note: Polling fallback for NOWPayments webhooks
```

---

## 5. SECURITY CHECKLIST

### ✅ Authentication & Authorization
- [ ] All endpoints require valid JWT token (except public endpoints)
- [ ] Nonce-based authentication prevents replay attacks
- [ ] Signature verification for sensitive actions
- [ ] Rate limiting per IP and per user
- [ ] Account lockout after failed attempts
- [ ] Session timeout and refresh token rotation

### ✅ Input Validation
- [ ] Strict type validation for all inputs
- [ ] Address format validation per chain
- [ ] Amount bounds checking (min/max)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection for state-changing operations

### ✅ Deposit Security
- [ ] Only NOWPayments webhooks can confirm deposits
- [ ] Webhook signature verification mandatory
- [ ] IP whitelist for webhook source
- [ ] Idempotent deposit processing (database constraints)
- [ ] Atomic balance updates (database transactions)
- [ ] Required confirmations before crediting
- [ ] Unique deposit addresses per user per chain
- [ ] Deposit expiry handling

### ✅ Withdrawal Security
- [ ] Multi-layer validation (amount, balance, velocity, risk)
- [ ] Atomic balance reservation (FOR UPDATE locks)
- [ ] Reserved balance prevents double-spending
- [ ] Automatic holds for suspicious withdrawals
- [ ] Delayed auto-approval for small withdrawals
- [ ] Manual approval required for large withdrawals
- [ ] No direct wallet connections from frontend
- [ ] Isolated wallet service (separate deployment)
- [ ] Daily withdrawal limits enforced

### ✅ Wallet Security
- [ ] Hot wallet has limited funds only
- [ ] Cold wallet (multisig) for reserves
- [ ] Private keys encrypted at rest (AES-256 or HSM)
- [ ] No keys in environment variables or code
- [ ] Key rotation procedures documented
- [ ] Transaction signing isolated to wallet service
- [ ] Hot wallet auto-replenishment from cold wallet

### ✅ Database Security
- [ ] Encrypted connections (TLS)
- [ ] Row-level security where applicable
- [ ] Immutable audit logs (append-only)
- [ ] Regular backups (encrypted, tested)
- [ ] Database access limited to API service
- [ ] Sensitive data encryption at rest
- [ ] PII data minimization

### ✅ API Security
- [ ] Rate limiting (per IP, per user, per endpoint)
- [ ] Request size limits
- [ ] CORS properly configured
- [ ] Security headers (HSTS, CSP, etc.)
- [ ] API versioning
- [ ] Request/response logging (sanitized)
- [ ] Error messages don't leak sensitive info

### ✅ Infrastructure Security
- [ ] Services isolated in private network
- [ ] No direct internet access for database
- [ ] VPN required for admin access
- [ ] IP allowlist for admin panel
- [ ] MFA required for admin accounts
- [ ] Secrets management (HashiCorp Vault or AWS Secrets Manager)
- [ ] Regular security updates
- [ ] Intrusion detection system
- [ ] DDoS protection

### ✅ Monitoring & Alerts
- [ ] Withdrawal spike detection
- [ ] Balance mismatch alerts
- [ ] Failed webhook alerts
- [ ] Unusual activity detection
- [ ] Failed transaction monitoring
- [ ] Admin action auditing
- [ ] System health monitoring

### ✅ Operational Security
- [ ] Change management process
- [ ] Incident response plan
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] Bug bounty program
- [ ] Staff security training
- [ ] Access reviews (quarterly)

---

## 6. COMMON ATTACK VECTORS & DEFENSES

### 1. **Replay Attacks**
**Attack:** Attacker intercepts valid request and resubmits it.
**Defense:**
- Nonce system (one-time use, expires quickly)
- Timestamp in signed message
- Nonce marked as used atomically
- Database constraint prevents duplicate nonce usage

### 2. **Frontend Balance Manipulation**
**Attack:** Attacker modifies frontend to display fake balance or trigger fake deposits.
**Defense:**
- All balances stored server-side only
- Frontend can only query balance, never set it
- Deposits only confirmed via webhook (backend-to-backend)
- Withdrawals require backend validation and approval

### 3. **Double-Spending**
**Attack:** User initiates multiple withdrawals simultaneously.
**Defense:**
- Database row-level locks (SELECT FOR UPDATE)
- Reserved balance system
- Atomic balance operations (transactions)
- Status checks before processing each withdrawal

### 4. **Webhook Replay/Forgery**
**Attack:** Attacker sends fake webhook to credit balance.
**Defense:**
- IP whitelist (only NOWPayments IPs)
- Webhook signature verification with secret
- Idempotent processing (database constraint on invoice_id)
- Webhook payload validation

### 5. **Withdrawal Race Conditions**
**Attack:** User quickly submits multiple withdrawal requests.
**Defense:**
- Serializable transaction isolation level
- Row-level locking during validation
- Reserved balance prevents exceeding available balance
- Velocity checks (time-based limits)

### 6. **Address Poisoning**
**Attack:** User uses address similar to legitimate address.
**Defense:**
- Address format validation
- Checksum verification (EIP-55 for Ethereum)
- Address blacklist
- For new addresses: require additional verification

### 7. **Insider Attacks**
**Attack:** Admin approves fraudulent withdrawal.
**Defense:**
- Immutable audit logs (all admin actions)
- MFA required for admin accounts
- Separation of duties (approval requires multiple admins for large amounts)
- IP allowlist and VPN for admin access
- Regular access reviews

### 8. **SQL Injection**
**Attack:** Malicious SQL in user input.
**Defense:**
- Parameterized queries only
- Input validation and sanitization
- Least privilege database users
- No dynamic SQL construction

### 9. **Private Key Theft**
**Attack:** Attacker gains access to private keys.
**Defense:**
- Keys encrypted at rest (AES-256 or HSM)
- Keys never in code or environment variables
- Keys stored in isolated wallet service
- Key rotation procedures
- Cold wallet (multisig) for majority of funds

### 10. **DDoS / Rate Limit Bypass**
**Attack:** Overwhelm system with requests.
**Defense:**
- Rate limiting at API gateway
- Per-IP and per-user limits
- DDoS protection (Cloudflare/AWS Shield)
- Request throttling
- Circuit breakers

### 11. **Man-in-the-Middle**
**Attack:** Intercept requests between frontend and backend.
**Defense:**
- TLS/HTTPS for all communications
- Certificate pinning (mobile apps)
- Request signing (signature verification)
- HSTS headers

### 12. **Deposit Spam**
**Attack:** Send many small deposits to overwhelm system.
**Defense:**
- Rate limiting on deposit initiation
- Minimum deposit amounts
- Fee structure discourages micro-deposits
- Webhook processing is idempotent and efficient

### 13. **Transaction Revert Exploit**
**Attack:** Submit withdrawal, then revert blockchain transaction.
**Defense:**
- Wait for required confirmations (chain-specific)
- Monitor confirmations after broadcast
- Handle transaction failures gracefully (refund reserved balance)

### 14. **Account Takeover**
**Attack:** Gain access to user's wallet.
**Defense:**
- Signature verification (only wallet owner can sign)
- Email notifications for all transactions
- Account activity monitoring
- Suspicious activity detection

### 15. **Smart Contract Exploits**
**Attack:** Exploit vulnerabilities in token contracts.
**Defense:**
- Only whitelisted token contracts
- Regular security audits of token contracts
- Monitor for known vulnerabilities
- Have emergency pause mechanism

---

## 7. IMPLEMENTATION NOTES

### Technology Stack Recommendations

**API Service:**
- Node.js (Express/Fastify) or Python (FastAPI/Django)
- TypeScript for type safety
- PostgreSQL for database
- Redis for caching and rate limiting

**Wallet Service:**
- Go or Rust (better for crypto operations)
- web3.js / ethers.js for EVM
- tronweb for TRON
- Isolated deployment, minimal dependencies

**Admin Service:**
- Separate frontend (React/Vue)
- VPN-only access
- Hardware MFA integration

**Infrastructure:**
- Kubernetes for orchestration
- Docker containers
- Private network (VPC)
- Secrets management (Vault/AWS Secrets Manager)

### Testing Requirements

1. **Unit Tests:** All business logic
2. **Integration Tests:** API endpoints, database operations
3. **Security Tests:** Penetration testing, fuzzing
4. **Load Tests:** Handle expected transaction volume
5. **Chaos Tests:** Network failures, service downtime

### Deployment Checklist

- [ ] All secrets in secure vault (not in code/config)
- [ ] Database backups configured and tested
- [ ] Monitoring and alerts configured
- [ ] Rate limiting configured
- [ ] SSL certificates valid
- [ ] Firewall rules configured
- [ ] Admin access secured (VPN, MFA)
- [ ] Incident response plan documented
- [ ] Team trained on security procedures

---

## CONCLUSION

This system is designed with security as the primary concern. Every component has multiple layers of defense, and the system assumes attackers at every step. The isolated wallet service, atomic database operations, nonce system, and webhook-only deposit confirmation are critical security features.

**Remember:** Security is not a one-time setup. Regular audits, monitoring, and updates are essential for maintaining a secure system handling real money.

