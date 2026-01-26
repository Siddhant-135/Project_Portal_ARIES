# SYSTEM DIRECTIVE: BUILD ARIES PROJECT PORTAL

Build a full-stack project portal for ARIES using **Next.js (App Router)**, **Tailwind CSS**, and **Supabase**. The application must be optimized for desktop/laptop use and implement the following logic strictly.

## 1. Technical Requirements

* **Framework:** Next.js 14+ with TypeScript.
* **Backend:** Supabase (Auth, PostgreSQL, RLS).
* **Styling:** Tailwind CSS.
* **Constraints:** Desktop-first design. All data mutations via Server Actions. Strict word count enforcement (200 words for project details, 100 words for reviews).

## 2. Database Schema (PostgreSQL)

Execute this setup first:

* **`profiles` table:** `id` (uuid, auth.users), `email` (must match `*@iitd.ac.in`), `full_name`, `branch`, `role` (enum: 'Student', 'ARIES_Member', 'Admin').
* **`projects` table:** `id`, `title`, `description` (200w), `prerequisites` (200w), `learning_objectives` (200w), `max_students` (int), `status` (enum: 'Open', 'Launched', 'Completed', 'Terminated'), `codebase_link`, `doc_link`, `ending_remarks`.
* **`project_participants` table:** `project_id`, `user_id`, `role` (enum: 'Mentor', 'Mentee'), `status` (enum: 'Active', 'Dropped', 'Discharged').
* **`reviews` table:** `id`, `project_id`, `student_id`, `mentor_id`, `review_text` (100w), `created_at`. **Policy:** Access restricted to 'Admin' role only.

## 3. Core Business Logic

* **The 3-Slot Rule:** A student is capped at 3 active slots. A slot is occupied if a user is an 'Active' participant in an 'Open' or 'Launched' project. Applications to 'Open' projects count toward this limit.
* **Role Hierarchy:**
* **Student:** View feed, view profiles, apply to projects (max 3).
* **ARIES Member:** All student powers + Post Projects, Accept/Kick Students, Launch/Complete/Terminate projects.
* **Admin:** All member powers + Promote users, View private Review logs.


* **Application Logic:** Two mandatory checkboxes for applicants: 1. "Prerequisites met" (Options: Yes/Partly), 2. "Consent to share profile with mentor."
* **Termination & Accountability:** - If a mentor deletes a project with accepted students, set status to **'Terminated'**.
* **Visibility:** Filter out 'Terminated' projects from Mentee profiles. Keep them visible on Mentor profiles with a "Terminated" warning badge.


* **The Exit Review:** Mandatory 100-word review required from mentors when a mentee's status changes to 'Dropped', 'Discharged', or when a project is 'Completed'.

## 4. Application Map

* `/` (Feed): List all 'Open' and 'Completed' projects.
* `/profile/[id]`: Genuinely public. Displays user details, roles, and project history (labels: Mentor/Mentee, status: Completed/Dropped/Discharged).
* `/project/[id]`:
* **Student View:** Project details + Apply button (if slots < 3).
* **Mentor View:** Applicant management (Accept/Reject), Launch button, and Project Closure (Complete/Terminate/Drop student) with review modal.


* `/admin`: User search by email, role toggle (Student/Member), and a Master Review Feed.

## 5. Implementation Steps for AI

1. **SQL Initialization:** Generate the SQL script including tables, enums, and Row Level Security (RLS) policies.
2. **Auth Setup:** Configure Next.js middleware to handle role-based redirection and protect `/admin`.
3. **Core Components:** Build the "Project Card," "Application Modal," and "Review Submission" components with word counters.
4. **State Management:** Use Supabase real-time or revalidatePath to ensure slot counts update immediately upon application.
5. **Setup Guide:** Generate a `README.md` detailing Supabase environment variable setup, SMTP configuration for IITD emails, and the manual SQL step for the first Admin user.