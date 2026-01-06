-- =====================================
-- DATABASE DEBUGGING SCRIPT
-- =====================================

-- 1. Check Table Columns (Verify 'wallet_address' exists)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- 2. Attempt Direct SQL Insert (Test if DB creates user)
INSERT INTO public.profiles (
  id, 
  wallet_address, 
  username, 
  balance, 
  is_new_user, 
  bonus_claimed
)
VALUES (
  gen_random_uuid(), 
  '0xDEBUG_TEST_ADDRESS', 
  'DebugUser', 
  10, 
  true, 
  true
);

-- 3. Check if it worked
SELECT * FROM public.profiles WHERE wallet_address = '0xDEBUG_TEST_ADDRESS';
