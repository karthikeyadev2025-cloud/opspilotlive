# OpsPilot

Field operations management SaaS — CRM, GPS attendance, telecaller tools, HR/payroll, and role-based portals for field sales and operations teams. Multi-tenant: each signed-up business is an isolated tenant with its own staff, leads, and attendance data.

**Live:** [opspilot.in](https://opspilot.in)

## Stack

- React + Vite + TypeScript, Tailwind CSS
- Supabase (Postgres, Auth, Storage, RLS, Edge Functions)
- Razorpay (billing)
- Vercel (hosting)

## Structure

```
src/
  components/
    saas/        # Public landing, signup/login, tenant dashboard, super admin panel
    admin/       # Internal admin tools (HR, marketing leads, users, roles, security logs)
    *.tsx        # Role-based portals: Telecaller, Manager, HR, Employee, Executive
  contexts/      # Auth context (app_users session + role)
  lib/           # Supabase client, generated database types, security logger
supabase/
  migrations/    # SQL migrations, applied in filename order via Supabase SQL Editor or CLI
  functions/     # Edge functions (admin creation, Razorpay order/payment verification)
```

## Multi-tenancy

Every operational table (`app_users`, `marketing_leads`, `attendance_records`, `leave_requests`,
`salary_advance_requests`, `payroll_records`, etc.) carries a `tenant_id`, enforced by
Postgres RLS policies and a `get_my_tenant_id()` helper. Signing up via the public site
creates a `tenants` row, which triggers creation of that tenant's first `app_users` admin
account — closing the loop from signup to a usable team.

## Local development

```bash
npm install
npm run dev          # vite dev server
npm run typecheck    # tsc --noEmit
npm run build         # production build
npm run lint
```

Requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` (see `.env.example`).

## Database migrations

Migrations live in `supabase/migrations/`, named with a timestamp prefix, applied in order.
Apply via the Supabase Dashboard SQL Editor, or the Supabase CLI:

```bash
supabase link --project-ref <project-ref>
supabase db push
```
