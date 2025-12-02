# Hybrid AI Receptionist SaaS

A multi-tenant AI voice receptionist built with React, Vite, Tailwind, Shadcn UI, Supabase, Recharts, and Paddle billing. The app supports three roles:

- `agency_admin` – manages multiple clinics and provisions managed clinic seats.
- `managed_clinic` – managed by an agency with no billing access.
- `independent_clinic` – self-serve clinics with their own billing.

## Local development

```bash
pnpm install
pnpm dev # runs the API/dev server
pnpm test # vitest suite
```

The front-end lives in `client/` and consumes Supabase directly via `supabaseClient`. The server folder contains API stubs and webhook entry points.

## Environment variables

Create a `.env` file (or use Vite env for the client) with:

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` – Supabase project keys
- `SUPABASE_SERVICE_ROLE` – used by the backend to provision managed clinic users
- `PADDLE_API_KEY`, `PADDLE_CHECKOUT_LINK`, `PADDLE_PORTAL_LINK` – hosted Paddle endpoints

## Database schema (Supabase)

`drizzle/migrations/0001_hybrid_saas.sql` defines agencies, clinics, profiles, calls, and subscriptions. Apply the SQL in Supabase and enable the documented RLS policies:

- agencies: `agency_admin` restricted to their `agency_id`
- clinics: agency admins only see their own clinics; clinic roles limited to `clinic_id`
- calls: filter through clinic ownership
- subscriptions: scoped by `owner_type`/`owner_id`, managed clinics denied

## Billing & webhooks

Paddle actions are hosted-link driven. Implement webhook handlers to update the `subscriptions` table on create/update/cancel events and gate UI buttons based on subscription status.

## Managed clinic provisioning

Agency “Add Clinic” should call the `/api/provision/managed-clinic` endpoint (service role required) which:

1. Creates a Supabase auth user with a generated password.
2. Inserts a `profiles` row with `role = managed_clinic` and the new `clinic_id`.
3. Returns credentials once for the agency to share.

## Role-based routing

The UI uses role guards to prevent managed clinics from billing and to keep agencies in the agency area. See `client/src/lib/access.ts` and tests in `client/src/__tests__/access.test.ts`.
