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
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile (for role management)
-- Note: The trigger function will prevent self-promotion to Admin
CREATE POLICY "Admins can update any profile" ON profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- ============================================
-- RLS Policies for projects
-- ============================================

-- Everyone can view Open and Completed projects, or projects they created
CREATE POLICY "Open and Completed projects are viewable by everyone" ON projects
  FOR SELECT USING (status IN ('Open', 'Completed') OR created_by = auth.uid());

-- ARIES Members and Admins can create projects
CREATE POLICY "ARIES Members and Admins can create projects" ON projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('ARIES_Member', 'Admin')
    )
  );

-- Project creators can update their projects
CREATE POLICY "Project creators can update their projects" ON projects
  FOR UPDATE USING (created_by = auth.uid());

-- ============================================
-- RLS Policies for project_participants
-- ============================================

-- Users can view participants of projects they're involved in or Open/Completed projects
CREATE POLICY "Participants are viewable by project members or for Open/Completed projects" ON project_participants
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND (status IN ('Open', 'Completed') OR created_by = auth.uid())
    )
  );

-- Students can insert their own applications
CREATE POLICY "Students can apply to projects" ON project_participants
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    role = 'Mentee' AND
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Student'
    )
  );

-- Project creators can update participants (accept/reject/kick/promote)
-- This allows promoting accepted mentees to mentors
CREATE POLICY "Project creators can manage participants" ON project_participants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_id AND created_by = auth.uid()
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
      WHERE id = auth.uid() AND role = 'Admin'
    )
  );

-- Mentors can create reviews for their mentees
-- This checks that the mentor is actually a mentor for the project
-- and that the student is a mentee in that project
CREATE POLICY "Mentors can create reviews" ON reviews
  FOR INSERT WITH CHECK (
    mentor_id = auth.uid() AND
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
