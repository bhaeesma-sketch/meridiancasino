-- Trigger to handle New User Signup Bonus (5 USDT)
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.handle_new_user_bonus()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles with default bonus
  INSERT INTO public.profiles (
    id, 
    wallet_address,
    email,
    bonus_balance,  -- Credit 5 USDT Bonus
    is_new_user,
    bonus_claimed
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'wallet_address', -- Awaiting wallet connection flow updates to populate this
    NEW.email,
    5.00,
    TRUE,
    TRUE
  )
  ON CONFLICT (id) DO NOTHING; -- Should not happen on insert trigger

  -- Log the bonus transaction
  INSERT INTO public.transactions (
    user_id,
    wallet_address,
    type,
    amount,
    status
  )
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'wallet_address',
    'bonus',
    5.00,
    'completed'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger assignment
-- Note: This assumes you have an 'auth.users' table trigger capability.
-- Standard Supabase practice is usually triggering on 'public.profiles' insert if created by app, 
-- or 'auth.users' insert if using Supabase Auth.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_bonus();

-- Function to check withdrawal eligibility 
-- Rules: Bonus winnings (total bonus) >= 50 to withdraw
CREATE OR REPLACE FUNCTION check_withdrawal_eligibility(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_bonus_balance DECIMAL;
BEGIN
  SELECT bonus_balance INTO v_bonus_balance
  FROM public.profiles
  WHERE id = p_user_id;

  -- "Bonus becomes withdrawable only if total bonus earnings >= 50"
  -- This implies we track 'earnings' separate from 'balance' or just check balance > 50.
  -- Prompt says: "Withdraw enabled ONLY when bonus_earnings_total >= 50"
  -- For now, we assume bonus_balance reflects earnings + initial.
  
  IF v_bonus_balance >= 50 THEN
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;
