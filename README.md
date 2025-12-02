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

The dev server runs the Express API (webhooks + provisioning) and proxies Vite for the client. The client mounts in `client/src`
and consumes Supabase directly via `supabaseClient`.

If you want to run only the client, use `pnpm --filter client dev`, but the default `pnpm dev` is the recommended full-stack flow.

## Environment variables

Create a `.env` file (or use Vite env for the client) with:

- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` – Supabase project keys for the client
- `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE` – backend provisioning + webhook access
- `PADDLE_API_KEY`, `PADDLE_CHECKOUT_LINK`, `PADDLE_PORTAL_LINK` – hosted Paddle endpoints
- `VITE_PADDLE_BILLING_LINK` – client-visible hosted checkout/portal link

## Database schema (Supabase)

`drizzle/migrations/0001_hybrid_saas.sql` defines agencies, clinics, profiles, calls, and subscriptions. Apply the SQL in Supabase and enable the documented RLS policies:

- agencies: `agency_admin` restricted to their `agency_id`
- clinics: agency admins only see their own clinics; clinic roles limited to `clinic_id`
- calls: filter through clinic ownership
- subscriptions: scoped by `owner_type`/`owner_id`, managed clinics denied

RLS policies (copy/paste into the Supabase SQL editor and adapt):

- agencies: enable RLS; allow select/update where `id = (select agency_id from profiles where id = auth.uid())` and `role = 'agency_admin'`.
- clinics: enable RLS; allow agencies when `clinics.agency_id = profiles.agency_id`; allow clinics when `clinics.id = profiles.clinic_id`.
- calls: enable RLS; clinics limited to their `clinic_id`; agencies join clinics on `agency_id`.
- subscriptions: enable RLS; require `owner_type/owner_id` match the caller's agency/clinic; block managed clinics entirely.

## Billing & webhooks

Paddle actions are hosted-link driven. Implement webhook handlers to update the `subscriptions` table on create/update/cancel events and gate UI buttons based on subscription status.

- Webhook endpoint: `POST /api/webhooks/paddle` (signature validation TODO in code)
- Cancel endpoint: `POST /api/subscriptions/cancel` (requires Supabase bearer token; respects role scoping)

## Managed clinic provisioning

Agency “Add Clinic” should call the `/api/provision/managed-clinic` endpoint (service role required) which:

1. Creates a Supabase auth user with a generated password.
2. Inserts a `profiles` row with `role = managed_clinic` and the new `clinic_id`.
3. Returns credentials once for the agency to share.

The endpoint enforces that the caller is an `agency_admin` with a matching `agency_id`.

## Role-based routing

The UI uses role guards to prevent managed clinics from billing and to keep agencies in the agency area. See `client/src/lib/access.ts` and tests in `client/src/__tests__/access.test.ts`.
