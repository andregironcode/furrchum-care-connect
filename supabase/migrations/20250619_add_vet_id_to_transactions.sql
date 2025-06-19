-- Add vet_id column to transactions table to link transactions to veterinarians
ALTER TABLE public.transactions 
ADD COLUMN vet_id uuid NULL;

-- Add foreign key constraint to vet_profiles
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_vet_id_fkey 
FOREIGN KEY (vet_id) REFERENCES vet_profiles (id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_vet_id 
ON public.transactions USING btree (vet_id);

-- Update RLS policy for vets to use the new vet_id field
DROP POLICY IF EXISTS "Vets can view their booking transactions" ON public.transactions;

CREATE POLICY "Vets can view their transactions" ON public.transactions
  FOR SELECT USING (
    auth.uid() = vet_id OR 
    auth.uid() IN (
      SELECT vet_id FROM bookings WHERE id = booking_id
    ) OR
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'user_type' = 'admin'
    )
  ); 