-- Add vaccination_certificate_url column to pets table
-- This allows pet owners to upload vaccination certificates

-- Add the vaccination_certificate_url column to the pets table
ALTER TABLE pets ADD COLUMN IF NOT EXISTS vaccination_certificate_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN pets.vaccination_certificate_url IS 'URL path to vaccination certificate file stored in Supabase storage';

-- Create an index for better query performance if needed
CREATE INDEX IF NOT EXISTS idx_pets_vaccination_certificate ON pets(vaccination_certificate_url) WHERE vaccination_certificate_url IS NOT NULL;

-- Update RLS policies to allow pet owners to read/write their own vaccination certificates
-- The existing RLS policies for pets table should already cover this, but let's ensure they're comprehensive

-- Ensure pet owners can read their own pets' vaccination certificates
DROP POLICY IF EXISTS "Pet owners can read their own pets" ON pets;
CREATE POLICY "Pet owners can read their own pets" ON pets
  FOR SELECT USING (auth.uid() = owner_id);

-- Ensure pet owners can update their own pets' vaccination certificates
DROP POLICY IF EXISTS "Pet owners can update their own pets" ON pets;
CREATE POLICY "Pet owners can update their own pets" ON pets
  FOR UPDATE USING (auth.uid() = owner_id);

-- Ensure pet owners can insert their own pets with vaccination certificates
DROP POLICY IF EXISTS "Pet owners can insert their own pets" ON pets;
CREATE POLICY "Pet owners can insert their own pets" ON pets
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Ensure pet owners can delete their own pets
DROP POLICY IF EXISTS "Pet owners can delete their own pets" ON pets;
CREATE POLICY "Pet owners can delete their own pets" ON pets
  FOR DELETE USING (auth.uid() = owner_id);

-- Allow vets to read pet vaccination certificates for their appointments
DROP POLICY IF EXISTS "Vets can read pets for their appointments" ON pets;
CREATE POLICY "Vets can read pets for their appointments" ON pets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings 
      WHERE bookings.pet_id = pets.id 
      AND bookings.vet_id = auth.uid()
    )
  );

-- Allow super admins to read all pets
DROP POLICY IF EXISTS "Super admins can read all pets" ON pets;
CREATE POLICY "Super admins can read all pets" ON pets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'super_admin'
    )
  ); 