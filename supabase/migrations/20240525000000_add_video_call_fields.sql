-- Add new columns to bookings table for video call support
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS meeting_id TEXT,
  ADD COLUMN IF NOT EXISTS meeting_url TEXT,
  ADD COLUMN IF NOT EXISTS host_meeting_url TEXT,
  ADD COLUMN IF NOT EXISTS is_video_call BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS meeting_created_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS meeting_ended_at TIMESTAMPTZ;

-- Create an index on meeting_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_bookings_meeting_id ON public.bookings(meeting_id) WHERE meeting_id IS NOT NULL;

-- Update the RLS policies to include the new columns
-- (Assuming you have RLS enabled, adjust as needed)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow pet owners to see their own video call details
CREATE POLICY "Enable access to own video call details"
  ON public.bookings
  FOR SELECT
  USING (
    auth.uid() = pet_owner_id OR
    auth.uid() IN (
      SELECT id FROM public.vet_profiles WHERE id = vet_id
    )
  );

-- Allow updates to meeting details by both pet owners and vets
CREATE POLICY "Enable updates to own video call details"
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
