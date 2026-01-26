# ARIES Project Portal - Database Setup

## Fresh Database Setup

Run these SQL files **in order** in your Supabase SQL Editor:

1. `01_enums.sql` - Custom enum types
2. `02_tables.sql` - Database tables
3. `03_indexes.sql` - Performance indexes
4. `04_functions.sql` - Functions and triggers
5. `05_rls_policies.sql` - Row Level Security policies

## Schema Overview

### Tables

- **profiles** - User profiles (linked to Supabase Auth)
- **projects** - Projects created by ARIES Members/Admins
- **project_participants** - Links users to projects (Mentor/Mentee)
- **reviews** - Exit reviews written by mentors

### User Roles

- **Student** - Can apply to projects
- **ARIES_Member** - Can create projects + Student capabilities
- **Admin** - Full access (managed via Supabase dashboard)

### Project Statuses

- **Open** - Accepting applications
- **Launched** - In progress (no new applications)
- **Completed** - Successfully finished
- **Terminated** - Ended early

### Participant Statuses

- **Pending** - Applied, waiting for mentor acceptance
- **Active** - Accepted and actively participating
- **Dropped** - Left the project (negative)
- **Discharged** - Completed their part (positive)

## Application Flow

1. Student applies → Status = `Pending`
2. Mentor accepts → Status = `Active`
3. Mentor rejects → Application deleted
4. Project launches → All `Pending` applicants auto-deleted
5. Mentor can "Reopen Applications" to accept more students

## Environment Variables

Required in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Troubleshooting

### RLS blocking operations

1. Check user is authenticated
2. Check user has correct role
3. Check policies in Supabase dashboard → Authentication → Policies
