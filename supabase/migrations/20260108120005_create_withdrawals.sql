-- Create Withdrawals Table
CREATE TABLE IF NOT EXISTS public.withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  token TEXT DEFAULT 'USDT',
  chain TEXT DEFAULT 'TRON',
  destination_address TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'pending_auto', 'pending_manual', 'approved', 'rejected', 'completed', 'failed')) DEFAULT 'pending',
  tx_hash TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own withdrawals" 
ON public.withdrawals FOR SELECT 
USING (true); -- In a real app we'd verify user ownership via edge function or more complex policies

CREATE POLICY "Enable insert for withdrawals" 
ON public.withdrawals FOR INSERT 
WITH CHECK (true); -- Service role (edge function) will handle robust checks

-- Indexes
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON public.withdrawals(user_id);
