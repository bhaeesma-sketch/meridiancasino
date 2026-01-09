-- Migration to track user login activity
-- 1. Add last_login_at column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT now();

-- 2. Index for performance (admin dashboard queries)
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON public.profiles(last_login_at DESC);

-- 3. Security Hardening: Ensure functions can access it if needed
-- (Handled by previous hardening script, but good to be aware of)
