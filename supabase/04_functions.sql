-- ARIES Project Portal - Functions
-- Create database functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to get current username from JWT email (part before @)
CREATE OR REPLACE FUNCTION current_username()
RETURNS TEXT AS $$
  SELECT split_part((auth.jwt() ->> 'email'), '@', 1);
$$ language 'sql' STABLE;

-- Function to get current profile id based on username
CREATE OR REPLACE FUNCTION current_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE username = current_username() LIMIT 1;
$$ language 'sql' STABLE SECURITY DEFINER;

-- Function to prevent self-promotion to Admin
CREATE OR REPLACE FUNCTION prevent_self_admin_promotion()
RETURNS TRIGGER AS $$
BEGIN
  -- If trying to set role to Admin, check if user is already an Admin
  IF NEW.role = 'Admin' AND OLD.role != 'Admin' THEN
    -- Allow if using service role (auth.uid() is NULL for service role)
    -- Or if current user is already an Admin
    IF auth.uid() IS NULL THEN
      -- Service role update, allow it
      RETURN NEW;
    ELSIF NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = current_profile_id() AND role = 'Admin'
    ) THEN
      RAISE EXCEPTION 'Only existing Admins can promote users to Admin role';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_username TEXT;
  v_full_name TEXT;
  v_existing_profile_id UUID;
BEGIN
  -- Extract username (part before @)
  v_username := split_part(NEW.email, '@', 1);
  v_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.user_metadata->>'full_name',
    v_username
  );
  
  -- Check if a profile with this username already exists
  SELECT id INTO v_existing_profile_id
  FROM public.profiles
  WHERE username = v_username
  LIMIT 1;
  
  IF v_existing_profile_id IS NOT NULL THEN
    -- Username already exists - this is the same person logging in with different email
    -- Update the existing profile's email to the new one
    -- Don't create a new profile - username is the unique identifier
    UPDATE public.profiles
    SET email = NEW.email,
        updated_at = NOW()
    WHERE id = v_existing_profile_id;
  ELSE
    -- New username - create new profile
    INSERT INTO public.profiles (id, username, email, full_name, role)
    VALUES (
      NEW.id,
      v_username,
      NEW.email,
      v_full_name,
      'Student'
    )
    ON CONFLICT (id) DO UPDATE
      SET email = NEW.email,
          username = v_username,
          updated_at = NOW();
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If username unique constraint is violated, someone else has this username
    -- This shouldn't happen, but log it
    RAISE WARNING 'Username % already exists for a different user', v_username;
    RETURN NEW;
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to ensure profile exists (can be called manually)
-- This function finds or creates a profile based on username (the unique identifier)
CREATE OR REPLACE FUNCTION ensure_user_profile(user_id UUID)
RETURNS void AS $$
DECLARE
  v_user_email TEXT;
  v_username TEXT;
  v_full_name TEXT;
  v_existing_profile_id UUID;
BEGIN
  SELECT email, 
         COALESCE(
           raw_user_meta_data->>'full_name',
           user_metadata->>'full_name',
           split_part(email, '@', 1)
         )
  INTO v_user_email, v_full_name
  FROM auth.users
  WHERE id = user_id;
  
  IF v_user_email IS NULL THEN
    RETURN; -- User not found
  END IF;
  
  -- Extract username (the unique identifier of a person)
  v_username := split_part(v_user_email, '@', 1);
  
  -- Check if profile with this username already exists (username is the unique identifier)
  SELECT id INTO v_existing_profile_id
  FROM public.profiles
  WHERE username = v_username
  LIMIT 1;
  
  IF v_existing_profile_id IS NOT NULL THEN
    -- Username exists - this is the same person
    -- Update the existing profile's email to the new one
    UPDATE public.profiles
    SET email = v_user_email,
        updated_at = NOW()
    WHERE id = v_existing_profile_id;
  ELSIF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
    -- Profile exists for this user_id - update email and username if needed
    UPDATE public.profiles
    SET email = v_user_email,
        username = v_username,
        updated_at = NOW()
    WHERE id = user_id;
  ELSE
    -- New username - create new profile
    INSERT INTO public.profiles (id, username, email, full_name, role)
    VALUES (user_id, v_username, v_user_email, v_full_name, 'Student')
    ON CONFLICT (id) DO UPDATE
      SET email = v_user_email,
          username = v_username,
          updated_at = NOW();
  END IF;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to get profile by username (for finding profiles across different email domains)
CREATE OR REPLACE FUNCTION get_profile_by_username(username_param TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  email TEXT,
  full_name TEXT,
  branch TEXT,
  role user_role,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.email, p.full_name, p.branch, p.role, p.created_at, p.updated_at
  FROM public.profiles p
  WHERE p.username = username_param
  LIMIT 1;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_participants_updated_at ON project_participants;
CREATE TRIGGER update_project_participants_updated_at 
  BEFORE UPDATE ON project_participants
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to prevent self-admin promotion
DROP TRIGGER IF EXISTS prevent_self_admin_trigger ON profiles;
CREATE TRIGGER prevent_self_admin_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_admin_promotion();

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
