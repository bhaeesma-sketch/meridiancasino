-- Casino Clash: Web3 Features Database Migration
-- Run this in Supabase SQL Editor

-- Step 1: Add dual balance columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS real_balance DECIMAL(18,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_balance DECIMAL(18,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS valid_referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_first_deposit BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS total_wagered DECIMAL(18,2) DEFAULT 0;

-- Step 2: Migrate existing balance to real_balance (one-time migration)
-- This moves any existing balance to withdrawable real_balance
UPDATE profiles 
SET real_balance = balance 
WHERE real_balance = 0 AND balance > 0;

-- Step 3: Create index for referral lookups (performance)
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- Step 4: Add check constraint to prevent negative balances
ALTER TABLE profiles 
ADD CONSTRAINT check_real_balance_positive CHECK (real_balance >= 0),
ADD CONSTRAINT check_bonus_balance_positive CHECK (bonus_balance >= 0);

-- Verification query: Check that migration worked
-- SELECT wallet_address, balance, real_balance, bonus_balance, valid_referral_count 
-- FROM profiles LIMIT 10;
