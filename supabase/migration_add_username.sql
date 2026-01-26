-- Migration: Add username column to profiles table
-- This migration adds a username field (extracted from email) to handle users
-- who may log in with different email domains (@iitd.ac.in vs @branch.iitd.ac.in)
-- Note: username is UNIQUE - it is the unique identifier of a person
-- Same person logging in with different email domains will use the same profile

-- Add username column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE profiles ADD COLUMN username TEXT;
    
    -- Populate username from existing emails
    UPDATE profiles 
    SET username = split_part(email, '@', 1)
    WHERE username IS NULL;
    
    -- Make username NOT NULL and UNIQUE (username is the unique identifier of a person)
    ALTER TABLE profiles 
      ALTER COLUMN username SET NOT NULL,
      ADD CONSTRAINT profiles_username_unique UNIQUE (username);
    
    -- Create index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
  END IF;
END $$;
