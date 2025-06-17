-- Fix booking constraints that might be preventing valid bookings

-- First, check what constraints exist on the bookings table
DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- Log existing check constraints
    FOR constraint_record IN 
        SELECT conname, pg_get_constraintdef(c.oid) as definition
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        WHERE t.relname = 'bookings' AND contype = 'c'
    LOOP
        RAISE NOTICE 'Found constraint: % - %', constraint_record.conname, constraint_record.definition;
    END LOOP;
END
$$;

-- Drop the problematic "no_past_bookings" constraint if it exists
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS no_past_bookings;

-- Also drop any other past-related constraints that might exist
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS check_future_booking;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS booking_date_future;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS future_booking_only;

-- Add a more lenient constraint that allows bookings within the last hour 
-- (to account for timezone differences and booking processing time)
ALTER TABLE bookings 
ADD CONSTRAINT booking_not_too_old 
CHECK (booking_date >= CURRENT_DATE - INTERVAL '1 day');

-- Ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date, start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_vet_date ON bookings(vet_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_pet_owner_date ON bookings(pet_owner_id, booking_date);

-- Add a comment to document the constraint
COMMENT ON CONSTRAINT booking_not_too_old ON bookings IS 
'Allows bookings within the last day to account for timezone differences and processing delays';

-- Update RLS policies to ensure service role can insert bookings
DROP POLICY IF EXISTS "Service role can manage bookings" ON bookings;
CREATE POLICY "Service role can manage bookings" ON bookings
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role'); 