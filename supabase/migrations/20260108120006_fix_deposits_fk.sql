-- FIX: Ensure profiles(id) is a Primary Key so it can be referenced

-- 1. Ensure 'id' in profiles is the Primary Key
-- Skipped to prevent breaking dependencies (profiles_pkey already exists)

-- 2. Drop the old Foreign Key on deposits that linked to auth.users (if it exists)
ALTER TABLE public.deposits DROP CONSTRAINT IF EXISTS deposits_user_id_fkey;

-- 3. Add the Foreign Key on deposits linking to profiles(id)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'deposits_profile_id_fkey') THEN
        ALTER TABLE public.deposits 
          ADD CONSTRAINT deposits_profile_id_fkey 
          FOREIGN KEY (user_id) REFERENCES public.profiles(id) 
          ON DELETE CASCADE;
    END IF;
END $$;

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
