# Mini-ATS - Recruitment Dashboard

Mini-ATS is a multi-tenant internal recruitment system (ATS) where companies manage candidates through a hiring pipeline:

**Applied -> Screening -> Interview -> Offer -> Hired/Rejected**

---

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Supabase (Auth + Postgres + Storage)
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zod
- dnd-kit (drag and drop)
- Recharts (metrics)

---

## Core Features

- Pipeline Kanban board with drag-and-drop, persisted to the database.
- Candidate profile page with:
  - general information,
  - activity history,
  - notes,
  - CV file uploads.
- Metrics dashboard with real data:
  - candidates by stage,
  - new candidates this week,
  - simple conversion rate.
- Advanced filters:
  - by name,
  - by stage,
  - by salary range,
  - by date.
- Authentication:
  - email/password,
  - Google OAuth.
- Multi-tenant isolation enforced with RLS.
- Optional onboarding demo data (10 candidates) per organization.

---

## Architecture

The app follows a vertical-slice architecture with clear boundaries:

- `domain`: entities, constants, Zod schemas
- `repository`: direct Supabase data access
- `services`: use cases + validation
- `hooks`: TanStack Query integration

Main structure:

- `app/` -> public and private routes
- `features/candidates/*`
- `features/organizations/*`
- `features/dashboard/*`
- `features/auth/*`
- `lib/supabase/*` -> SSR/browser/proxy clients and types
- `components/ui/*` -> shadcn/ui components

---

## Route Flow

- `/`:
  - redirects to `/dashboard` if authenticated,
  - redirects to `/auth` if not authenticated.
- `/auth`: sign in / sign up (email and Google).
- `/dashboard`: metrics and charts.
- `/candidates`: Kanban, filters, and candidate creation.
- `/candidates/[candidateId]`: profile, notes, files, activity log, edit/delete.

---

## Requirements

- Node.js 20+
- pnpm 10+
- A Supabase project

---

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Fill the required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Start the app:

```bash
pnpm dev
```

---

## Supabase Configuration

### 1) Migrations (run in this order)

Execute in Supabase SQL Editor:

1. `supabase/migrations/0001_init_mini_ats.sql`
2. `supabase/migrations/0002_organization_bootstrap_policies.sql`
3. `supabase/migrations/0003_fix_bootstrap_member_policy.sql`
4. `supabase/migrations/0004_bootstrap_organization_rpc.sql`
5. `supabase/migrations/0005_organization_settings_onboarding.sql`

### 2) Seeds (optional)

- `supabase/seeds/0001_demo_seed.sql`
- `supabase/seeds/0002_demo_multi_org.sql`
- `supabase/seeds/0003_demo_for_specific_user.sql`

---

## Google OAuth (optional, recommended)

In Supabase Dashboard:

1. `Auth -> Providers -> Google`
   - Enable Google provider
   - Add your Google Client ID and Client Secret
2. `Auth -> URL Configuration -> Redirect URLs`
   - `http://localhost:3000/auth/callback`
   - `https://YOUR-DOMAIN.com/auth/callback` (production)

OAuth callback route already exists at:

- `app/auth/callback/route.ts`

---

## Multi-Tenant Security (RLS)

RLS is enabled for tenant tables and storage.
Data isolation is scoped through `organization_members`.

Key tables:

- `organizations`
- `organization_members`
- `organization_settings`
- `candidates`
- `notes`
- `activity_logs`
- `files`

Storage:

- private bucket `candidate-files`

Important notes:

- Stage changes automatically create activity log entries via SQL trigger.
- File paths should include `organization_id/...` to satisfy storage access policies.

---

## Available Scripts

```bash
pnpm dev      # run local development
pnpm lint     # run ESLint
pnpm build    # production build
pnpm start    # run production build
```

---

## Onboarding Experience

- For first-time users with an empty organization:
  - create organization using `Create My Organization`,
  - optionally load 10 demo candidates.
- Onboarding choice is persisted in DB via `organization_settings.onboarding_demo_seen`.

---

## Quick QA Checklist

- Login/logout (email + Google)
- Create organization
- Create candidate
- Drag and drop between stages
- Edit/delete candidate
- Add notes
- Upload and open CV files
- Verify dashboard updates
- Test with two users to confirm RLS isolation

---

## Project Status

This project is interview/demo ready:

- scalable architecture,
- functional hiring pipeline,
- multi-tenant security,
- real metrics and file workflows,
- responsive UX (mobile/tablet/desktop).

---

## License

Educational / portfolio use.
# Ats-Dashboard
