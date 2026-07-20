-- ============================================================
-- AddisDispatch — Supabase marketing lead-capture tables
--
-- This is the ONLY schema the live Supabase project is responsible for. The
-- carrier/admin portals run entirely on the FastAPI backend + its own Postgres
-- (see the backend repo's docs/database-schema.md). Supabase here is used only
-- by the public marketing site to capture leads from the browser.
--
-- Tables:
--   carrier_applications  <- CarrierApplicationForm.tsx / /apply
--   dispatch_requests     <- ContactForm.tsx
--   consultations         <- BookingModal.tsx  (BookingModal + booking flow)
--
-- The backend additionally READS carrier_applications (only) via PostgREST with
-- the service key; the service role bypasses RLS.
--
-- Column set below was reconstructed from the live project (verified via the
-- PostgREST OpenAPI schema on 2026-07-17). RLS reflects the documented intent
-- — anonymous browser clients may INSERT leads but not read them back.
--
-- Live read-path VERIFIED 2026-07-17: with the publishable/anon key, SELECT on
-- all three tables returns zero rows even though dispatch_requests and
-- consultations hold real records (confirmed against the service role) — RLS is
-- enabled and denies anon reads.
--
-- RECONCILED 2026-07-20: the live project previously still held the full default
-- table-level GRANTs for `anon` AND `authenticated` (DELETE, INSERT, REFERENCES,
-- SELECT, TRIGGER, TRUNCATE, UPDATE). The REVOKE/GRANT block below has now been
-- applied to the live project; both roles hold INSERT only. Verified after the
-- change: anon INSERT succeeds, and has_table_privilege(anon, …) is false for
-- SELECT/DELETE/TRUNCATE on all three tables. Row counts were unaffected.
--
-- Why TRUNCATE mattered most: Postgres does NOT apply row-level security to
-- TRUNCATE — it is a pure table-level privilege. So of the over-broad grants it
-- was the only one RLS was not silently containing. (It was never reachable in
-- practice: PostgREST exposes no verb that maps to TRUNCATE, and `anon` has no
-- direct-login credential.)
--
-- Note on the earlier "PATCH/DELETE returned 204, not 401" observation: that is
-- expected under RLS, not a hole. With no matching policy those statements match
-- ZERO rows, and PostgREST returns 204 for "nothing to do". Nothing was mutable.
--
-- Idempotent: safe to re-run. Intended as the reproducible baseline for a fresh
-- Supabase project; it does not alter the existing live tables (IF NOT EXISTS).
-- ============================================================

-- ---------- Tables ----------
create table if not exists public.carrier_applications (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  company_name    text,
  contact_name    text,
  email           text,
  phone           text,
  mc_number       text,
  dot_number      text,
  equipment_type  text,
  truck_count     smallint,
  preferred_lanes text,
  notes           text,
  status          text not null default 'new'
                    check (status in ('new','contacted','onboarded','declined'))
);

create table if not exists public.dispatch_requests (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  name         text,
  company      text,
  mc_number    text,
  email        text,
  lane_details text
);

create table if not exists public.consultations (
  id             uuid primary key default gen_random_uuid(),
  created_at     timestamptz not null default now(),
  name           text,
  phone          text,
  scheduled_date date,
  scheduled_time text
);

create index if not exists idx_carrier_applications_status
  on public.carrier_applications(status, created_at desc);

-- ---------- RLS: anonymous browser may INSERT leads, never read ----------
alter table public.carrier_applications enable row level security;
alter table public.dispatch_requests    enable row level security;
alter table public.consultations         enable row level security;

-- The publishable/anon key is the `anon` role. Start from zero privileges so no
-- default GRANT (SELECT/UPDATE/DELETE) can slip through, then grant INSERT only.
revoke all on public.carrier_applications from anon;
revoke all on public.dispatch_requests    from anon;
revoke all on public.consultations         from anon;

grant insert on public.carrier_applications to anon;
grant insert on public.dispatch_requests    to anon;
grant insert on public.consultations         to anon;

drop policy if exists carrier_applications_insert on public.carrier_applications;
create policy carrier_applications_insert on public.carrier_applications
  for insert to anon with check (true);

drop policy if exists dispatch_requests_insert on public.dispatch_requests;
create policy dispatch_requests_insert on public.dispatch_requests
  for insert to anon with check (true);

drop policy if exists consultations_insert on public.consultations;
create policy consultations_insert on public.consultations
  for insert to anon with check (true);

-- No SELECT/UPDATE/DELETE policies for anon => the browser cannot read leads.
-- The backend reads carrier_applications via the service role, which bypasses RLS.
