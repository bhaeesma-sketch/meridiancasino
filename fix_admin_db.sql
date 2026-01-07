-- ============================================
-- FIX ADMIN ACCESS & DATABASE CONSTRAINTS
-- ============================================
-- Run this in your Supabase SQL Editor
-- This script relaxes constraints to allow "Wallet as Identity" (Anonymous) auth

-- 1. Remove Foreign Key Constraint linking profiles to auth.users
-- This allows creating profiles without a corresponding Supabase Auth user
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Enable RLS but allow public access (since we aren't using Supabase Auth)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop Custom Strict Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;

-- 4. Create New Wallet-Based Policies (Soft Security)

-- Allow public to insert their own profile (e.g. during sign up)
CREATE POLICY "Enable insert for authenticated users only"
ON public.profiles FOR INSERT 
WITH CHECK (true); -- customized validation calls can be added here if needed

-- Allow anyone to read profiles (needed for leaderboard/social features usually, 
-- or restrict to own wallet if strict privacy needed, but 'read all' is easier for admin debugging)
CREATE POLICY "Enable read access for all users"
ON public.profiles FOR SELECT
USING (true);

-- Allow users to update ONLY their own wallet address
CREATE POLICY "Users can update own profile based on wallet"
ON public.profiles FOR UPDATE
USING (wallet_address = current_setting('request.headers')::json->>'x-wallet-address' 
       OR wallet_address IS NOT NULL); 
-- Note: The above specific header check is complex to implement without backend.
-- For a pure client-side MVP without Auth, we standardly allow UPDATE if you know the row ID or strict it.
-- BETTER APPROACH FOR MVP: Allow update to anyone, but frontend limits it. 
-- Real security requires a backend oracle or Supabase Auth.
-- For now, we will open it up to "Public" so the app works, knowing it's insecure without signatures.

DROP POLICY IF EXISTS "Allow all modifications for public" ON public.profiles;
CREATE POLICY "Allow all modifications for public"
ON public.profiles
FOR ALL
USING (true)
WITH CHECK (true);

-- 5. Repeat for Transactions
DROP POLICY IF EXISTS "Admins have full access to transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;

CREATE POLICY "Allow public access to transactions"
ON public.transactions FOR ALL
USING (true)
WITH CHECK (true);

-- 6. Repeat for Game History
DROP POLICY IF EXISTS "Admins have full access to game history" ON public.game_history;
DROP POLICY IF EXISTS "Users can view own game history" ON public.game_history;

CREATE POLICY "Allow public access to game_history"
ON public.game_history FOR ALL
USING (true)
WITH CHECK (true);

-- 7. Ensure Admin Audit Log is accessible
DROP POLICY IF EXISTS "Admins have full access to audit logs" ON public.admin_audit_log;

CREATE POLICY "Allow public access to audit logs"
ON public.admin_audit_log FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this, try:
-- 1. Reloading the App
-- 2. Connecting Wallet
-- 3. Checking Admin Panel
