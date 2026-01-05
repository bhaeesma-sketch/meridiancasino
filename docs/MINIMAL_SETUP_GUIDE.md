# Minimal Secure Setup Guide
## Simplest & Safest Configuration

This guide shows you how to set up the casino platform with **MINIMAL** configuration - only what's absolutely necessary.

---

## ✅ What You Actually NEED

### 1. **NOWPayments Account** (Required)
- Sign up at: https://nowpayments.io
- Get API Key from dashboard
- Get IPN Secret from dashboard
- That's it! NOWPayments handles all blockchain complexity

### 2. **One Blockchain** (Choose ONE)
- **Ethereum** (Most secure, higher fees)
- **TRON** (Lower fees, simpler)
- **BSC** (Low fees, good balance)

**You only need:**
- RPC endpoint (Infura for Ethereum, free tier is enough)
- One token (USDT recommended)

### 3. **One Hot Wallet Address**
- Create ONE new wallet address
- Use MetaMask/Trust Wallet to create
- This wallet holds max $50,000 for withdrawals
- **DO NOT use your personal wallet!**

### 4. **Database**
- PostgreSQL (can use local or cloud)
- That's it - no Redis needed initially

### 5. **Security Secrets**
- Generate 2 random strings (32+ characters each)
- One for JWT tokens
- One for sessions

---

## 🚀 Quick Setup Steps

### Step 1: Get NOWPayments Credentials
```
1. Go to https://nowpayments.io
2. Sign up / Login
3. Go to Dashboard → API Settings
4. Copy:
   - API Key
   - IPN Secret
```

### Step 2: Choose Your Blockchain

**Option A: Ethereum (Recommended)**
```bash
1. Go to https://infura.io
2. Create free account
3. Create new project
4. Copy API endpoint URL
5. Add to config: ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
```

**Option B: TRON (Simpler)**
```bash
1. Go to https://www.trongrid.io
2. Get free API key
3. Add to config: TRON_API_KEY=YOUR_KEY
```

**Option C: BSC (Low fees)**
```bash
1. Use public endpoint: https://bsc-dataseed.binance.org/
2. No API key needed
3. Add to config: BSC_RPC_URL=https://bsc-dataseed.binance.org/
```

### Step 3: Create Hot Wallet
```bash
1. Install MetaMask (or Trust Wallet)
2. Create NEW wallet (not your personal one!)
3. Copy wallet address
4. Add to config: HOT_WALLET_ADDRESS=0xYourAddress...
5. NEVER share the private key - store securely offline
```

### Step 4: Set Up Database
```bash
# Install PostgreSQL locally
# OR use cloud service (Supabase, Railway, etc.)

# Create database
createdb casino_db

# Add to config:
DB_HOST=localhost
DB_NAME=casino_db
DB_USER=your_user
DB_PASSWORD=your_password
```

### Step 5: Generate Secrets
```bash
# Generate JWT Secret
openssl rand -hex 32

# Generate Session Secret
openssl rand -hex 32

# Add both to config file
```

### Step 6: Copy Config File
```bash
cp config.minimal.env .env.local

# Edit .env.local and fill in your values
```

---

## 📋 Minimal Configuration Checklist

```
[ ] NOWPayments API Key obtained
[ ] NOWPayments IPN Secret obtained
[ ] One blockchain RPC endpoint configured
[ ] One hot wallet address created and added
[ ] Database created and credentials added
[ ] JWT Secret generated (32+ characters)
[ ] Session Secret generated (32+ characters)
[ ] Config file (.env.local) created and filled
[ ] Test connection to NOWPayments
[ ] Test connection to blockchain RPC
```

---

## 🔒 Security Best Practices (Even for Minimal Setup)

### ✅ DO:
- Use separate wallet for platform (not personal)
- Store private keys offline (paper/encrypted USB)
- Use strong randomly generated secrets
- Start with sandbox/testnet mode
- Test everything before going live
- Keep hot wallet balance under $50,000

### ❌ DON'T:
- Use your personal wallet address
- Store private keys in code or config files
- Share your API keys or secrets
- Skip webhook signature verification
- Skip IP whitelist for NOWPayments webhooks

---

## 🎯 What You DON'T Need (For Now)

You can add these later:

- ❌ Cold wallet (start with just hot wallet)
- ❌ Multiple blockchains (start with one)
- ❌ Redis (can add later for caching)
- ❌ Multiple tokens (start with just USDT)
- ❌ Email service (can add later)
- ❌ Advanced monitoring (basic logging is enough)
- ❌ KYC provider (can add later)
- ❌ Geo-blocking (can add later)
- ❌ Multiple admin wallets (start simple)

---

## 🚦 Deployment Progression

### Phase 1: Minimal (This Guide)
- ✅ NOWPayments only
- ✅ One blockchain (Ethereum/TRON/BSC)
- ✅ One hot wallet
- ✅ Basic database
- **Goal:** Get deposits/withdrawals working

### Phase 2: Enhanced Security (After Phase 1 works)
- ✅ Add cold wallet (multisig)
- ✅ Add Redis for sessions
- ✅ Add monitoring/alerting
- ✅ Add email notifications

### Phase 3: Production Ready (Before launch)
- ✅ Add KYC/AML
- ✅ Add geo-blocking
- ✅ Add advanced monitoring
- ✅ Add backup/disaster recovery
- ✅ Security audit

---

## 💡 Pro Tips

1. **Start with Testnet**
   - Test everything on testnet first
   - Ethereum: Sepolia testnet
   - TRON: Shasta testnet
   - BSC: Testnet

2. **Low Limits Initially**
   - Start with very low withdrawal limits ($50/day)
   - Increase gradually as you gain confidence
   - Monitor everything closely

3. **Manual Review**
   - Review all withdrawals manually initially
   - Automate only after you understand the flow
   - Build confidence in the system

4. **NOWPayments Handles Complexity**
   - They handle blockchain complexity
   - They generate deposit addresses
   - They monitor transactions
   - You just receive webhooks

---

## 🔧 Troubleshooting

### "Invalid NOWPayments signature"
- Check IP whitelist is correct
- Verify IPN secret matches
- Check webhook URL is correct

### "RPC connection failed"
- Verify RPC endpoint URL
- Check API key is correct
- Test endpoint in browser

### "Wallet balance insufficient"
- Make sure hot wallet has funds
- Check wallet address is correct
- Verify network matches (mainnet/testnet)

---

## 📞 Support Resources

- NOWPayments Docs: https://documenter.getpostman.com/view/7907941/S1a32n38
- Infura Docs: https://docs.infura.io/
- TRON Docs: https://developers.tron.network/

---

## ✅ You're Ready!

Once you have:
- ✅ NOWPayments API Key + Secret
- ✅ One blockchain RPC endpoint
- ✅ One hot wallet address
- ✅ Database setup
- ✅ Secrets generated

You can start accepting deposits and processing withdrawals!

**Remember:** Start small, test thoroughly, and add features gradually.

