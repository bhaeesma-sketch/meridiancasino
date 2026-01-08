-- FIX: infinite recursion on profiles insert
-- The previous function 'handle_new_user_bonus' was likely attached to 'profiles' incorrectly,
-- causing an INSERT loop (inserting into profiles triggers an insert into profiles).

-- 1. Drop potential bad triggers on 'profiles'
DROP TRIGGER IF EXISTS on_auth_user_created ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_insert ON public.profiles;
DROP TRIGGER IF EXISTS handle_new_user_bonus ON public.profiles;

-- 2. Create a SAFE function for new profile setup (Wallet Users)
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Set default bonus if not already set
  IF NEW.bonus_balance IS NULL THEN
    NEW.bonus_balance := 5.00;
  END IF;
  
  -- Set flags
  IF NEW.is_new_user IS NULL THEN
    NEW.is_new_user := TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the simplified trigger (BEFORE INSERT)
CREATE TRIGGER on_profile_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile();

-- 4. Clean up any bad data if needed (Optional)
-- DELETE FROM public.transactions WHERE created_at ... (Skip for safety)
