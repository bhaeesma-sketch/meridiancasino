-- ==========================================
-- FIX DATABASE SCHEMA (DUPLICATE COLUMNS)
-- ==========================================

-- 1. Migrate data from the Bad Column ("wallet address") to the Good Column (wallet_address)
--    (Only if the good column is empty for that row)
UPDATE public.profiles 
SET wallet_address = "wallet address" 
WHERE wallet_address IS NULL AND "wallet address" IS NOT NULL;

-- 2. Drop the Bad Column (The one with the space that caused the NOT NULL error)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS "wallet address";

-- 3. Fix the Good Column (wallet_address)
--    Enable Replica Identity to allow Deletes (Fixes "cannot delete..." error)
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

--    Delete invalid rows first to avoid errors
DELETE FROM public.profiles WHERE wallet_address IS NULL;

--    Make it Required and Unique
ALTER TABLE public.profiles ALTER COLUMN wallet_address SET NOT NULL;
ALTER TABLE public.profiles ADD CONSTRAINT IF NOT EXISTS profiles_wallet_address_key UNIQUE (wallet_address);
