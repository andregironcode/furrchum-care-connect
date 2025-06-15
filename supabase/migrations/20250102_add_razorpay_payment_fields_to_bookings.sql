-- Add Razorpay payment fields to bookings table
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_provider TEXT DEFAULT 'razorpay',
  ADD COLUMN IF NOT EXISTS payment_data JSONB,
  ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

-- Create indexes on bookings for payment fields
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_razorpay_payment_id ON public.bookings(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_bookings_razorpay_order_id ON public.bookings(razorpay_order_id);

-- Update RLS policies for bookings to include new payment fields
DROP POLICY IF EXISTS "Enable access to payment status" ON public.bookings;
DROP POLICY IF EXISTS "Enable updates to payment status" ON public.bookings;

-- Recreate improved RLS policies for bookings
CREATE POLICY "Pet owners and vets can view bookings with payment info"
  ON public.bookings
  FOR SELECT
  USING (
    auth.uid() = pet_owner_id OR
    auth.uid() IN (
      SELECT id FROM public.vet_profiles WHERE id = vet_id
    )
  );

CREATE POLICY "Pet owners and vets can update bookings with payment info"
  ON public.bookings
  FOR UPDATE
  USING (
    auth.uid() = pet_owner_id OR
    auth.uid() IN (
      SELECT id FROM public.vet_profiles WHERE id = vet_id
    )
  )
  WITH CHECK (
    auth.uid() = pet_owner_id OR
    auth.uid() IN (
      SELECT id FROM public.vet_profiles WHERE id = vet_id
    )
  ); 