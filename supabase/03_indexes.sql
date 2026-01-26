-- ARIES Project Portal - Indexes
-- Create indexes for performance optimization

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects(created_by);

-- Project participants indexes
CREATE INDEX IF NOT EXISTS idx_project_participants_project_id ON project_participants(project_id);
CREATE INDEX IF NOT EXISTS idx_project_participants_user_id ON project_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_project_participants_status ON project_participants(status);
CREATE INDEX IF NOT EXISTS idx_project_participants_role ON project_participants(role);

-- Reviews indexes
CREATE INDEX IF NOT EXISTS idx_reviews_project_id ON reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_reviews_student_id ON reviews(student_id);
CREATE INDEX IF NOT EXISTS idx_reviews_mentor_id ON reviews(mentor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_project_mentor ON reviews(project_id, mentor_id);
