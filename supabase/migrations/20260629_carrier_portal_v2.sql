-- ============================================================
-- AddisDispatch Carrier Portal v2 — audit, onboarding, notifications,
-- compliance, availability. RLS on every new table.
--
-- NOTE: the Resend API key is stored in Supabase Vault (vault.create_secret
-- 'resend_api_key'), NOT in this file. Set it once per environment.
-- ============================================================

-- ---- Alterations ----
do $$
declare cn text;
begin
  select conname into cn from pg_constraint
   where conrelid = 'public.carriers'::regclass and contype = 'c'
     and pg_get_constraintdef(oid) ilike '%status%';
  if cn is not null then execute format('alter table public.carriers drop constraint %I', cn); end if;
end $$;
alter table public.carriers
  add constraint carriers_status_check check (status in ('pending','onboarding','active','suspended'));

alter table public.loads add column if not exists picked_up_at timestamptz;
alter table public.loads add column if not exists delivered_at timestamptz;
alter table public.loads add column if not exists ready_to_invoice boolean not null default false;

-- New signups land in 'onboarding'
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare new_carrier uuid;
begin
  insert into public.carriers (company_name, mc_number, status)
  values (coalesce(nullif(new.raw_user_meta_data->>'company_name',''),'New Carrier'),
          nullif(new.raw_user_meta_data->>'mc_number',''), 'onboarding')
  returning id into new_carrier;
  insert into public.profiles (id, carrier_id, full_name, role)
  values (new.id, new_carrier, nullif(new.raw_user_meta_data->>'full_name',''), 'owner');
  return new;
end; $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- ---- New tables ----
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null, entity_type text, entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.agreements (
  id uuid primary key default gen_random_uuid(),
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  type text not null default 'dispatch_service' check (type in ('dispatch_service')),
  version text not null, status text not null default 'pending' check (status in ('pending','signed')),
  signer_name text, signed_at timestamptz, ip_address text,
  pandadoc_doc_id text, file_path text, created_at timestamptz not null default now()
);
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  type text not null, title text not null, body text,
  entity_type text, entity_id uuid, read boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.compliance_items (
  id uuid primary key default gen_random_uuid(),
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  type text not null check (type in ('cdl','medical_card','annual_inspection','ifta','insurance','registration')),
  holder text not null check (holder in ('driver','truck')),
  reference_id text, expires_at date,
  status text not null default 'valid' check (status in ('valid','expiring','expired')),
  document_id uuid references public.documents(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists public.carrier_preferences (
  carrier_id uuid primary key references public.carriers(id) on delete cascade,
  availability_status text not null default 'available' check (availability_status in ('available','booked','off')),
  current_location text, home_base text,
  preferred_lanes jsonb not null default '[]'::jsonb,
  desired_home_time text, updated_at timestamptz not null default now()
);

create index if not exists idx_audit_carrier on public.audit_log(carrier_id, created_at desc);
create index if not exists idx_notifications_carrier on public.notifications(carrier_id, created_at desc);
create index if not exists idx_compliance_carrier on public.compliance_items(carrier_id);

-- ---- Helper / gating functions ----
create or replace function public.current_carrier_status()
returns text language sql stable security invoker set search_path = '' as $$
  select c.status from public.carriers c where c.id = public.current_carrier_id()
$$;

create or replace function public.lock_carrier_status()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.status is distinct from old.status and current_user = 'authenticated' then
    raise exception 'carrier status cannot be changed by the carrier';
  end if;
  return new;
end; $$;
revoke all on function public.lock_carrier_status() from public, anon, authenticated;

create or replace function public.maybe_activate_carrier()
returns boolean language plpgsql security definer set search_path = '' as $$
declare cid uuid := public.current_carrier_id(); cur_status text; has_agreement boolean; doc_count int;
begin
  if cid is null then return false; end if;
  select status into cur_status from public.carriers where id = cid;
  if cur_status <> 'onboarding' then return cur_status = 'active'; end if;
  select exists(select 1 from public.agreements where carrier_id = cid and status = 'signed') into has_agreement;
  select count(distinct type) into doc_count from public.documents where carrier_id = cid and type in ('w9','coi','mc_authority');
  if has_agreement and doc_count = 3 then
    update public.carriers set status = 'active' where id = cid;
    insert into public.audit_log(carrier_id, actor_id, action, entity_type, entity_id)
    values (cid, (select auth.uid()), 'carrier_activated', 'carrier', cid);
    return true;
  end if;
  return false;
end; $$;
revoke all on function public.maybe_activate_carrier() from public, anon;
grant execute on function public.maybe_activate_carrier() to authenticated;

-- ---- RLS ----
alter table public.audit_log enable row level security;
alter table public.agreements enable row level security;
alter table public.notifications enable row level security;
alter table public.compliance_items enable row level security;
alter table public.carrier_preferences enable row level security;

grant select, insert on public.audit_log to authenticated;
grant select, insert, update on public.agreements to authenticated;
grant select, update on public.notifications to authenticated;
grant select, insert, update, delete on public.compliance_items to authenticated;
grant select, insert, update on public.carrier_preferences to authenticated;

create policy audit_select on public.audit_log for select to authenticated using ( carrier_id = public.current_carrier_id() );
create policy audit_insert on public.audit_log for insert to authenticated with check ( carrier_id = public.current_carrier_id() and actor_id = (select auth.uid()) );

create policy agreements_select on public.agreements for select to authenticated using ( carrier_id = public.current_carrier_id() );
create policy agreements_insert on public.agreements for insert to authenticated with check ( carrier_id = public.current_carrier_id() );
create policy agreements_update on public.agreements for update to authenticated using ( carrier_id = public.current_carrier_id() ) with check ( carrier_id = public.current_carrier_id() );

create policy notifications_select on public.notifications for select to authenticated using ( carrier_id = public.current_carrier_id() );
create policy notifications_update on public.notifications for update to authenticated using ( carrier_id = public.current_carrier_id() ) with check ( carrier_id = public.current_carrier_id() );

create policy compliance_select on public.compliance_items for select to authenticated using ( carrier_id = public.current_carrier_id() );
create policy compliance_insert on public.compliance_items for insert to authenticated with check ( carrier_id = public.current_carrier_id() );
create policy compliance_update on public.compliance_items for update to authenticated using ( carrier_id = public.current_carrier_id() ) with check ( carrier_id = public.current_carrier_id() );
create policy compliance_delete on public.compliance_items for delete to authenticated using ( carrier_id = public.current_carrier_id() );

create policy prefs_select on public.carrier_preferences for select to authenticated using ( carrier_id = public.current_carrier_id() );
create policy prefs_insert on public.carrier_preferences for insert to authenticated with check ( carrier_id = public.current_carrier_id() );
create policy prefs_update on public.carrier_preferences for update to authenticated using ( carrier_id = public.current_carrier_id() ) with check ( carrier_id = public.current_carrier_id() );

-- ---- Notification triggers (DB-driven, also write audit) ----
create or replace function public.tg_loads_after_insert()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.notifications(carrier_id, type, title, body, entity_type, entity_id)
  values (new.carrier_id, 'load_booked', 'New load booked',
          coalesce(new.ref_number,'A load') || ': ' || coalesce(new.origin_city,'?') || ' → ' || coalesce(new.dest_city,'?'), 'load', new.id);
  insert into public.audit_log(carrier_id, actor_id, action, entity_type, entity_id, metadata)
  values (new.carrier_id, null, 'load_booked', 'load', new.id, jsonb_build_object('ref_number', new.ref_number, 'status', new.status));
  return new;
end; $$;
revoke all on function public.tg_loads_after_insert() from public, anon, authenticated;
drop trigger if exists trg_loads_after_insert on public.loads;
create trigger trg_loads_after_insert after insert on public.loads for each row execute function public.tg_loads_after_insert();

create or replace function public.tg_settlements_paid()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'paid' and old.status is distinct from 'paid' then
    insert into public.notifications(carrier_id, type, title, body, entity_type, entity_id)
    values (new.carrier_id, 'settlement_paid', 'Settlement paid', 'Net ' || to_char(coalesce(new.net,0),'FM$999,999,990.00') || ' has been paid.', 'settlement', new.id);
    insert into public.audit_log(carrier_id, actor_id, action, entity_type, entity_id, metadata)
    values (new.carrier_id, null, 'settlement_paid', 'settlement', new.id, jsonb_build_object('net', new.net));
  end if;
  return new;
end; $$;
revoke all on function public.tg_settlements_paid() from public, anon, authenticated;
drop trigger if exists trg_settlements_paid on public.settlements;
create trigger trg_settlements_paid after update on public.settlements for each row execute function public.tg_settlements_paid();

create or replace function public.tg_agreements_signed()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'signed' and (tg_op = 'INSERT' or old.status is distinct from 'signed') then
    insert into public.notifications(carrier_id, type, title, body, entity_type, entity_id)
    values (new.carrier_id, 'agreement_signed', 'Agreement signed', 'Your ' || new.type || ' agreement (v' || new.version || ') is on file.', 'agreement', new.id);
    insert into public.audit_log(carrier_id, actor_id, action, entity_type, entity_id, metadata)
    values (new.carrier_id, (select auth.uid()), 'agreement_signed', 'agreement', new.id, jsonb_build_object('version', new.version, 'signer_name', new.signer_name));
  end if;
  return new;
end; $$;
revoke all on function public.tg_agreements_signed() from public, anon, authenticated;
drop trigger if exists trg_agreements_signed on public.agreements;
create trigger trg_agreements_signed after insert or update on public.agreements for each row execute function public.tg_agreements_signed();

-- ---- Email (pg_net + Resend, key from Vault). Swap provider here. ----
create extension if not exists pg_net;
create extension if not exists pg_cron;

create or replace function public.send_transactional_email(p_to text, p_subject text, p_html text)
returns bigint language plpgsql security definer set search_path = '' as $$
declare v_key text; v_request_id bigint;
begin
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'resend_api_key';
  if v_key is null then return null; end if;
  select net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object('Authorization','Bearer '||v_key,'Content-Type','application/json'),
    body := jsonb_build_object('from','AddisDispatch <onboarding@resend.dev>','to',array[p_to],'subject',p_subject,'html',p_html)
  ) into v_request_id;
  return v_request_id;
end; $$;
revoke all on function public.send_transactional_email(text,text,text) from public, anon, authenticated;

create or replace function public.tg_notifications_email()
returns trigger language plpgsql security definer set search_path = '' as $$
declare v_email text;
begin
  select u.email into v_email from public.profiles p join auth.users u on u.id = p.id
   where p.carrier_id = new.carrier_id order by (p.role = 'owner') desc limit 1;
  if v_email is not null then
    perform public.send_transactional_email(v_email, new.title,
      '<div style="font-family:Arial,Helvetica,sans-serif;color:#16161a"><h2 style="margin:0 0 8px">'||new.title||
      '</h2><p style="margin:0 0 16px;color:#444">'||coalesce(new.body,'')||
      '</p><p style="margin:0;color:#999;font-size:12px">AddisDispatch Carrier Portal</p></div>');
  end if;
  -- SMS hook (no-op this pass): perform public.send_sms(v_phone, new.title);
  return new;
exception when others then return new;
end; $$;
revoke all on function public.tg_notifications_email() from public, anon, authenticated;
drop trigger if exists trg_notifications_email on public.notifications;
create trigger trg_notifications_email after insert on public.notifications for each row execute function public.tg_notifications_email();

-- ---- Daily expiry job ----
create or replace function public.run_daily_expiry()
returns void language plpgsql security definer set search_path = '' as $$
declare r record;
begin
  update public.compliance_items set status = case
    when expires_at is null then 'valid'
    when expires_at < current_date then 'expired'
    when expires_at <= current_date + 14 then 'expiring'
    else 'valid' end;
  update public.documents set status = 'expired'
   where expires_at is not null and expires_at < current_date and status <> 'expired';
  for r in
    select carrier_id, 'compliance' as src, type::text as label, expires_at from public.compliance_items where expires_at is not null and expires_at <= current_date + 14
    union all
    select carrier_id, 'document' as src, type::text as label, expires_at from public.documents where expires_at is not null and expires_at <= current_date + 14
  loop
    if not exists (select 1 from public.notifications n where n.carrier_id = r.carrier_id and n.type = 'expiry'
        and n.body = (r.label || ' expires ' || to_char(r.expires_at,'Mon DD')) and n.created_at > now() - interval '20 hours') then
      insert into public.notifications(carrier_id, type, title, body, entity_type)
      values (r.carrier_id, 'expiry',
        case when r.expires_at < current_date then 'Compliance/document expired' else 'Expiring soon' end,
        r.label || ' expires ' || to_char(r.expires_at,'Mon DD'), r.src);
    end if;
  end loop;
end; $$;
revoke all on function public.run_daily_expiry() from public, anon, authenticated;

select cron.unschedule('daily-expiry') where exists (select 1 from cron.job where jobname = 'daily-expiry');
select cron.schedule('daily-expiry', '0 13 * * *', 'select public.run_daily_expiry()');
