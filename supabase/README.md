# Supabase — marketing lead capture only

Supabase's **only** responsibility in AddisDispatch is capturing leads from the
public marketing site. The carrier and admin portals run entirely on the
**FastAPI backend** and its own Postgres database (see the backend repo's
`docs/architecture.md` and `docs/database-schema.md`).

## What lives here

| Table | Written by | Read by |
|-------|-----------|---------|
| `carrier_applications` | `CarrierApplicationForm.tsx`, `/apply` | backend (service key) → admin applications queue |
| `dispatch_requests` | `ContactForm.tsx` | — (dashboard/manual) |
| `consultations` | `overlays/BookingModal.tsx` | — (dashboard/manual) |

The browser inserts with the **publishable (anon) key** under write-only RLS
(insert allowed, no read-back). The backend reads `carrier_applications` with
the **service key**, which bypasses RLS.

- [`migrations/20260717_marketing_leads.sql`](migrations/20260717_marketing_leads.sql)
  — reproducible DDL for those three tables. Columns verified against the live
  project via the PostgREST OpenAPI schema (2026-07-17). **RLS reflects the
  documented intent; verify against the live project before applying to a fresh
  environment.**

## Decision (2026-07-17): the Supabase-native carrier portal was retired

An earlier, parallel carrier portal was implemented **entirely in Supabase**
(its own `carriers` / `profiles` / `equipment` / `loads` / `documents` /
`settlements` / `agreements` / `compliance_items` / `carrier_preferences` /
`audit_log` / `notifications` tables, RLS, a `handle_new_user` signup trigger, a
private `carrier-documents` storage bucket, DB-driven Resend email via `pg_net`,
and a `pg_cron` daily expiry job). It was defined by three migrations that used
to live in `migrations/`.

It was **superseded** by the FastAPI portal and left unused:

- No current frontend code references any of its tables (the portals never
  import the Supabase client — grep confirms only the three marketing tables are
  used).
- There was **no Supabase CLI config** checked in (`config.toml` absent), so it
  was never part of an active migration workflow here.
- A read-only audit of the live project (2026-07-17) found the tables held only
  **seed/test data** — carriers like "Summit LLC" / "Lone Star Hauling Co",
  a tidy `LD-4821…4825` demo load loop, agreements signed from `::1` and
  `203.0.113.42` (localhost / RFC-5737 example IP), last activity 2026-07-01.

**Single source of truth going forward:** backend Postgres (Alembic) for all
portal data; Supabase for marketing leads only.

### To complete the retirement in the live project

The three migration files have been removed from this repo. To also remove the
abandoned tables from the live Supabase project, a human must run
[`legacy_portal_teardown.sql`](legacy_portal_teardown.sql) in the Supabase SQL
editor (it needs DDL privileges the app's service key does not have). A JSON
backup of every table it drops was taken on 2026-07-17 before this change.

> The removed migrations remain recoverable in this repo's Git history if the
> Supabase-native design is ever revisited.
