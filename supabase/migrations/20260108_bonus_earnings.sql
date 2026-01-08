-- Add bonus_earnings_total to track wagering performance of bonus funds
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bonus_earnings_total DECIMAL(12, 2) DEFAULT 0;

-- Update update_user_balance for separate earnings tracking if needed
-- Actually, the prompt says "Withdraw enabled ONLY when bonus_earnings_total >= 50"
-- This implies we increment bonus_earnings_total when a user wins a bet made with bonus funds.
-- For now, we add the column so the frontend can check it.
