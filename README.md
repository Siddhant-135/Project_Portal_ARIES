# ARIES Project Portal

A full-stack project management portal for ARIES built with Next.js 14+, TypeScript, Tailwind CSS, and Supabase.

## Features

- **Role-Based Access Control**: Student, ARIES Member, and Admin roles with different permissions
- **3-Slot Rule**: Students are limited to 3 active project slots
- **Project Management**: Create, launch, complete, and terminate projects
- **Application System**: Students can apply to projects with prerequisites and consent checkboxes
- **Review System**: Mandatory exit reviews for dropped/discharged mentees and completed projects
- **Admin Panel**: User management and master review feed

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project
- Email domain restriction: Only `@iitd.ac.in` emails are allowed

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Execute the SQL scripts in order:
   - `supabase/01_enums.sql` - Create enum types
   - `supabase/02_tables.sql` - Create tables
   - `supabase/03_indexes.sql` - Create indexes
   - `supabase/04_functions.sql` - Create functions and triggers
   - `supabase/05_rls_policies.sql` - Create RLS policies
4. See `supabase/README.md` for detailed setup instructions and migration guides

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

You can find these values in your Supabase project settings under **API**.

### 4. Configure Email Authentication (SMTP)

1. In Supabase dashboard, go to **Authentication** > **Providers** > **Email**
2. Configure SMTP settings for IITD email domain:
   - Enable email provider
   - Set up SMTP server (if using custom SMTP)
   - Configure email templates if needed

**Note**: For production, you may need to configure custom SMTP settings to send emails from `@iitd.ac.in` domain. Contact your IT department for SMTP credentials.
(Currently not configured SMTP creds, can do so in the future since we have our own mail, admin bt)

### 5. Create First Admin User

After setting up the database, you need to manually create the first Admin user:

1. Sign up through the application with an `@iitd.ac.in` email
2. Go to Supabase dashboard > **Table Editor** > `profiles`
3. Find your user record and change the `role` field from `'Student'` to `'Admin'`
4. Alternatively, run this SQL in the SQL Editor:

```sql
UPDATE profiles 
SET role = 'Admin' 
WHERE email = 'your-admin-email@iitd.ac.in';
```

**Important**: Only this first Admin (or other Admins) can promote additional users to Admin. Users cannot self-promote to Admin - this is enforced by database triggers and RLS policies.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── actions/          # Server Actions for data mutations
│   ├── admin/            # Admin panel page
│   ├── auth/             # Authentication pages
│   ├── profile/          # User profile pages
│   ├── project/          # Project pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Feed page
├── components/           # React components
├── lib/
│   ├── supabase/        # Supabase client utilities and types
│   └── utils.ts         # Utility functions
├── middleware.ts        # Next.js middleware for auth
└── supabase/
    └── schema.sql       # Database schema
```

## Key Business Logic

### 3-Slot Rule
- Students can have a maximum of 3 active project slots
- A slot is occupied if a user is an 'Active' participant in an 'Open' or 'Launched' project
- Applications to 'Open' projects count toward this limit

### Role Hierarchy
- **Student**: View feed, view profiles, apply to projects (max 3)
- **ARIES Member**: All student powers + Post Projects, Accept/Kick Students, Launch/Complete/Terminate projects
- **Admin**: All member powers + Promote users, View private Review logs

### Application Requirements
- Two mandatory checkboxes:
  1. "Prerequisites met" (Yes/Partly)
  2. "Consent to share profile with mentor"

### Exit Reviews
- Mandatory 100-word review required from mentors when:
  - A mentee's status changes to 'Dropped' or 'Discharged'
  - A project is 'Completed' (review for each active mentee)

### Project Termination
- If a mentor deletes a project with accepted students, status is set to 'Terminated'
- Terminated projects are filtered out from Mentee profiles
- Terminated projects remain visible on Mentor profiles with a warning badge

## Word Count Limits

- **Project Details**: 200 words max (description, prerequisites, learning objectives)
- **Reviews**: 100 words max

## Database Schema

The database includes:
- `profiles`: User profiles with role-based access
- `projects`: Project information and status
- `project_participants`: Many-to-many relationship between users and projects
- `reviews`: Exit reviews (Admin-only access)

See `supabase/schema.sql` for complete schema definition.

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy to Vercel, Netlify, or your preferred hosting platform
3. Set environment variables in your hosting platform
4. Ensure Supabase RLS policies are properly configured
5. Configure production SMTP settings for email authentication

## Troubleshooting

### Email Authentication Issues
- Verify SMTP settings in Supabase dashboard
- Check that email domain matches `@iitd.ac.in`
- Ensure email templates are configured

### RLS Policy Issues
- Verify that RLS is enabled on all tables
- Check that policies match your use case
- Test with different user roles

### Slot Count Issues
- Verify the `getActiveSlots` function logic
- Check that project statuses are correctly set
- Ensure participant statuses are accurate

## License

This project is for internal use by ARIES.
