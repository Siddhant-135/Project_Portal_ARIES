# Supabase Database Setup

This directory contains the SQL scripts for setting up the ARIES Project Portal database.

## File Structure

The SQL is organized into separate files for better maintainability:

1. **01_enums.sql** - Custom enum types (user_role, project_status, etc.)
2. **02_tables.sql** - Table definitions (profiles, projects, project_participants, reviews)
3. **03_indexes.sql** - Performance indexes
4. **04_functions.sql** - Database functions and triggers
5. **05_rls_policies.sql** - Row Level Security policies

## Setup Instructions

### Option 1: Run Individual Files (Recommended)

Execute each file in order in your Supabase SQL Editor:

1. Run `01_enums.sql`
2. Run `02_tables.sql`
3. Run `03_indexes.sql`
4. Run `04_functions.sql`
5. Run `05_rls_policies.sql`

### Option 2: Run All at Once

Copy and paste all files in order into the Supabase SQL Editor, or use the `00_setup.sql` file if your SQL client supports `\i` commands.

## Key Features

### Idempotent Design
- All CREATE statements use `IF NOT EXISTS` or exception handling
- Policies are dropped before creation to allow re-running
- Safe to execute multiple times

### Security Features
- **No self-admin promotion**: Users cannot promote themselves to Admin
- **Only Admins can promote**: Only existing Admins can promote others to Admin
- **Mentor verification**: Reviews can only be created by verified mentors for the project
- **Role-based access**: All policies enforce role-based permissions

### Schema Changes

#### Prerequisites Field
The `prerequisites_met` field has been changed from a single TEXT field to:
- `prerequisites_met` (BOOLEAN) - Whether prerequisites are met
- `prerequisites_notes` (TEXT) - Additional notes about prerequisites

#### Username Field
The `profiles` table now includes a `username` field (extracted from email, part before `@`). **Username is UNIQUE** and serves as the unique identifier of a person. This allows the system to treat users with different email domains (e.g., `cs5240469@iitd.ac.in` and `cs5240469@cse.iitd.ac.in`) as the same person, using the same profile.

**How it works**:
- When a user logs in, the system extracts the username (part before `@`)
- If a profile with that username already exists, the existing profile is used and its email is updated
- If no profile exists with that username, a new profile is created
- The application finds profiles by username, not by auth.users.id

**Migration**: If you have an existing database, run `migration_add_username.sql` to add the username column to existing profiles.

#### Email Constraint
The email domain constraint has been removed - OAuth handles email validation. The system no longer restricts login to specific email domains, as Microsoft OAuth handles organization verification.

#### Reviews Table
Added foreign key constraint to ensure mentor is actually a mentor for the project:
```sql
CONSTRAINT reviews_mentor_project_fkey FOREIGN KEY (project_id, mentor_id) 
  REFERENCES project_participants(project_id, user_id)
```

## Manual Admin Setup

After initial setup, manually create the first Admin user:

```sql
UPDATE profiles 
SET role = 'Admin' 
WHERE email = 'your-admin-email@iitd.ac.in';
```

Only this first Admin (or other Admins) can then promote additional users to Admin.

## Creating Profiles for Existing Users

If you have users in `auth.users` but no corresponding profiles, run:

```sql
-- If you have existing users without profiles, you can create a function to handle this
-- See the ensure_user_profile function in 04_functions.sql
```

This will create profiles for all users who don't have one yet.

## Updating Existing Database

If you have an existing database, you may need to:

1. **Update prerequisites_met field**:
   ```sql
   -- Add new columns
   ALTER TABLE project_participants 
   ADD COLUMN IF NOT EXISTS prerequisites_met BOOLEAN,
   ADD COLUMN IF NOT EXISTS prerequisites_notes TEXT;
   
   -- Migrate existing data (if any)
   UPDATE project_participants
   SET prerequisites_met = CASE 
     WHEN prerequisites_met = 'Yes' THEN true
     WHEN prerequisites_met = 'Partly' THEN false
     ELSE NULL
   END,
   prerequisites_notes = CASE
     WHEN prerequisites_met = 'Partly' THEN 'Partially met prerequisites'
     ELSE NULL
   END;
   
   -- Remove old column (after verifying migration)
   -- ALTER TABLE project_participants DROP COLUMN prerequisites_met;
   ```

2. **Remove email constraint** (if it exists):
   ```sql
   ALTER TABLE profiles DROP CONSTRAINT IF EXISTS email_iitd;
   ```

3. **Add username field** (if not already present):
   Run `migration_add_username.sql` to add the username column to existing profiles.

4. **Add reviews constraint**:
   ```sql
   ALTER TABLE reviews
   ADD CONSTRAINT reviews_mentor_project_fkey 
   FOREIGN KEY (project_id, mentor_id) 
   REFERENCES project_participants(project_id, user_id) 
   ON DELETE CASCADE;
   ```

## Troubleshooting

### "Type already exists" errors
The enum creation uses exception handling, so this should not occur. If it does, the types already exist and you can skip that step.

### "Policy already exists" errors
The policy creation scripts drop existing policies first, so this should not occur.

### RLS blocking operations
Check that:
1. The user is authenticated (`auth.uid()` is not null)
2. The user has the correct role for the operation
3. Policies are correctly applied (check Supabase dashboard)
