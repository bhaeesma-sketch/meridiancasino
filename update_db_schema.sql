-- Add real_balance and bonus_balance, defaulting to 0
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS real_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_balance NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS valid_referral_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_first_deposit BOOLEAN DEFAULT FALSE;

-- Update existing balance transfers if needed (for backwards compatibility)
UPDATE profiles SET real_balance = balance WHERE real_balance = 0 AND balance > 0;
