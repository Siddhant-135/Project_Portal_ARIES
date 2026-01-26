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
    -- Only allow if current user is already an Admin
    IF NOT EXISTS (
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
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'Student'
  );
  RETURN NEW;
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
