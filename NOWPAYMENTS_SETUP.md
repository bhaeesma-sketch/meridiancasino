# 🚀 NOWPayments Setup Guide

## Step 1: Add Environment Variables

Open your `.env.local` file and add these:

```bash
# NOWPayments Credentials
NOWPAYMENTS_API_KEY=your_api_key_here
NOWPAYMENTS_IPN_SECRET=your_ipn_secret_here

# Your deployed URL (for webhooks)
NOWPAYMENTS_IPN_CALLBACK_URL=https://your-domain.vercel.app/api/webhooks/nowpayments
FRONTEND_URL=https://your-domain.vercel.app

# Admin wallet (YOUR MetaMask address)
ADMIN_WALLETS=0xYourWalletAddress

# JWT Secret (generate a random string)
JWT_SECRET=your_secure_random_string_min_32_characters
```

## Step 2: Configure NOWPayments Webhook

1. Go to https://account.nowpayments.io/
2. Navigate to **Settings** → **IPN Settings**
3. Add your webhook URL: `https://your-domain.vercel.app/api/webhooks/nowpayments`
4. Copy the **IPN Secret Key** and add it to `.env.local`

## Step 3: Test Deposit Flow

1. Connect your wallet on the frontend
2. Click "Deposit"
3. Select amount, currency (USDT), and chain (TRC20)
4. Click "Deposit $20"
5. You'll get a QR code and address
6. Send USDT to that address
7. Wait for 19 confirmations (~2-3 minutes)
8. Balance will automatically update!

## Step 4: Verify Webhook Security

Check your server logs for:
```
[SUCCESS] Credited 20.00 USDT to order DEP_USER123_17...
```

If you see:
```
[SECURITY] Invalid webhook signature detected
```
Then check that your `NOWPAYMENTS_IPN_SECRET` matches the one in your NOWPayments dashboard.

## 🛡️ Security Checklist

- [x] IPN signature verification enabled
- [x] HTTPS only
- [x] Idempotency check (prevents double-credit)
- [x] Atomic database transactions
- [x] Min deposit: $10
- [x] Chain validation
- [x] Confirmation tracking (19+ for TRC20)

## ⚠️ Important Notes

1. **Never expose** `NOWPAYMENTS_API_KEY` or `IPN_SECRET` in frontend code
2. Always verify webhook signatures before crediting balances
3. Store deposit records in database before crediting
4. Log all webhook events for audit trail

## Next Steps

Once deposits are working, I'll implement:
- Withdrawal queue with risk scoring
- Admin dashboard for manual withdrawal approvals
- Balance tracking & transaction history
