-- Fix transactions table by adding missing columns for Razorpay integration
-- Add missing columns to existing transactions table
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS pet_owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS provider TEXT DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS provider_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_order_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Update currency default to INR for Indian market
ALTER TABLE public.transactions 
  ALTER COLUMN currency SET DEFAULT 'INR';

-- Enable RLS on transactions table if not already enabled
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Pet owners can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Pet owners can insert their own transactions" ON public.transactions;

-- Create RLS policies for transactions table
CREATE POLICY "Pet owners can view their own transactions"
  ON public.transactions
  FOR SELECT
  USING (auth.uid() = pet_owner_id);

CREATE POLICY "Pet owners can insert their own transactions"
  ON public.transactions
  FOR INSERT
  WITH CHECK (auth.uid() = pet_owner_id);

-- Create indexes for better performance on new columns
CREATE INDEX IF NOT EXISTS idx_transactions_pet_owner_id ON public.transactions(pet_owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_intent_id ON public.transactions(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_provider_payment_id ON public.transactions(provider_payment_id);
CREATE INDEX IF NOT EXISTS idx_transactions_provider_order_id ON public.transactions(provider_order_id);

-- Update existing transactions to have pet_owner_id from bookings table
-- This will populate the pet_owner_id for any existing transactions
UPDATE public.transactions 
SET pet_owner_id = bookings.pet_owner_id
FROM public.bookings 
WHERE transactions.booking_id = bookings.id 
AND transactions.pet_owner_id IS NULL; 