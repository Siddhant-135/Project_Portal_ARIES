-- ARIES Project Portal - Enums
-- Create custom types for the application

DO $$ 
BEGIN
  -- Create user_role enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('Student', 'ARIES_Member', 'Admin');
  END IF;

  -- Create project_status enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
    CREATE TYPE project_status AS ENUM ('Open', 'Launched', 'Completed', 'Terminated');
  END IF;

  -- Create participant_role enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participant_role') THEN
    CREATE TYPE participant_role AS ENUM ('Mentor', 'Mentee');
  END IF;

  -- Create participant_status enum (Pending = waiting for mentor acceptance)
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'participant_status') THEN
    CREATE TYPE participant_status AS ENUM ('Pending', 'Active', 'Dropped', 'Discharged');
  END IF;
END $$;
