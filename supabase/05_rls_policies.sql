-- ARIES Project Portal - Row Level Security Policies
-- Enable RLS and create security policies

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for re-running)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

DROP POLICY IF EXISTS "Open and Completed projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "ARIES Members and Admins can create projects" ON projects;
DROP POLICY IF EXISTS "Project creators can update their projects" ON projects;

DROP POLICY IF EXISTS "Participants are viewable by project members or for Open/Completed projects" ON project_participants;
DROP POLICY IF EXISTS "Students can apply to projects" ON project_participants;
DROP POLICY IF EXISTS "Project creators can manage participants" ON project_participants;

DROP POLICY IF EXISTS "Only Admins can view reviews" ON reviews;
DROP POLICY IF EXISTS "Mentors can create reviews" ON reviews;

-- ============================================
-- RLS Policies for profiles
-- ============================================

-- Everyone can read profiles (public)
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can insert their own profile during signup
-- Note: Profile creation is typically handled by the database trigger (handle_new_user),
-- but this policy allows manual insertion if needed
-- The trigger uses SECURITY DEFINER to bypass RLS, so it will work regardless
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT 
  WITH CHECK (
    -- Allow if user is inserting their own profile
    auth.uid() = id OR
    -- Allow if no authenticated user (for trigger function)
    auth.uid() IS NULL
  );

-- Users can update their own profile (non-role fields)
-- Note: The trigger function will prevent self-promotion to Admin
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE 
  USING (current_profile_id() = id)
  WITH CHECK (current_profile_id() = id);

-- Admins can update any profile (for role management)
-- Note: The trigger function will prevent self-promotion to Admin
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = current_profile_id() AND role = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = current_profile_id() AND role = 'Admin'
    )
  );

-- ============================================
-- RLS Policies for projects
-- ============================================

-- Drop existing policy for clean re-creation
DROP POLICY IF EXISTS "Open and Completed projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Projects are viewable based on status" ON projects;

-- Everyone can view Open, Launched (ongoing), and Completed projects, or projects they created
CREATE POLICY "Projects are viewable based on status" ON projects
  FOR SELECT USING (status IN ('Open', 'Launched', 'Completed') OR created_by = current_profile_id());

-- ARIES Members and Admins can create projects
CREATE POLICY "ARIES Members and Admins can create projects" ON projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = current_profile_id() AND role IN ('ARIES_Member', 'Admin')
    )
  );

-- Project creators can update their projects
CREATE POLICY "Project creators can update their projects" ON projects
  FOR UPDATE USING (created_by = current_profile_id());

-- ============================================
-- RLS Policies for project_participants
-- ============================================

-- Drop existing policies for clean re-creation
DROP POLICY IF EXISTS "Participants are viewable by project members or for Open/Completed projects" ON project_participants;
DROP POLICY IF EXISTS "Students can apply to projects" ON project_participants;
DROP POLICY IF EXISTS "Users can apply to projects" ON project_participants;
DROP POLICY IF EXISTS "Project creators can add mentor" ON project_participants;
DROP POLICY IF EXISTS "Project creators can manage participants" ON project_participants;
DROP POLICY IF EXISTS "Project creators can delete participants" ON project_participants;

-- Users can view participants of projects they're involved in or Open/Completed projects
CREATE POLICY "Participants are viewable by project members or for Open/Completed projects" ON project_participants
  FOR SELECT USING (
    user_id = current_profile_id() OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND (status IN ('Open', 'Completed', 'Launched') OR created_by = current_profile_id())
    )
  );

-- Anyone can apply to projects as Mentee (role hierarchy: Admin ⊃ ARIES_Member ⊃ Student)
-- They cannot apply to their own projects
CREATE POLICY "Users can apply to projects" ON project_participants
  FOR INSERT WITH CHECK (
    -- User is inserting for themselves
    user_id = current_profile_id() AND
    -- As a Mentee (applying)
    role = 'Mentee' AND
    -- Not applying to their own project
    NOT EXISTS (
      SELECT 1 FROM projects WHERE id = project_id AND created_by = current_profile_id()
    )
  );

-- Project creators can add themselves as Mentor when creating a project
CREATE POLICY "Project creators can add mentor" ON project_participants
  FOR INSERT WITH CHECK (
    -- User is the project creator
    EXISTS (
      SELECT 1 FROM projects WHERE id = project_id AND created_by = current_profile_id()
    ) AND
    -- Adding themselves as Mentor
    user_id = current_profile_id() AND
    role = 'Mentor'
  );

-- Project creators can update participants (accept/reject/kick/promote)
CREATE POLICY "Project creators can manage participants" ON project_participants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND created_by = current_profile_id()
    )
  );

-- Project creators can delete participants (reject applications)
CREATE POLICY "Project creators can delete participants" ON project_participants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND created_by = current_profile_id()
    )
  );

-- ============================================
-- RLS Policies for reviews
-- ============================================

-- Only Admins can view reviews
CREATE POLICY "Only Admins can view reviews" ON reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = current_profile_id() AND role = 'Admin'
    )
  );

-- Mentors can create reviews for their mentees
-- This checks that the mentor is actually a mentor for the project
-- and that the student is a mentee in that project
CREATE POLICY "Mentors can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    mentor_id = current_profile_id() AND
    -- Verify mentor is actually a mentor for this project
    EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_id = reviews.project_id
        AND user_id = reviews.mentor_id
        AND role = 'Mentor'
        AND status = 'Active'
    ) AND
    -- Verify student is a mentee in this project
    EXISTS (
      SELECT 1 FROM project_participants
      WHERE project_id = reviews.project_id
        AND user_id = reviews.student_id
        AND role = 'Mentee'
    )
  );
