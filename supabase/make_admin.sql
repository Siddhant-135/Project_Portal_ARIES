-- ARIES Project Portal - Make User Admin
-- This script promotes an ARIES_Member to Admin role
-- 
-- Usage: Replace 'username_here' or 'email_here' with the actual value
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

-- ============================================
-- OPTION 1: Promote by USERNAME (preferred)
-- ============================================
-- Uncomment and modify the line below:

-- UPDATE profiles
-- SET role = 'Admin', updated_at = NOW()
-- WHERE username = 'username_here'
--   AND role = 'ARIES_Member'
-- RETURNING id, username, email, full_name, role;

-- ============================================
-- OPTION 2: Promote by EMAIL
-- ============================================
-- Uncomment and modify the line below:

-- UPDATE profiles
-- SET role = 'Admin', updated_at = NOW()
-- WHERE email = 'email_here@example.com'
--   AND role = 'ARIES_Member'
-- RETURNING id, username, email, full_name, role;

-- ============================================
-- OPTION 3: Promote by USER ID
-- ============================================
-- Uncomment and modify the line below:

-- UPDATE profiles
-- SET role = 'Admin', updated_at = NOW()
-- WHERE id = 'uuid-here'
--   AND role = 'ARIES_Member'
-- RETURNING id, username, email, full_name, role;


-- ============================================
-- HELPER: View all ARIES Members (to find who to promote)
-- ============================================
-- Uncomment to see all current ARIES Members:

-- SELECT id, username, email, full_name, role, created_at
-- FROM profiles
-- WHERE role = 'ARIES_Member'
-- ORDER BY created_at;


-- ============================================
-- HELPER: View all Admins
-- ============================================
-- Uncomment to see all current Admins:

-- SELECT id, username, email, full_name, role, created_at
-- FROM profiles
-- WHERE role = 'Admin'
-- ORDER BY created_at;


-- ============================================
-- REVERSE: Demote Admin back to ARIES_Member
-- ============================================
-- Uncomment and modify if needed:

-- UPDATE profiles
-- SET role = 'ARIES_Member', updated_at = NOW()
-- WHERE username = 'username_here'
--   AND role = 'Admin'
-- RETURNING id, username, email, full_name, role;
