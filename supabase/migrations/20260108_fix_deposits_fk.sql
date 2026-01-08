-- FIX: Ensure profiles(id) is a Primary Key so it can be referenced

-- 1. Ensure 'id' in profiles is the Primary Key
-- We drop the constraint first (if likely named profiles_pkey) to avoid conflicts if it exists on wrong columns
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE public.profiles ADD PRIMARY KEY (id);

-- 2. Drop the old Foreign Key on deposits that linked to auth.users (if it exists)
ALTER TABLE public.deposits DROP CONSTRAINT IF EXISTS deposits_user_id_fkey;

-- 3. Add the Foreign Key on deposits linking to profiles(id)
ALTER TABLE public.deposits 
  ADD CONSTRAINT deposits_profile_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) 
  ON DELETE CASCADE;

-- 4. Update RLS Policies for Deposits (Open access for verified wallet flow)
DROP POLICY IF EXISTS "Users can view own deposits" ON public.deposits;
DROP POLICY IF EXISTS "Enable read access for deposits" ON public.deposits;
DROP POLICY IF EXISTS "Enable insert for deposits" ON public.deposits;

CREATE POLICY "Enable read access for deposits" 
ON public.deposits FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for deposits" 
ON public.deposits FOR INSERT 
WITH CHECK (true);

-- 5. Ensure pay_address column exists
ALTER TABLE public.deposits ADD COLUMN IF NOT EXISTS pay_address TEXT;
