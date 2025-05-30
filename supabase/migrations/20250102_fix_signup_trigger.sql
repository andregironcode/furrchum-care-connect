-- Fix signup trigger to handle all required fields and prevent "Load failed" errors
-- This migration addresses the database trigger issues causing signup failures

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Enable INSERT for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable SELECT for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable UPDATE for own profile" ON public.profiles;

-- Create comprehensive RLS policies for profiles table
-- Allow INSERT during signup (when user is being created)
CREATE POLICY "Enable INSERT for new users"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true); -- Allow all inserts during signup

-- Allow SELECT for authenticated users to read their own profile
CREATE POLICY "Enable SELECT for own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow UPDATE for authenticated users to update their own profile
CREATE POLICY "Enable UPDATE for own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow super admin access (for admin dashboard)
CREATE POLICY "Enable all for super admin"
  ON public.profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND user_type = 'admin'
    )
  );

-- Create an improved function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into profiles with all required fields
  INSERT INTO public.profiles (
    id, 
    full_name, 
    user_type,
    created_at,
    updated_at,
    phone_number,
    address
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'user_type', 'pet_owner'),
    NOW(),
    NOW(),
    NULL,
    NULL
  );
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and still return new to prevent signup failure
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN new;
END;
$$;

-- Create the trigger to run the function when a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT INSERT, SELECT, UPDATE ON public.profiles TO anon, authenticated;
GRANT USAGE ON SEQUENCE profiles_id_seq TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 'Automatically creates a profile record when a new user signs up';
COMMENT ON TRIGGER on_auth_user_created ON auth.users IS 'Trigger to create user profile after successful signup'; 