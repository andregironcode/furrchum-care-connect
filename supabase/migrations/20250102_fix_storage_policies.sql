-- Fix storage bucket policies for vet profile uploads
-- This addresses permission issues that cause intermittent upload failures

-- Create or update bucket for vet profiles if it doesn't exist
-- Note: This should be done via Supabase Dashboard or CLI, but we'll try via SQL
DO $$ 
BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'vet_profiles', 
        'vet_profiles', 
        true,
        52428800, -- 50MB limit
        ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']::text[]
    )
    ON CONFLICT (id) DO UPDATE SET
        public = true,
        file_size_limit = 52428800,
        allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']::text[];
EXCEPTION 
    WHEN others THEN
        RAISE NOTICE 'Bucket creation failed or already exists: %', SQLERRM;
END $$;

-- Note: Storage RLS policies in Supabase should typically be set via Dashboard
-- The following are the policies that should be created manually in Supabase Dashboard:

-- Policy 1: Allow authenticated users to upload files to their own folder
-- Name: "Users can upload their own files"
-- Operation: INSERT
-- Target roles: authenticated
-- Policy definition:
-- (bucket_id = 'vet_profiles'::text) AND 
-- ((storage.foldername(name))[1] = 'profile_images'::text) AND 
-- ((storage.foldername(name))[2] = (auth.uid())::text)
-- OR 
-- (bucket_id = 'vet_profiles'::text) AND 
-- ((storage.foldername(name))[1] = 'licenses'::text) AND 
-- ((storage.foldername(name))[2] = (auth.uid())::text)
-- OR 
-- (bucket_id = 'vet_profiles'::text) AND 
-- ((storage.foldername(name))[1] = 'clinic_images'::text) AND 
-- ((storage.foldername(name))[2] = (auth.uid())::text)

-- Policy 2: Allow public read access
-- Name: "Public read access"
-- Operation: SELECT  
-- Target roles: public
-- Policy definition:
-- bucket_id = 'vet_profiles'::text

-- Policy 3: Allow users to update their own files
-- Name: "Users can update their own files"
-- Operation: UPDATE
-- Target roles: authenticated
-- Using same definition as INSERT policy

-- Policy 4: Allow users to delete their own files  
-- Name: "Users can delete their own files"
-- Operation: DELETE
-- Target roles: authenticated
-- Using same definition as INSERT policy

-- Alternative: Create RLS policies programmatically (may work depending on permissions)
DO $$ 
BEGIN
    -- Try to create policies programmatically
    -- This may fail if insufficient permissions, but we'll try
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
    DROP POLICY IF EXISTS "Public read access" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
    
    -- Enable RLS
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    
    -- Create upload policy
    CREATE POLICY "Users can upload their own files"
    ON storage.objects FOR INSERT TO authenticated WITH CHECK (
        bucket_id = 'vet_profiles' AND
        (
            ((storage.foldername(name))[1] = 'profile_images' AND (storage.foldername(name))[2] = auth.uid()::text) OR
            ((storage.foldername(name))[1] = 'licenses' AND (storage.foldername(name))[2] = auth.uid()::text) OR
            ((storage.foldername(name))[1] = 'clinic_images' AND (storage.foldername(name))[2] = auth.uid()::text)
        )
    );
    
    -- Create read policy
    CREATE POLICY "Public read access"
    ON storage.objects FOR SELECT TO public USING (
        bucket_id = 'vet_profiles'
    );
    
    -- Create update policy
    CREATE POLICY "Users can update their own files"
    ON storage.objects FOR UPDATE TO authenticated USING (
        bucket_id = 'vet_profiles' AND
        (
            ((storage.foldername(name))[1] = 'profile_images' AND (storage.foldername(name))[2] = auth.uid()::text) OR
            ((storage.foldername(name))[1] = 'licenses' AND (storage.foldername(name))[2] = auth.uid()::text) OR
            ((storage.foldername(name))[1] = 'clinic_images' AND (storage.foldername(name))[2] = auth.uid()::text)
        )
    );
    
    -- Create delete policy
    CREATE POLICY "Users can delete their own files"
    ON storage.objects FOR DELETE TO authenticated USING (
        bucket_id = 'vet_profiles' AND
        (
            ((storage.foldername(name))[1] = 'profile_images' AND (storage.foldername(name))[2] = auth.uid()::text) OR
            ((storage.foldername(name))[1] = 'licenses' AND (storage.foldername(name))[2] = auth.uid()::text) OR
            ((storage.foldername(name))[1] = 'clinic_images' AND (storage.foldername(name))[2] = auth.uid()::text)
        )
    );
    
    RAISE NOTICE 'Storage policies created successfully';
    
EXCEPTION 
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'Insufficient privileges to create storage policies. Please set up storage policies manually in Supabase Dashboard.';
    WHEN others THEN
        RAISE NOTICE 'Error creating storage policies: %. Please set up storage policies manually in Supabase Dashboard.', SQLERRM;
END $$; 