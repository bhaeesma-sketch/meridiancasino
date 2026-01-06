-- ============================================
-- SECURE ADMIN DASHBOARD DATABASE SETUP
-- ============================================
-- Run this in your Supabase SQL Editor
-- This creates a secure admin system using the profiles table

-- 1. Create Profiles table with admin flag
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  username TEXT,
  email TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  balance DECIMAL(12, 2) DEFAULT 0,
  real_balance DECIMAL(12, 2) DEFAULT 0,
  bonus_balance DECIMAL(12, 2) DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by TEXT,
  valid_referral_count INTEGER DEFAULT 0,
  is_new_user BOOLEAN DEFAULT TRUE,
  bonus_claimed BOOLEAN DEFAULT FALSE,
  is_first_deposit BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Transactions table for deposits/withdrawals
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  type TEXT CHECK (type IN ('deposit', 'withdrawal', 'bonus', 'referral_payout')),
  amount DECIMAL(12, 2) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create Game History table
CREATE TABLE IF NOT EXISTS public.game_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  game_name TEXT NOT NULL,
  bet_amount DECIMAL(12, 2) NOT NULL,
  payout DECIMAL(12, 2) DEFAULT 0,
  multiplier DECIMAL(10, 2),
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3.5 Create Audit Log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_wallet TEXT NOT NULL,
  action TEXT NOT NULL,
  target_user TEXT,
  target_wallet TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access to transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins have full access to game history" ON public.game_history;
DROP POLICY IF EXISTS "Users can view own game history" ON public.game_history;
DROP POLICY IF EXISTS "Admins have full access to audit logs" ON public.admin_audit_log;

-- 6. Profiles Policies
CREATE POLICY "Users can view own profile" 
ON public.profiles
FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile" 
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins have full access to profiles" 
ON public.profiles
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  )
);

-- 7. Transactions Policies
CREATE POLICY "Admins have full access to transactions" 
ON public.transactions
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  )
);

CREATE POLICY "Users can view own transactions" 
ON public.transactions
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 8. Game History Policies
CREATE POLICY "Admins have full access to game history" 
ON public.game_history
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  )
);

CREATE POLICY "Users can view own game history" 
ON public.game_history
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 8.5 Audit Log Policies
CREATE POLICY "Admins have full access to audit logs" 
ON public.admin_audit_log
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  )
);

-- 9. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_wallet ON public.profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_profiles_referral ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON public.transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_game_history_user ON public.game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_game_history_wallet ON public.game_history(wallet_address);

-- 10. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Create trigger for profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. Create function to safely update balance (prevents race conditions)
CREATE OR REPLACE FUNCTION update_user_balance(
  p_user_id UUID,
  p_amount DECIMAL,
  p_balance_type TEXT DEFAULT 'real'
)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance DECIMAL;
BEGIN
  -- Lock the row for update
  IF p_balance_type = 'real' THEN
    SELECT real_balance INTO current_balance
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;
    
    IF current_balance + p_amount < 0 THEN
      RETURN FALSE; -- Insufficient balance
    END IF;
    
    UPDATE public.profiles
    SET real_balance = real_balance + p_amount,
        balance = balance + p_amount
    WHERE id = p_user_id;
  ELSIF p_balance_type = 'bonus' THEN
    SELECT bonus_balance INTO current_balance
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;
    
    IF current_balance + p_amount < 0 THEN
      RETURN FALSE;
    END IF;
    
    UPDATE public.profiles
    SET bonus_balance = bonus_balance + p_amount,
        balance = balance + p_amount
    WHERE id = p_user_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_user_balance TO authenticated;

-- ============================================
-- MANUAL STEP: Set your wallet as admin
-- ============================================
-- Replace 'YOUR_WALLET_ADDRESS' with your actual wallet address
-- Run this AFTER you've connected your wallet for the first time:

-- OPTION 1: If using MetaMask (Ethereum/BSC)
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE wallet_address = '0x8511B5824036773676791dcC5d6a5e73D4b24870';

-- OPTION 2: If using TronLink (TRON)
UPDATE public.profiles 
SET is_admin = TRUE 
WHERE wallet_address = 'TSXCYJGzK1tghWG1fPGM8VLCHYDKzcsCW6';

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Check if your profile exists and is admin:
-- SELECT * FROM public.profiles WHERE is_admin = TRUE;

-- Check RLS policies:
-- SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'transactions', 'game_history');
