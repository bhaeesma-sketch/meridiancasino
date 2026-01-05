# Setup Checklist - Copy Your Values Here
## Fill this out, then copy to `.env.local`

---

## ✅ STEP 1: NOWPayments (Required)

**Where to get:** https://nowpayments.io → Dashboard → API Settings

```
NOWPAYMENTS_API_KEY = ________________________________________
NOWPAYMENTS_IPN_SECRET = ________________________________________
NOWPAYMENTS_SANDBOX_MODE = true  (change to false for production)
NOWPAYMENTS_WEBHOOK_URL = https://your-domain.com/webhooks/nowpayments
```

**NOWPayments IP Whitelist (copy these exactly):**
```
NOWPAYMENTS_IP_WHITELIST = 52.31.139.75,52.49.173.169,52.214.14.220
```

---

## ✅ STEP 2: Choose ONE Blockchain

### Option A: Ethereum (Recommended)

**Where to get RPC:** https://infura.io → Create Account → Create Project → Copy Endpoint

```
ETH_RPC_URL = https://mainnet.infura.io/v3/YOUR_INFURA_KEY_HERE
ETH_CHAIN_ID = 1
SUPPORTED_TOKEN = USDT
REQUIRED_CONFIRMATIONS = 12
```

### Option B: TRON (Lower Fees)

**Where to get:** https://www.trongrid.io → Get API Key

```
TRON_NETWORK = mainnet
TRON_API_KEY = YOUR_TRONGRID_API_KEY_HERE
SUPPORTED_TOKEN = USDT
REQUIRED_CONFIRMATIONS = 20
```

### Option C: BSC (Low Fees, Easy)

**No API key needed - use public endpoint:**

```
BSC_RPC_URL = https://bsc-dataseed.binance.org/
BSC_CHAIN_ID = 56
SUPPORTED_TOKEN = USDT
REQUIRED_CONFIRMATIONS = 20
```

**CHOOSE ONE OPTION ABOVE** ⬆️

---

## ✅ STEP 3: Hot Wallet Address

### Option A: For TRON (Using TronLink) ⭐ EASIEST

**How to get TRON address from TronLink:**
1. Install TronLink extension: https://www.tronlink.org/
2. Open TronLink in your browser
3. Click on your wallet address (shows as "T...")
4. Click "Copy Address" button
5. Paste it below

```
HOT_WALLET_ADDRESS = TSXCYJGzK1tghWG1fPGM8VLCHYDKzcsCW6________________________________________
```

**OR Manual Copy:**
- Open TronLink
- Your address is shown at top (starts with "T")
- Click on it → "Copy Address"
- Or right-click → Copy

⚠️ **IMPORTANT:** 
- Create a NEW wallet for the platform (don't use your personal wallet!)
- Store private key/seed phrase securely offline
- Never share private key
- Never put private key in config file

---

### Option B: For Ethereum (Using MetaMask)

> **Note:** Only if you choose Ethereum instead of TRON.  
> Since you're using TRON (TronLink), you DON'T need MetaMask!

**How to create (only if using Ethereum):**
1. Install MetaMask: https://metamask.io
2. Create NEW wallet (not your personal one!)
3. Click account name → Copy address
4. Address starts with `0x`

```
HOT_WALLET_ADDRESS = 0x________________________________________
```

---

### Option C: For TRON (Other Wallets)

**Trust Wallet / Other TRON wallets:**
1. Open wallet
2. Select TRON network
3. Click on address to copy
4. Address starts with "T"

```
HOT_WALLET_ADDRESS = T________________________________________
```

---

## ✅ STEP 4: Database (Supabase - Recommended) ⭐ EASIEST

**Setup Supabase (Free Cloud Database):**

1. **Go to:** https://supabase.com
2. **Sign up** (free account)
3. **Create new project:**
   - Project name: `casino-platform` (or any name)
   - Create strong password (save it!)
   - Choose region closest to you
4. **Wait 2-3 minutes** for setup
5. **Get credentials:**
   - Go to: Settings (⚙️) → Database
   - Scroll to "Connection string" section
   - Copy "Transaction mode" connection string

**Copy your Supabase values here:**

```
DB_HOST = db.________________________________________.supabase.co
DB_PORT = 6543  (use 6543 for pooling, or 5432 for direct)
DB_NAME = postgres
DB_USER = postgres
DB_PASSWORD = ________________________________________
DB_SSL = true  (Required for Supabase)
```

**OR use full connection string (easier):**
```
DATABASE_URL = postgresql://postgres:password@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true
```

**📖 Detailed guide:** See `docs/SUPABASE_SETUP.md`

---

**Alternative: Local PostgreSQL**
```bash
createdb casino_db
```
```
DB_HOST = localhost
DB_PORT = 5432
DB_NAME = casino_db
DB_USER = your_username_here
DB_PASSWORD = your_password_here
DB_SSL = false
```

---

## ✅ STEP 5: Generate Security Secrets

**Generate in terminal:**
```bash
openssl rand -hex 32
```

**Run twice - once for each secret:**

```
JWT_SECRET = ________________________________________
(32+ character random string)
```

```
SESSION_SECRET = ________________________________________
(32+ character random string)
```

---

## ✅ STEP 6: Application Settings

**Default values (usually don't need to change):**
```
NODE_ENV = development
PORT = 3000
API_URL = http://localhost:3001
FRONTEND_URL = http://localhost:3000
```

---

## ✅ STEP 7: Withdrawal Limits (Start Conservative)

**Recommended starting values:**
```
WITHDRAWAL_MIN_AMOUNT = 10
WITHDRAWAL_MAX_PER_DAY = 1000
WITHDRAWAL_AUTO_APPROVE_LIMIT = 50
WITHDRAWAL_MANUAL_APPROVE_LIMIT = 100
HOT_WALLET_MIN_BALANCE = 5000
HOT_WALLET_MAX_BALANCE = 50000
```

---

## 📋 QUICK COPY TEMPLATE

After filling above, copy this format to `.env.local`:

```bash
# NOWPayments
NOWPAYMENTS_API_KEY=YOUR_VALUE_HERE
NOWPAYMENTS_IPN_SECRET=YOUR_VALUE_HERE
NOWPAYMENTS_SANDBOX_MODE=true
NOWPAYMENTS_WEBHOOK_URL=https://your-domain.com/webhooks/nowpayments
NOWPAYMENTS_IP_WHITELIST=52.31.139.75,52.49.173.169,52.214.14.220

# Blockchain (Choose ONE)
ETH_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
ETH_CHAIN_ID=1
SUPPORTED_TOKEN=USDT
REQUIRED_CONFIRMATIONS=12

# Hot Wallet
HOT_WALLET_ADDRESS=0xYOUR_ADDRESS

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=casino_db
DB_USER=your_user
DB_PASSWORD=your_password

# Security Secrets
JWT_SECRET=YOUR_GENERATED_SECRET
SESSION_SECRET=YOUR_GENERATED_SECRET

# Application
NODE_ENV=development
PORT=3000
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Limits
WITHDRAWAL_MIN_AMOUNT=10
WITHDRAWAL_MAX_PER_DAY=1000
WITHDRAWAL_AUTO_APPROVE_LIMIT=50
WITHDRAWAL_MANUAL_APPROVE_LIMIT=100
HOT_WALLET_MIN_BALANCE=5000
HOT_WALLET_MAX_BALANCE=50000
```

---

## 🎯 WHERE TO GET EACH VALUE

### NOWPayments
- **Website:** https://nowpayments.io
- **Login → Dashboard → API Settings**
- Copy API Key and IPN Secret

### Ethereum RPC (Infura)
- **Website:** https://infura.io
- **Sign up → Create Project → Copy Endpoint URL**
- Free tier: 100,000 requests/day

### TRON RPC
- **Website:** https://www.trongrid.io
- **Get API Key (free)**
- Use for TRON mainnet

### BSC RPC
- **Public Endpoint:** https://bsc-dataseed.binance.org/
- **No signup needed!**
- Free to use

### Hot Wallet

**For TRON (What You're Using):**
- ✅ **TronLink:** https://www.tronlink.org/ (You already have this!)
- ✅ Address starts with "T"
- ✅ Your address: `TSXCYJGzK1tghWG1fPGM8VLCHYDKzcsCW6`

**For Ethereum (Only if you switch from TRON):**
- **MetaMask:** https://metamask.io (Only needed for Ethereum/BSC)
- Address starts with "0x"
- **You DON'T need this if using TRON!**

**Clarification:** 
- TRON = TronLink (you have this ✅)
- Ethereum = MetaMask (not needed for TRON ❌)

### Database (Supabase - Recommended)

**Setup Steps:**
1. Go to: https://supabase.com
2. Sign up → Create project
3. Go to: Settings → Database
4. Copy connection string or individual values:
   - Host: `db.xxxxx.supabase.co`
   - Port: `6543` (pooling) or `5432` (direct)
   - Database: `postgres`
   - User: `postgres`
   - Password: (the one you created)
   - SSL: `true` (required)

**Full guide:** `docs/SUPABASE_SETUP.md`

### Secrets
- **Terminal command:** `openssl rand -hex 32`
- Run twice, copy results

---

## ✅ FINAL STEPS

1. Fill in all values above
2. Copy everything to `.env.local`:
   ```bash
   cp config.minimal.env .env.local
   # Then edit .env.local with your values
   ```
3. Verify all values are filled
4. Test connections
5. Start the application!

---

## 🔒 SECURITY CHECKLIST

Before going live:
- [ ] All secrets are random (not simple passwords)
- [ ] Private keys stored offline (not in config)
- [ ] `.env.local` added to `.gitignore`
- [ ] Sandbox mode enabled for testing
- [ ] Hot wallet has limited funds
- [ ] All values double-checked

---

**Need help? Check:** `docs/MINIMAL_SETUP_GUIDE.md`

