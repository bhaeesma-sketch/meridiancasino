-- Security Fix: Enable RLS on account_restrictions
-- This table was identified by Security Advisor as missing RLS.

ALTER TABLE IF EXISTS public.account_restrictions ENABLE ROW LEVEL SECURITY;

-- Grant full access to Service Role (Backend)
-- We use DROP IF EXISTS to avoid conflicts if re-run
DROP POLICY IF EXISTS "Service role unrestricted" ON public.account_restrictions;

CREATE POLICY "Service role unrestricted" ON public.account_restrictions
FOR ALL TO service_role 
USING (true) 
WITH CHECK (true);
