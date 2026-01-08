-- AGGRESSIVE FIX for Recursion
-- We need to ensure NO bad triggers remain on profiles or auth.users that insert into profiles

-- 1. Drop known triggers on public.profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
DROP TRIGGER IF EXISTS on_profile_insert ON public.profiles;
DROP TRIGGER IF EXISTS handle_new_user_bonus ON public.profiles;
DROP TRIGGER IF EXISTS update_user_balance ON public.profiles; 

-- 2. Drop known triggers on auth.users (This is often the culprit)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_user_created ON auth.users;

-- 3. Re-create the SAFE trigger on public.profiles ONLY
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Set default bonus if not already set (SAFE LOGIC: No Inserts here!)
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

CREATE TRIGGER on_profile_insert
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_profile();

-- 4. Verify no other functions are causing issues
-- (No action needed, just removing the trigger path breaks the loop)
