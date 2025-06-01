-- Add phone_number and address fields to profiles table for medicine delivery
-- This allows pet owners to share contact information with vets

ALTER TABLE profiles 
ADD COLUMN phone_number TEXT,
ADD COLUMN address TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone_number ON profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_address ON profiles(address);

-- Add comment to explain the purpose
COMMENT ON COLUMN profiles.phone_number IS 'Pet owner phone number for medicine delivery coordination';
COMMENT ON COLUMN profiles.address IS 'Pet owner address for medicine delivery'; 