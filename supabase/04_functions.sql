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
      WHERE id = auth.uid() AND role = 'Admin'
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
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.user_metadata->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    'Student'
  )
  ON CONFLICT (id) DO NOTHING; -- Prevent errors if profile already exists
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to ensure profile exists (can be called manually)
CREATE OR REPLACE FUNCTION ensure_user_profile(user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  SELECT 
    au.id,
    au.email,
    COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.user_metadata->>'full_name',
      split_part(au.email, '@', 1)
    ),
    'Student'
  FROM auth.users au
  WHERE au.id = user_id
    AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id)
  ON CONFLICT (id) DO NOTHING;
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
