# How to Get TRON Address from TronLink
## Quick Guide

---

## 📱 Step-by-Step Instructions

### 1. Install TronLink Extension

**Download:**
- Chrome/Edge: https://chrome.google.com/webstore/detail/tronlink/ibnejdfjmmkpcnlpebklmnkoeoihofec
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/tronlink/
- Or visit: https://www.tronlink.org/

**Install:**
- Click "Add to Chrome" (or your browser)
- Click "Add Extension"
- Pin TronLink to your browser toolbar (optional but recommended)

---

### 2. Create or Import Wallet

**Option A: Create New Wallet (Recommended for Platform)**
1. Click TronLink icon in browser
2. Click "Create Wallet"
3. Read and accept terms
4. **IMPORTANT:** Save your seed phrase (12 words)
   - Write it down on paper
   - Store in secure location
   - Never share it!
5. Verify seed phrase
6. Set password
7. Wallet created! ✅

**Option B: Import Existing Wallet**
- If you already have a TRON wallet
- Click "Import Wallet"
- Enter seed phrase or private key

---

### 3. Copy Your Address

**Method 1: From Extension Popup**
1. Click TronLink icon in browser toolbar
2. Your address is shown at the top (starts with "T")
3. Click on the address
4. Click "Copy Address" button
5. Address copied! ✅

**Method 2: Right-Click Copy**
1. Click TronLink icon
2. Right-click on your address
3. Select "Copy Address"
4. Address copied! ✅

**Method 3: From Account Details**
1. Click TronLink icon
2. Click on your account name/address
3. In account details, click "Copy" button next to address
4. Address copied! ✅

---

## 📋 What Your Address Looks Like

Your TRON address will look like this:
```
TXYZabc123def456ghi789jkl012mno345pqr678stu
```

**Characteristics:**
- ✅ Always starts with "T"
- ✅ 34 characters long
- ✅ Contains letters and numbers
- ✅ Example: `TXYZabc123def456ghi789jkl012mno345pqr678stu`

---

## ✅ Verify Your Address

**Check if it's correct:**
1. Address starts with "T"
2. Exactly 34 characters
3. No spaces or special characters
4. When you paste it, it should match what shows in TronLink

---

## 🔒 Security Reminders

### ⚠️ DO:
- ✅ Create a NEW wallet for the platform (separate from personal)
- ✅ Save seed phrase on paper (offline)
- ✅ Store seed phrase in secure location (safe/encrypted)
- ✅ Use strong password for TronLink
- ✅ Verify address by checking first/last few characters

### ❌ DON'T:
- ❌ Use your personal wallet (create new one!)
- ❌ Store seed phrase in screenshots/photos
- ❌ Share seed phrase or private key
- ❌ Send seed phrase via email/messaging
- ❌ Put private key in config files

---

## 💡 Quick Copy Tips

**Fastest Method:**
1. Open TronLink
2. Click address at top
3. Click "Copy" button
4. Paste directly into config file

**Visual Guide:**
```
[TronLink Icon] → [Click] → [See Address: T...] → [Click Address] → [Copy Button] → ✅
```

---

## 🎯 For Your Config File

Once you have your address, paste it here in `config.minimal.env`:

```bash
# For TRON
HOT_WALLET_ADDRESS=TYourAddressHere123456789012345678
```

**Example:**
```bash
HOT_WALLET_ADDRESS=TXYZabc123def456ghi789jkl012mno345pqr678stu
```

---

## ✅ Checklist

- [ ] TronLink extension installed
- [ ] New wallet created (for platform use)
- [ ] Seed phrase saved securely offline
- [ ] Address copied (starts with "T")
- [ ] Address pasted into config file
- [ ] Address verified (34 characters, starts with "T")

---

## 🆘 Troubleshooting

**"I can't see my address"**
- Click TronLink icon in browser toolbar
- Make sure wallet is unlocked (enter password if needed)
- Address is always shown at top of popup

**"Address doesn't start with T"**
- You might be on wrong network
- Make sure you're on TRON Mainnet
- Check network selector in TronLink

**"Can't copy address"**
- Right-click on address → Copy
- Or manually select and copy (Ctrl+C / Cmd+C)
- Try refreshing TronLink extension

**"I need to create new wallet"**
- In TronLink, click settings → Manage Accounts
- Click "Create Account" or "Import Account"
- Follow setup steps

---

## 📞 Need Help?

- TronLink Support: https://www.tronlink.org/
- TronLink Docs: Check extension for help
- TRON Network: https://tron.network

---

**You're all set! Your TRON address is ready to use.** 🎉

