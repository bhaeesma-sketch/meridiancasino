# 🚀 Quick Start - Copy Your Config Here

## 5-Minute Setup Guide

---

## Step 1: Get NOWPayments Credentials

**Go to:** https://nowpayments.io → Dashboard → API Settings

```
API Key: ________________________________________
IPN Secret: ________________________________________
```

---

## Step 2: Get Blockchain RPC (Choose ONE)

### Option A: Ethereum (Easiest)

**Go to:** https://infura.io → Sign Up → Create Project

```
Infura Endpoint: https://mainnet.infura.io/v3/YOUR_KEY_HERE
```

### Option B: TRON (Lower Fees)

**Go to:** https://www.trongrid.io → Get API Key

```
TRON API Key: ________________________________________
```

### Option C: BSC (No Signup!)

```
Just use: https://bsc-dataseed.binance.org/
```

---

## Step 3: Get Hot Wallet Address

### For TRON (Using TronLink) ⭐ EASIEST

**Install TronLink:** https://www.tronlink.org/

1. Open TronLink extension
2. Your address shows at top (starts with "T")
3. Click on address → "Copy Address"
4. Paste below

```
TRON Wallet Address: T________________________________________
```

### For Ethereum (Using MetaMask)

**Install MetaMask:** https://metamask.io

1. Create new wallet
2. Click account → Copy address

```
Ethereum Wallet Address: 0x________________________________________
```

⚠️ **IMPORTANT:**
- Create NEW wallet for platform (not your personal wallet!)
- Save seed phrase/private key securely offline
- Never share private key

---

## Step 4: Setup Database

**Option A: Local PostgreSQL**
```bash
createdb casino_db
```

**Option B: Cloud (Free)**
- Supabase: https://supabase.com
- Railway: https://railway.app

```
DB Host: ________________________________________
DB Name: casino_db
DB User: ________________________________________
DB Password: ________________________________________
```

---

## Step 5: Generate Secrets

**In terminal, run:**
```bash
openssl rand -hex 32
```

**Run twice, copy results:**

```
JWT Secret: ________________________________________
Session Secret: ________________________________________
```

---

## Step 6: Copy to Config File

```bash
# Copy template
cp config.minimal.env .env.local

# Edit file
nano .env.local
# (or use any text editor)

# Paste your values from above
```

---

## ✅ Done!

**Test your setup:**
```bash
npm run dev
```

**Check:**
- ✅ Application starts
- ✅ Can connect to database
- ✅ Can connect to blockchain RPC
- ✅ NOWPayments API responds

---

## 📝 Full Checklist

Fill in the detailed checklist: **SETUP_CHECKLIST.md**

---

## 🆘 Need Help?

- Detailed guide: `docs/MINIMAL_SETUP_GUIDE.md`
- Full config template: `config.template.env`
- Minimal config: `config.minimal.env`

