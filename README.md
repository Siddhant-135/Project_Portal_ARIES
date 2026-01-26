# ARIES Project Portal

A full-stack project management portal for ARIES (IIT Delhi) built with Next.js, Tailwind CSS, and Supabase.

## Features

- **Microsoft OAuth** - Sign in with IIT Delhi accounts
- **Project Management** - Create, launch, complete, and terminate projects
- **Application System** - Students apply, mentors accept/reject
- **Role-Based Access** - Student, ARIES_Member, Admin hierarchy
- **Project Feed** - Browse Open, Ongoing, and Completed projects
- **User Profiles** - View project history for any user

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Backend**: Supabase (Auth, PostgreSQL, RLS)
- **Authentication**: Microsoft OAuth (Azure)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Database Setup

Go to Supabase → SQL Editor and run these files in order:

1. `supabase/01_enums.sql`
2. `supabase/02_tables.sql`
3. `supabase/03_indexes.sql`
4. `supabase/04_functions.sql`
5. `supabase/05_rls_policies.sql`

### 4. Configure Microsoft OAuth

In Supabase → Authentication → Providers → Azure:

1. Enable Azure provider
2. Add your Azure AD credentials
3. Set redirect URL to `https://your-project.supabase.co/auth/v1/callback`

### 5. Run Development Server

```bash
npm run dev
```

## Project Structure

```
app/
├── auth/           # Login & OAuth callback
├── profile/[id]/   # User profiles
├── project/
│   ├── [id]/       # Project details
│   └── new/        # Create project
├── actions/        # Server actions
└── page.tsx        # Project feed

components/         # React components
lib/supabase/       # Supabase clients & types
supabase/           # SQL schema files
```

## User Roles

| Role | Capabilities |
|------|-------------|
| Student | Apply to projects |
| ARIES_Member | Create projects + Student capabilities |
| Admin | Full access (managed via Supabase) |

## Application Flow

1. **Student applies** → Status = Pending
2. **Mentor accepts** → Status = Active (joins project)
3. **Mentor rejects** → Application deleted
4. **Project launches** → Pending applicants auto-deleted
5. **Reopen Applications** → Accept more students mid-project

## Customizing Colors

Edit CSS variables in `app/globals.css`:

```css
:root {
  --bg-primary: #0a0a0f;
  --purple-primary: #9333ea;
  --pink-primary: #ec4899;
  /* ... */
}
```
