-- Migration: Create profiles for existing users who don't have one
-- Run this if you have users in auth.users but no corresponding profiles

-- Function to create missing profiles
CREATE OR REPLACE FUNCTION create_missing_profiles()
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
    'Student'
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Execute the function to create missing profiles
SELECT create_missing_profiles();

-- Clean up the temporary function (optional - you can keep it for future use)
-- DROP FUNCTION IF EXISTS create_missing_profiles();
