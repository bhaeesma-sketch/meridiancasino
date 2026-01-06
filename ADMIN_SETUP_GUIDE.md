# Secure Admin Dashboard Setup Guide

## Overview
This guide will help you set up a secure admin dashboard with proper database authentication using Supabase RLS (Row Level Security).

## Step 1: Run the Database Setup SQL

1. **Open your Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Setup Script**
   - Open the file `supabase_admin_setup.sql` in this project
   - Copy ALL the SQL code
   - Paste it into the Supabase SQL Editor
   - Click "Run" or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)

4. **Verify the Setup**
   - You should see "Success. No rows returned" or similar
   - Check the "Table Editor" to see the new tables: `profiles`, `transactions`, `game_history`

## Step 2: Make Yourself an Admin

After you've connected your wallet to the app for the first time:

1. **Get Your Wallet Address**
   - Connect your wallet in the app
   - Copy your wallet address (it will be shown in the UI)

2. **Run the Admin Grant SQL**
   - Go back to Supabase SQL Editor
   - Run this query (replace `YOUR_WALLET_ADDRESS` with your actual address):

```sql
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE wallet_address = 'YOUR_WALLET_ADDRESS';
```

   - **IMPORTANT**: Use lowercase for your wallet address if it contains letters

3. **Verify Admin Status**
   - Run this query to confirm:

```sql
SELECT wallet_address, is_admin, username 
FROM public.profiles 
WHERE is_admin = TRUE;
```

   - You should see your wallet address with `is_admin = true`

## Step 3: Access the Admin Dashboard

1. **Navigate to Admin Page**
   - In your app, go to: `http://localhost:3000/#/admin`
   - Or click the admin link if you've added one to your navigation

2. **What You'll See**
   - If you're an admin: Full dashboard with stats, user management, transactions
   - If you're not an admin: "Access Denied" message

## Step 4: Understanding the Security Model

### How It Works

1. **Profiles Table**
   - Stores user data including `is_admin` flag
   - Only admins can see all profiles
   - Regular users can only see their own profile

2. **Row Level Security (RLS)**
   - PostgreSQL feature that filters data at the database level
   - Even if someone hacks the frontend, they can't access admin data
   - Policies are enforced by Supabase, not your code

3. **Admin Check Flow**
   ```
   User connects wallet
   → App queries: SELECT is_admin FROM profiles WHERE wallet_address = ?
   → If is_admin = TRUE → Show admin dashboard
   → If is_admin = FALSE → Show "Access Denied"
   ```

### Security Benefits

✅ **Database-Level Security**: RLS policies prevent unauthorized access
✅ **No Environment Variables**: No need to maintain a whitelist in `.env`
✅ **Audit Trail**: All admin actions can be logged in the database
✅ **Scalable**: Easy to add/remove admins without code changes

## Step 5: Managing Admins

### Add a New Admin
```sql
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE wallet_address = 'new_admin_wallet_address';
```

### Remove Admin Access
```sql
UPDATE public.profiles 
SET is_admin = FALSE 
WHERE wallet_address = 'wallet_address_to_remove';
```

### List All Admins
```sql
SELECT wallet_address, username, email, created_at 
FROM public.profiles 
WHERE is_admin = TRUE;
```

## Step 6: Testing

1. **Test as Admin**
   - Connect with your admin wallet
   - Navigate to `/admin`
   - Verify you can see the dashboard

2. **Test as Regular User**
   - Connect with a different wallet (or use Import Wallet with a test key)
   - Try to navigate to `/admin`
   - Verify you see "Access Denied"

3. **Test RLS Policies**
   - As a regular user, try to query transactions in the browser console:
   ```javascript
   const { data } = await supabase.from('transactions').select('*');
   console.log(data); // Should be empty or only your own transactions
   ```

## Troubleshooting

### "Access Denied" even though I'm an admin

1. **Check if your profile exists**
   ```sql
   SELECT * FROM public.profiles WHERE wallet_address = 'YOUR_WALLET_ADDRESS';
   ```

2. **Verify is_admin is TRUE**
   ```sql
   SELECT is_admin FROM public.profiles WHERE wallet_address = 'YOUR_WALLET_ADDRESS';
   ```

3. **Check wallet address case**
   - Wallet addresses should be stored in lowercase
   - Run: `UPDATE public.profiles SET wallet_address = LOWER(wallet_address);`

### "Error checking admin status" in console

1. **Check Supabase connection**
   - Verify your `.env.local` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

2. **Check RLS policies**
   - Verify policies were created:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```

3. **Check if you're authenticated**
   - The app must have a valid user session
   - Try disconnecting and reconnecting your wallet

### Database errors when running SQL

1. **"relation already exists"**
   - Tables already exist, which is fine
   - The `CREATE TABLE IF NOT EXISTS` will skip them

2. **"permission denied"**
   - You might not have the right permissions
   - Make sure you're the project owner in Supabase

## Next Steps

Once admin access is working:

1. **Implement Real Deposit Monitoring**
   - Set up blockchain listeners for deposits
   - Update `transactions` table when deposits are detected

2. **Add Withdrawal Approval Flow**
   - Admins can approve/reject withdrawals
   - Implement auto-approval for low-risk withdrawals

3. **Build Analytics Dashboard**
   - Real-time stats using Supabase Realtime
   - Charts for deposits, withdrawals, game activity

4. **Add Referral Tracking**
   - Track referral signups and payouts
   - Implement the "5+1" referral system

## Security Best Practices

1. ✅ **Never expose admin credentials in frontend code**
2. ✅ **Always use RLS policies for data access control**
3. ✅ **Log all admin actions for audit trail**
4. ✅ **Use HTTPS in production**
5. ✅ **Regularly review admin access list**
6. ✅ **Implement 2FA for admin accounts (future enhancement)**

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check Supabase logs in the dashboard
3. Verify all SQL scripts ran successfully
4. Ensure your wallet is connected before accessing `/admin`
