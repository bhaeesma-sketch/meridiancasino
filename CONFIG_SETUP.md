# Configuration Setup Guide

## Quick Start

### 1. Create Your Environment Files

```bash
# Copy the template
cp config.template.env .env.local        # For local development
cp config.template.env .env.production   # For production (DO NOT commit)
```

### 2. Fill In Your Values

Edit `.env.local` and replace all `YOUR_*` placeholders with your actual values.

### 3. Never Commit Secrets

The `.gitignore` file already excludes `.env.*` files. Double-check that you're not committing secrets!

---

## Required Configuration

### 🔴 CRITICAL - Must Configure Before Launch:

1. **Wallet Addresses**
   - Hot wallet addresses (for withdrawals)
   - Cold wallet addresses (multisig)
   - Admin wallet addresses

2. **NOWPayments**
   - API Key
   - IPN Secret
   - Webhook URL

3. **Security Secrets**
   - JWT Secret (min 32 characters)
   - Session Secret
   - Encryption Key (32 characters)

4. **Database**
   - Database credentials
   - Redis password

5. **Blockchain RPC**
   - Ethereum RPC endpoint
   - BSC RPC endpoint
   - TRON API key

---

## Admin Dashboard

### Access

The admin dashboard is available at: `/admin`

**⚠️ SECURITY:**
- In production, this should be VPN-only
- Add IP allowlist
- Require hardware MFA
- Separate admin URL (not public)

### Features

- **Dashboard**: System stats and overview
- **Withdrawals**: Approve/reject withdrawal requests
- **Users**: User management (coming soon)
- **Settings**: System configuration (coming soon)
- **Audit Logs**: View audit trail (coming soon)

### Current Implementation

The admin dashboard is currently a **frontend prototype**. For production:

1. Connect to actual backend API
2. Implement proper authentication/authorization
3. Add VPN-only access
4. Implement IP allowlist
5. Add hardware MFA requirement

---

## Next Steps

1. ✅ Copy `config.template.env` to `.env.local`
2. ✅ Fill in your wallet addresses and API keys
3. ✅ Set up database and Redis
4. ✅ Configure blockchain RPC endpoints
5. ✅ Test admin dashboard access
6. ✅ Implement backend API endpoints
7. ✅ Secure admin panel (VPN, IP allowlist, MFA)

---

## Security Reminders

- ❌ Never commit `.env` files to git
- ❌ Never share secrets in plain text
- ❌ Store production secrets in Vault/Secrets Manager
- ✅ Use strong, randomly generated secrets
- ✅ Rotate secrets regularly
- ✅ Use different secrets for dev/staging/production

