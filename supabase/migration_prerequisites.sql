-- Migration Script: Update prerequisites_met field structure
-- Run this if you have an existing database with the old prerequisites_met structure

-- Step 1: Add new columns
ALTER TABLE project_participants 
ADD COLUMN IF NOT EXISTS prerequisites_met_new BOOLEAN,
ADD COLUMN IF NOT EXISTS prerequisites_notes TEXT;

-- Step 2: Migrate existing data
-- Convert 'Yes' to true, 'Partly' to false, NULL stays NULL
UPDATE project_participants
SET prerequisites_met_new = CASE 
  WHEN prerequisites_met = 'Yes' THEN true
  WHEN prerequisites_met = 'Partly' THEN false
  ELSE NULL
END,
prerequisites_notes = CASE
  WHEN prerequisites_met = 'Partly' THEN 'Partially met prerequisites'
  ELSE NULL
END
WHERE prerequisites_met IS NOT NULL;

-- Step 3: Drop old column and rename new one
-- Uncomment these lines after verifying the migration worked:
-- ALTER TABLE project_participants DROP COLUMN IF EXISTS prerequisites_met;
-- ALTER TABLE project_participants RENAME COLUMN prerequisites_met_new TO prerequisites_met;

-- Step 4: Remove email constraint (if it exists)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS email_iitd;
