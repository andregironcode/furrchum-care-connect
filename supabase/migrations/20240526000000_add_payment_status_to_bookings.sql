-- Add payment_status column to bookings table
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending';

-- Update RLS policies to include payment_status
-- (Assuming RLS is already enabled from previous migrations)

-- Allow pet owners and vets to see payment status
CREATE POLICY "Enable access to payment status"
  ON public.bookings
  FOR SELECT
  USING (
    auth.uid() = pet_owner_id OR
    auth.uid() IN (
      SELECT id FROM public.vet_profiles WHERE id = vet_id
    )
  );

-- Allow updates to payment status by both pet owners and vets
CREATE POLICY "Enable updates to payment status"
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
