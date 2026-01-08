-- play_limbo RPC for secure server-side game logic
CREATE OR REPLACE FUNCTION play_limbo(
  p_bet_amount DECIMAL,
  p_target_multiplier DECIMAL,
  p_use_bonus BOOLEAN DEFAULT FALSE
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_wallet_address TEXT;
  v_balance DECIMAL;
  v_crash_point DECIMAL;
  v_is_win BOOLEAN;
  v_payout DECIMAL;
  v_history_id UUID;
  v_username TEXT;
BEGIN
  -- 1. Get User
  v_user_id := auth.uid();
  SELECT wallet_address, username,
         CASE WHEN p_use_bonus THEN bonus_balance ELSE real_balance END
  INTO v_wallet_address, v_username, v_balance
  FROM public.profiles
  WHERE id = v_user_id;

  -- 2. Validate
  IF v_balance < p_bet_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- 3. Generate Crash Point (Provably Fair Simulation)
  -- Stake-like house edge (1%)
  -- Formula: crash_point = floor(99 / (100 - random_percentage) * 100) / 100
  -- We use random() but in a real system we'd use seed + nonce
  v_crash_point := floor((0.99 / (1.0 - random())) * 100.0) / 100.0;
  IF v_crash_point < 1.00 THEN v_crash_point := 1.00; END IF;
  
  -- 4. Determine Result
  v_is_win := v_crash_point >= p_target_multiplier;
  
  IF v_is_win THEN
    v_payout := p_bet_amount * p_target_multiplier;
  ELSE
    v_payout := 0;
  END IF;

  -- 5. Atomic Update
  IF p_use_bonus THEN
    UPDATE public.profiles 
    SET bonus_balance = bonus_balance - p_bet_amount + v_payout,
        total_wagered = total_wagered + p_bet_amount
    WHERE id = v_user_id;
  ELSE
    UPDATE public.profiles 
    SET real_balance = real_balance - p_bet_amount + v_payout,
        total_wagered = total_wagered + p_bet_amount
    WHERE id = v_user_id;
  END IF;

  -- 6. Log History
  INSERT INTO public.game_history (
    user_id, wallet_address, username, game_name, bet_amount, payout, multiplier, result
  ) VALUES (
    v_user_id, v_wallet_address, v_username, 'Limbo', p_bet_amount, v_payout, 
    CASE WHEN v_is_win THEN p_target_multiplier ELSE 1.0 END,
    CASE WHEN v_is_win THEN 'WIN' ELSE 'LOSS' END
  ) RETURNING id INTO v_history_id;

  RETURN json_build_object(
    'crash_point', v_crash_point,
    'is_win', v_is_win,
    'payout', v_payout,
    'history_id', v_history_id,
    'balance', (SELECT CASE WHEN p_use_bonus THEN bonus_balance ELSE real_balance END FROM public.profiles WHERE id = v_user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION play_limbo TO authenticated;
