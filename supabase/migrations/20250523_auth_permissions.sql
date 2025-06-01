
-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user_signup();

-- Create a function to handle new user signups using metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'user_type', 'pet_owner')
  );
  RETURN new;
END;
$$;

-- Create a trigger to run the function when a user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant proper permissions for the anon and authenticated roles
GRANT INSERT, SELECT ON public.profiles TO anon, authenticated;
GRANT USAGE ON SEQUENCE profiles_id_seq TO anon, authenticated;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
