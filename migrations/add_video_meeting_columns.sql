-- Add video meeting columns to bookings table
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS meeting_id TEXT,
ADD COLUMN IF NOT EXISTS meeting_url TEXT,
ADD COLUMN IF NOT EXISTS host_meeting_url TEXT;

-- Add comment to the columns
COMMENT ON COLUMN bookings.meeting_id IS 'The unique ID of the Whereby video meeting';
COMMENT ON COLUMN bookings.meeting_url IS 'The URL for participants to join the video meeting';
COMMENT ON COLUMN bookings.host_meeting_url IS 'The URL for the veterinarian to host the video meeting';
