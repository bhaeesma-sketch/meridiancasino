-- Create Deposits Table for NOWPayments Integration
CREATE TABLE IF NOT EXISTS public.deposits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id TEXT UNIQUE NOT NULL,
  payment_id TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  currency TEXT DEFAULT 'USDT',
  network TEXT, -- TRC20, ERC20
  status TEXT CHECK (status IN ('pending', 'waiting', 'confirming', 'confirmed', 'sending', 'finished', 'failed', 'refunded', 'expired')) DEFAULT 'pending',
  invoice_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies for Deposits
ALTER TABLE public.deposits ENABLE ROW LEVEL SECURITY;

-- Users can view their own deposits
CREATE POLICY "Users can view own deposits" 
ON public.deposits FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

-- Request Row for Edge Function (Service Role)
-- Service role has full access by default, but nice to be explicit if needed specific roles.

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deposits_user ON public.deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_order ON public.deposits(order_id);
CREATE INDEX IF NOT EXISTS idx_deposits_payment ON public.deposits(payment_id);

-- Trigger for Updated At
CREATE TRIGGER update_deposits_updated_at
    BEFORE UPDATE ON public.deposits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
