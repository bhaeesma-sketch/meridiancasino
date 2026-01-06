-- ==========================================
-- FIX FOR WEB3 AUTH (Wallet Login)
-- ==========================================
-- Run this script to fix the "Failed to create user profile" error.
-- It removes the strict requirement for Supabase Email/Password auth.

-- 0. Ensure pgcrypto is enabled (needed for gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Remove Foreign Key Constraints (Decouple from auth.users)
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
ALTER TABLE public.game_history DROP CONSTRAINT IF EXISTS game_history_user_id_fkey;

-- 2. Update RLS Policies to allow Wallet-based access
-- (Since we are logging in with Metamask, not Supabase Auth, we are "anonymous" to the DB)

-- Drop existing strict policies (Legacy)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view own game history" ON public.game_history;

-- Drop new policies if they exist (to fix "already exists" error)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on wallet" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for all users" ON public.profiles; 

DROP POLICY IF EXISTS "Enable read access for transactions" ON public.transactions;
DROP POLICY IF EXISTS "Enable insert for transactions" ON public.transactions;
DROP POLICY IF EXISTS "Enable update for transactions" ON public.transactions;

DROP POLICY IF EXISTS "Enable read access for game_history" ON public.game_history;
DROP POLICY IF EXISTS "Enable insert for game_history" ON public.game_history;

-- Create Open Policies (For Demo/Web3 Mode)
-- Security relies on the App verifying the wallet signature
CREATE POLICY "Enable read access for all users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for users based on wallet" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Enable read access for transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Enable insert for transactions" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for transactions" ON public.transactions FOR UPDATE USING (true);

CREATE POLICY "Enable read access for game_history" ON public.game_history FOR SELECT USING (true);
CREATE POLICY "Enable insert for game_history" ON public.game_history FOR INSERT WITH CHECK (true);

-- 3. Ensure 'id' is generated
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
