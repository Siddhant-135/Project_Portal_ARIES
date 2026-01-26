-- Migration: Add prerequisites_met and prerequisites_notes columns to project_participants table
-- This migration adds the new prerequisites fields if they don't already exist

-- Add prerequisites_met column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'project_participants' AND column_name = 'prerequisites_met'
  ) THEN
    ALTER TABLE project_participants ADD COLUMN prerequisites_met BOOLEAN;
  END IF;
END $$;

-- Add prerequisites_notes column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'project_participants' AND column_name = 'prerequisites_notes'
  ) THEN
    ALTER TABLE project_participants ADD COLUMN prerequisites_notes TEXT;
  END IF;
END $$;
