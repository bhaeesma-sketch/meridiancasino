-- ========================================================
-- HARDENING & PERFORMANCE OPTIMIZATION (Fixing 50 Issues)
-- ========================================================

-- 1. SECURITY DEFINER HARDENING (Fixing "role mutable" / search_path vulnerabilities)
-- Every SECURITY DEFINER function must have a fixed search_path to prevent path injection.

ALTER FUNCTION public.handle_new_user_bonus() SET search_path = public;
ALTER FUNCTION public.play_limbo(DECIMAL, DECIMAL, BOOLEAN) SET search_path = public;
ALTER FUNCTION public.check_withdrawal_eligibility(UUID) SET search_path = public;
ALTER FUNCTION public.check_referral_limit() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_new_profile() SET search_path = public;

-- Fix suspected ghost functions from Supabase Dashboard
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'process_deposit') THEN
        ALTER FUNCTION public.process_deposit(TEXT, DECIMAL) SET search_path = public;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'check_player_security') THEN
        ALTER FUNCTION public.check_player_security(UUID) SET search_path = public;
    END IF;
END $$;


-- 2. ROW LEVEL SECURITY (RLS) ENFORCEMENT
-- All public tables MUST have RLS enabled.

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.account_restrictions ENABLE ROW LEVEL SECURITY;

-- 3. SECURE POLICIES (Fixing "USING (true)" vulnerabilities)

-- Profiles: Users can only see and edit their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Game History: Users can view their own history (and maybe others for live feed, but strictly read-only)
DROP POLICY IF EXISTS "Users can view own game history" ON public.game_history;
CREATE POLICY "Users can view own game history" ON public.game_history
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Withdrawals: FIXING THE INSECURE "USING (true)"
DROP POLICY IF EXISTS "Users can view own withdrawals" ON public.withdrawals;
CREATE POLICY "Users can view own withdrawals" 
ON public.withdrawals FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Enable insert for withdrawals" ON public.withdrawals;
CREATE POLICY "Enable insert for withdrawals" 
ON public.withdrawals FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 4. SERVICE ROLE (BACKEND) POLICIES
-- Ensure background processes (Edge Functions) have full access.

DO $$ 
DECLARE
    table_name text;
BEGIN
    FOR table_name IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Service role unrestricted" ON public.%I', table_name);
        EXECUTE format('CREATE POLICY "Service role unrestricted" ON public.%I FOR ALL TO service_role USING (true) WITH CHECK (true)', table_name);
    END LOOP;
END $$;


-- 5. PERFORMANCE OPTIMIZATION (Slow Query Defense)
-- Add indexes for common filter/join columns.

CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON public.profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_profiles_last_ip ON public.profiles(last_ip);
CREATE INDEX IF NOT EXISTS idx_game_history_user_id ON public.game_history(user_id);
CREATE INDEX IF NOT EXISTS idx_game_history_game_name ON public.game_history(game_name);
CREATE INDEX IF NOT EXISTS idx_game_history_timestamp ON public.game_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_deposits_status ON public.deposits(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);


-- 6. SECURITY DEFAULTS (Fixing "Role mutable" for the public role)
-- Revoke all default permissions from the 'public' role to prevent unauthorized discovery.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM public;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM public;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM public;

-- Grant explicit access to authenticated role
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
