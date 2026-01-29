-- ARIES Project Portal - Reset Projects
-- This script deletes all projects and their dependencies
-- 
-- WARNING: This is DESTRUCTIVE and IRREVERSIBLE!
-- All projects, participants, and reviews will be permanently deleted.
--
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- ============================================
-- PREVIEW: See what will be deleted
-- ============================================
-- Run these queries first to understand the impact:

-- Count of projects to be deleted:
SELECT COUNT(*) AS projects_count FROM projects;

-- Count of project participants to be deleted:
SELECT COUNT(*) AS participants_count FROM project_participants;

-- Count of reviews to be deleted:
SELECT COUNT(*) AS reviews_count FROM reviews;

-- List all projects that will be deleted:
SELECT p.id, p.title, p.status, pr.full_name AS created_by, p.created_at
FROM projects p
JOIN profiles pr ON p.created_by = pr.id
ORDER BY p.created_at;


-- ============================================
-- DELETE ALL PROJECTS (CASCADE deletes dependencies)
-- ============================================
-- Due to ON DELETE CASCADE foreign keys, deleting from projects
-- will automatically delete:
--   - All project_participants records
--   - All reviews records
--
-- UNCOMMENT THE LINE BELOW TO EXECUTE:

-- DELETE FROM projects;


-- ============================================
-- VERIFY DELETION
-- ============================================
-- After running the delete, verify everything is cleared:

-- SELECT 'projects' AS table_name, COUNT(*) AS remaining FROM projects
-- UNION ALL
-- SELECT 'project_participants', COUNT(*) FROM project_participants
-- UNION ALL
-- SELECT 'reviews', COUNT(*) FROM reviews;


-- ============================================
-- ALTERNATIVE: Delete specific projects only
-- ============================================
-- If you only want to delete certain projects:

-- Delete by project ID:
-- DELETE FROM projects WHERE id = 'project-uuid-here';

-- Delete by status:
-- DELETE FROM projects WHERE status = 'Terminated';

-- Delete projects created by a specific user:
-- DELETE FROM projects WHERE created_by = 'user-uuid-here';

-- Delete projects older than a date:
-- DELETE FROM projects WHERE created_at < '2024-01-01';


-- ============================================
-- ALTERNATIVE: Delete only participants or reviews
-- ============================================
-- If you want to keep projects but clear participants/reviews:

-- Clear all project participants (keeps projects):
-- DELETE FROM project_participants;

-- Clear all reviews (keeps projects and participants):
-- DELETE FROM reviews;

-- Reset participants to remove all mentees from all projects:
-- DELETE FROM project_participants WHERE role = 'Mentee';


-- ============================================
-- RESET PROJECT STATUSES (without deleting)
-- ============================================
-- If you just want to reset all projects to 'Open' status:

-- UPDATE projects
-- SET status = 'Open', updated_at = NOW();
