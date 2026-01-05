# Security Quick Reference Guide
## Crypto Payment System - Critical Security Points

**⚠️ SECURITY IS PARAMOUNT - ASSUME ATTACKERS AT EVERY STEP**

---

## 🔐 CRITICAL SECURITY PRINCIPLES

### 1. **Never Trust the Frontend**
- ✅ All balances stored server-side only
- ✅ Frontend can only query, never set balances
- ✅ All validations happen on backend
- ✅ Client-side values are for display only

### 2. **Defense in Depth**
- ✅ Multiple layers of validation
- ✅ Multiple approval gates for withdrawals
- ✅ Rate limiting at multiple levels
- ✅ Monitoring and alerts at every step

### 3. **Atomic Operations**
- ✅ All balance updates in database transactions
- ✅ Use SELECT FOR UPDATE locks
- ✅ SERIALIZABLE isolation for critical operations
- ✅ Idempotent processing (handle duplicates safely)

### 4. **Isolation & Separation**
- ✅ Wallet service isolated from main API
- ✅ Private keys never in main backend
- ✅ Admin access via VPN only
- ✅ Network isolation (no direct internet for database)

---

## 🚨 CRITICAL CHECKLIST

### Before Launch:
- [ ] All secrets in secure vault (Vault/AWS Secrets Manager)
- [ ] No private keys in code or environment variables
- [ ] Database backups configured and tested
- [ ] Webhook signature verification enabled
- [ ] IP whitelist configured for webhooks
- [ ] Rate limiting configured on all endpoints
- [ ] Admin panel VPN-only access configured
- [ ] MFA enabled for all admin accounts
- [ ] Monitoring and alerts configured
- [ ] Incident response plan documented
- [ ] Security audit completed

### During Operations:
- [ ] Monitor withdrawal spikes daily
- [ ] Review failed webhooks daily
- [ ] Check balance mismatches daily
- [ ] Review audit logs weekly
- [ ] Update security patches monthly
- [ ] Conduct penetration testing quarterly
- [ ] Review access permissions quarterly

---

## ⚡ QUICK REFERENCE: DEPOSIT FLOW

```
User → Frontend → Nonce Request → Sign Message → Deposit Initiation
         ↓
Backend: Validate Nonce → Verify Signature → Create NOWPayments Invoice
         ↓
User → Send Crypto to Deposit Address
         ↓
NOWPayments → Blockchain → Confirmations → Webhook to Backend
         ↓
Backend: Verify Webhook Signature → Verify IP → Process Deposit (Atomic)
         ↓
Credit Balance (Server-Side Only)
```

**Key Points:**
- ✅ Only NOWPayments webhook confirms deposits
- ✅ Webhook signature verification mandatory
- ✅ IP whitelist for webhooks
- ✅ Atomic balance updates
- ✅ Idempotent processing

---

## ⚡ QUICK REFERENCE: WITHDRAWAL FLOW

```
User → Frontend → Nonce Request → Sign Message (with amount) → Withdrawal Request
         ↓
Backend: Validate Nonce → Verify Signature → Validate Amount → Lock Balance → 
         Check Velocity → Assess Risk → Reserve Balance (Atomic)
         ↓
[Auto-Approval Path] IF amount <= $100 AND risk = low:
    → Delay 2 hours → Auto-approve → Queue
[Manual Approval Path] ELSE:
    → Notify Admin → Manual Review → Approve/Reject
         ↓
Wallet Service: Receive Batch → Validate → Construct TX → Sign → Broadcast
         ↓
Monitor Confirmations → Update Status → Release Reserved Balance
```

**Key Points:**
- ✅ Multi-layer validation
- ✅ Atomic balance reservation (FOR UPDATE lock)
- ✅ Velocity checks (time-based limits)
- ✅ Risk assessment
- ✅ Delayed auto-approval prevents abuse
- ✅ Manual approval for large amounts
- ✅ Isolated wallet service

---

## 🛡️ ATTACK PREVENTION MATRIX

| Attack Vector | Defense Mechanism |
|--------------|-------------------|
| Replay Attack | Nonce system (one-time use, expires quickly) |
| Frontend Balance Manipulation | Server-side balances only, never trust frontend |
| Double-Spending | Row-level locks, reserved balance, atomic operations |
| Webhook Forgery | Signature verification, IP whitelist, idempotent processing |
| Withdrawal Race Conditions | Serializable isolation, FOR UPDATE locks, reserved balance |
| Address Poisoning | Format validation, checksum verification, blacklist |
| Insider Attacks | Immutable audit logs, MFA, separation of duties |
| SQL Injection | Parameterized queries, input validation |
| Private Key Theft | Encrypted keys, HSM, isolated wallet service |
| DDoS | Rate limiting, DDoS protection, circuit breakers |
| Man-in-the-Middle | TLS/HTTPS, certificate pinning, request signing |

---

## 📊 MONITORING & ALERTS

### Critical Alerts (Immediate):
- ⚠️ Withdrawal spike (>3x normal in 1 hour)
- ⚠️ Failed webhook signature verification
- ⚠️ Balance mismatch detected
- ⚠️ Hot wallet balance below threshold
- ⚠️ Transaction failures > 5% in 1 hour

### Warning Alerts (Review within 24h):
- ⚠️ Unusual user behavior patterns
- ⚠️ Multiple failed signature verifications
- ⚠️ High volume deposit spam
- ⚠️ Admin action outside normal hours

### Informational (Weekly Review):
- 📊 Daily withdrawal volume
- 📊 Deposit success rate
- 📊 Average withdrawal processing time
- 📊 User activity patterns

---

## 🔧 CONFIGURATION VALUES

### Withdrawal Limits:
```typescript
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
```

### Deposit Settings:
```typescript
const DEPOSIT_SETTINGS = {
  min_amount: 1,
  expiry_minutes: 30,
  required_confirmations: {
    ethereum: 12,
    tron: 20,
    bsc: 20
  }
};
```

### Security Settings:
```typescript
const SECURITY_CONFIG = {
  nonce_expiry_minutes: 5,
  session_timeout_minutes: 30,
  rate_limit: {
    deposits_per_minute: 5,
    withdrawals_per_minute: 3,
    api_requests_per_minute: 100
  }
};
```

---

## 🚨 INCIDENT RESPONSE PROCEDURES

### 1. **Suspected Attack Detected**
1. **IMMEDIATELY:**
   - Freeze affected user accounts
   - Pause withdrawals (if system-wide)
   - Notify security team
   - Begin logging all actions

2. **Within 5 minutes:**
   - Assess scope and severity
   - Determine if system-wide or isolated
   - Check audit logs for anomalies

3. **Within 30 minutes:**
   - Implement additional security measures if needed
   - Document incident
   - Notify stakeholders

### 2. **Balance Mismatch Detected**
1. **IMMEDIATELY:**
   - Pause all withdrawals
   - Verify ledger integrity
   - Compare expected vs actual balances

2. **Investigation:**
   - Check audit logs for discrepancies
   - Verify all transactions
   - Check for double-credits or missed debits

3. **Resolution:**
   - Fix discrepancies
   - Re-enable withdrawals after verification
   - Document root cause

### 3. **Webhook Compromise Suspected**
1. **IMMEDIATELY:**
   - Disable webhook endpoint
   - Verify webhook secret
   - Check IP whitelist

2. **Investigation:**
   - Review all recent deposits
   - Check for unauthorized credits
   - Verify NOWPayments configuration

3. **Resolution:**
   - Rotate webhook secret
   - Verify IP whitelist
   - Re-enable webhook endpoint
   - Monitor closely

---

## 📝 AUDIT LOG REQUIREMENTS

All these events MUST be logged (immutable):
- ✅ User authentication (login attempts, successes, failures)
- ✅ Deposit initiation and confirmation
- ✅ Withdrawal requests, approvals, rejections, completions
- ✅ Balance changes (with before/after values)
- ✅ Admin actions (all actions with admin ID)
- ✅ Configuration changes
- ✅ Security events (failed signatures, unauthorized access attempts)

**Audit Log Format:**
```json
{
  "log_id": "UUID",
  "event_type": "withdrawal_requested",
  "user_id": "UUID",
  "admin_id": "UUID or null",
  "action": "withdrawal_request",
  "entity_type": "withdrawal",
  "entity_id": "UUID",
  "changes": {
    "before": {},
    "after": {}
  },
  "ip_address": "1.2.3.4",
  "user_agent": "Mozilla/5.0...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## 🔑 SECRET MANAGEMENT

### Never Store:
- ❌ Private keys in code
- ❌ Private keys in environment variables
- ❌ Private keys in configuration files
- ❌ Webhook secrets in code

### Always Store:
- ✅ Private keys in encrypted vault (HashiCorp Vault, AWS Secrets Manager)
- ✅ Keys encrypted at rest (AES-256 or HSM)
- ✅ Keys in isolated wallet service only
- ✅ Webhook secrets in vault
- ✅ Database credentials in vault
- ✅ API keys in vault

### Key Rotation:
- Rotate webhook secrets quarterly
- Rotate API keys quarterly
- Rotate database credentials quarterly
- Hot wallet keys: Rotate if compromised (otherwise annually)

---

## 🎯 TESTING CHECKLIST

### Security Testing:
- [ ] Penetration testing completed
- [ ] Fuzzing tests passed
- [ ] SQL injection tests passed
- [ ] XSS tests passed
- [ ] CSRF tests passed
- [ ] Replay attack tests passed
- [ ] Race condition tests passed

### Functional Testing:
- [ ] Deposit flow end-to-end tested
- [ ] Withdrawal flow end-to-end tested
- [ ] Webhook handling tested
- [ ] Balance updates tested (atomicity verified)
- [ ] Nonce system tested (expiry, reuse prevention)
- [ ] Signature verification tested
- [ ] Rate limiting tested

### Load Testing:
- [ ] System handles expected transaction volume
- [ ] Database performance under load
- [ ] Rate limiting works under load
- [ ] Webhook processing under load

---

## 📚 ADDITIONAL RESOURCES

### Documentation:
- `CRYPTO_PAYMENT_SYSTEM_DESIGN.md` - Complete system design
- `IMPLEMENTATION_EXAMPLES.md` - Code examples

### External Resources:
- NOWPayments API Documentation
- Ethereum/EVM Security Best Practices
- TRON Security Best Practices
- OWASP Top 10
- Crypto Exchange Security Standards

---

**Remember: Security is not a feature, it's a requirement. This system handles real money and will be attacked. Stay vigilant!**

