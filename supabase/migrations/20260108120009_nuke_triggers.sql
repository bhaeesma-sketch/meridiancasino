-- NUCLEAR OPTION: Dynamic Trigger Cleanup
-- This script dynamically finds AND DROPS ALL triggers on the 'profiles' table.
-- It solves the "Stack Depth Limit Exceeded" error caused by unknown/hidden triggers.

DO $$ 
DECLARE 
    trg record; 
BEGIN 
    -- 1. Loop through all triggers on public.profiles
    FOR trg IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'profiles' 
        AND event_object_schema = 'public'
    LOOP 
        -- 2. Drop each one dynamically
        RAISE NOTICE 'Dropping trigger: %', trg.trigger_name;
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON public.profiles CASCADE', trg.trigger_name); 
    END LOOP; 
END $$;

-- 3. Re-install the ONE safe trigger we need
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
