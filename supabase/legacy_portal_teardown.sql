-- ============================================================
-- TEARDOWN: retire the superseded Supabase-native carrier portal
--
-- WHY: the live carrier/admin portals run on the FastAPI backend + its own
-- Postgres. The Supabase-native portal defined by the (now removed) migrations
-- 20260627_carrier_portal.sql / 20260629_carrier_portal_v2.sql /
-- 20260629_load_actions.sql was an earlier, parallel implementation. It is not
-- referenced by any current frontend code. Its tables held only seed/test data
-- (last activity 2026-07-01; carriers "Summit LLC" etc., signer IPs ::1 /
-- 203.0.113.42). Decision (2026-07-17): retire it so Supabase is responsible
-- only for marketing lead capture.
--
-- BEFORE RUNNING:
--   1. A JSON export of every table below was taken on 2026-07-17 (ask Claude /
--      see the session for `supabase_portal_backup.json`). Confirm you have it.
--   2. Run this in the Supabase SQL editor (or psql) against the project — it
--      needs DDL privileges the PostgREST service key does NOT have, which is
--      why it must be run by a human, not the app.
--   3. This does NOT touch the marketing tables (carrier_applications,
--      dispatch_requests, consultations) — those stay.
--
-- Safe to run once. Wrapped in a transaction; IF EXISTS throughout.
-- ============================================================

begin;

-- 1. Stop the daily cron job (pg_cron).
select cron.unschedule('daily-expiry')
  where exists (select 1 from cron.job where jobname = 'daily-expiry');

-- 2. Drop triggers (the auth.users one first — it references public.carriers/profiles).
drop trigger if exists on_auth_user_created   on auth.users;
drop trigger if exists trg_lock_carrier_status on public.carriers;
drop trigger if exists trg_loads_after_insert  on public.loads;
drop trigger if exists trg_lock_load_fields    on public.loads;
drop trigger if exists trg_loads_status_changed on public.loads;
drop trigger if exists trg_settlements_paid    on public.settlements;
drop trigger if exists trg_agreements_signed   on public.agreements;
drop trigger if exists trg_notifications_email on public.notifications;
drop trigger if exists trg_pod_uploaded        on public.documents;

-- 3. Drop portal tables (CASCADE clears their RLS policies, indexes, and FKs).
drop table if exists public.carrier_preferences cascade;
drop table if exists public.compliance_items    cascade;
drop table if exists public.notifications        cascade;
drop table if exists public.agreements           cascade;
drop table if exists public.audit_log            cascade;
drop table if exists public.settlements          cascade;
drop table if exists public.documents            cascade;
drop table if exists public.loads                cascade;
drop table if exists public.equipment            cascade;
drop table if exists public.profiles             cascade;
drop table if exists public.carriers             cascade;

-- 4. Drop the portal functions.
drop function if exists public.handle_new_user()                       cascade;
drop function if exists public.current_carrier_id()                    cascade;
drop function if exists public.current_carrier_status()                cascade;
drop function if exists public.lock_carrier_status()                   cascade;
drop function if exists public.lock_load_fields()                      cascade;
drop function if exists public.maybe_activate_carrier()                cascade;
drop function if exists public.tg_loads_after_insert()                 cascade;
drop function if exists public.tg_loads_status_changed()               cascade;
drop function if exists public.tg_pod_uploaded()                       cascade;
drop function if exists public.tg_settlements_paid()                   cascade;
drop function if exists public.tg_agreements_signed()                  cascade;
drop function if exists public.tg_notifications_email()                cascade;
drop function if exists public.run_daily_expiry()                      cascade;
drop function if exists public.send_transactional_email(text,text,text) cascade;

-- 5. Storage: remove the private carrier-documents bucket + its policies.
drop policy if exists "carrier docs select" on storage.objects;
drop policy if exists "carrier docs insert" on storage.objects;
drop policy if exists "carrier docs update" on storage.objects;
drop policy if exists "carrier docs delete" on storage.objects;
delete from storage.objects where bucket_id = 'carrier-documents';
delete from storage.buckets where id = 'carrier-documents';

-- NOTE: extensions pg_net and pg_cron are intentionally left installed — they
-- are project-wide and may be used by other features. Remove them manually only
-- if you are certain nothing else depends on them.

commit;

-- Optional: if the Resend key was stored in Supabase Vault only for the portal
-- email trigger, you can remove it (run separately, outside this transaction):
--   select vault.delete_secret((select id from vault.secrets where name = 'resend_api_key'));
