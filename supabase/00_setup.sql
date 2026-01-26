-- ARIES Project Portal - Complete Database Setup
-- Execute this file to set up the entire database
-- This file runs all other SQL files in order

-- Note: Run these files in order:
-- 1. 01_enums.sql
-- 2. 02_tables.sql
-- 3. 03_indexes.sql
-- 4. 04_functions.sql
-- 5. 05_rls_policies.sql

-- Or execute this master file which includes all setup

\i 01_enums.sql
\i 02_tables.sql
\i 03_indexes.sql
\i 04_functions.sql
\i 05_rls_policies.sql
