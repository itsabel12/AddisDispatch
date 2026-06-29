-- ============================================================
-- AddisDispatch Carrier Portal — schema, RLS, storage, signup trigger
-- Idempotent: safe to re-run. Carrier isolation is enforced entirely by RLS.
-- ============================================================

-- ---------- Tables ----------
create table if not exists public.carriers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  mc_number text,
  dot_number text,
  status text not null default 'pending' check (status in ('pending','active','suspended')),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'owner' check (role in ('owner','driver')),
  created_at timestamptz not null default now()
);

create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  type text not null check (type in ('dry_van','reefer','flatbed','power_only')),
  unit_number text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.loads (
  id uuid primary key default gen_random_uuid(),
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  ref_number text,
  broker_name text,
  origin_city text, origin_state text,
  dest_city text, dest_state text,
  pickup_date date, delivery_date date,
  rate numeric(10,2), miles integer,
  status text not null default 'booked' check (status in ('booked','in_transit','delivered','cancelled')),
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  type text not null check (type in ('mc_authority','coi','w9','rate_con','bol','pod')),
  load_id uuid references public.loads(id) on delete set null,
  file_path text,
  status text not null default 'pending' check (status in ('pending','verified','expired')),
  expires_at date,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid(),
  carrier_id uuid not null references public.carriers(id) on delete cascade,
  load_id uuid references public.loads(id) on delete cascade,
  gross numeric(10,2), dispatch_fee numeric(10,2), net numeric(10,2),
  status text not null default 'pending' check (status in ('pending','paid')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_profiles_carrier on public.profiles(carrier_id);
create index if not exists idx_equipment_carrier on public.equipment(carrier_id);
create index if not exists idx_loads_carrier on public.loads(carrier_id);
create index if not exists idx_documents_carrier on public.documents(carrier_id);
create index if not exists idx_settlements_carrier on public.settlements(carrier_id);

-- ---------- Helper functions (SECURITY INVOKER) ----------
create or replace function public.current_carrier_id()
returns uuid language sql stable security invoker set search_path = '' as $$
  select carrier_id from public.profiles where id = (select auth.uid())
$$;

create or replace function public.current_carrier_status()
returns text language sql stable security invoker set search_path = '' as $$
  select c.status from public.carriers c where c.id = public.current_carrier_id()
$$;

-- Prevent a carrier from changing their own approval status.
create or replace function public.lock_carrier_status()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    raise exception 'carrier status cannot be changed by the carrier';
  end if;
  return new;
end;
$$;
drop trigger if exists trg_lock_carrier_status on public.carriers;
create trigger trg_lock_carrier_status before update on public.carriers
  for each row execute function public.lock_carrier_status();

-- Auto-provision a pending carrier + owner profile on signup (status forced server-side).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare new_carrier uuid;
begin
  insert into public.carriers (company_name, mc_number, status)
  values (coalesce(nullif(new.raw_user_meta_data->>'company_name',''),'New Carrier'),
          nullif(new.raw_user_meta_data->>'mc_number',''), 'pending')
  returning id into new_carrier;
  insert into public.profiles (id, carrier_id, full_name, role)
  values (new.id, new_carrier, nullif(new.raw_user_meta_data->>'full_name',''), 'owner');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- RLS ----------
alter table public.carriers    enable row level security;
alter table public.profiles    enable row level security;
alter table public.equipment   enable row level security;
alter table public.loads       enable row level security;
alter table public.documents   enable row level security;
alter table public.settlements enable row level security;

grant select, insert, update on public.carriers   to authenticated;
grant select, insert, update on public.profiles    to authenticated;
grant select, insert, update, delete on public.equipment to authenticated;
grant select on public.loads       to authenticated;
grant select, insert, delete on public.documents   to authenticated;
grant select on public.settlements to authenticated;

drop policy if exists carriers_select on public.carriers;
create policy carriers_select on public.carriers for select to authenticated
  using ( id = public.current_carrier_id() );
drop policy if exists carriers_insert on public.carriers;
create policy carriers_insert on public.carriers for insert to authenticated
  with check ( status = 'pending' );
drop policy if exists carriers_update on public.carriers;
create policy carriers_update on public.carriers for update to authenticated
  using ( id = public.current_carrier_id() ) with check ( id = public.current_carrier_id() );

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using ( id = (select auth.uid()) );
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated
  with check ( id = (select auth.uid()) );
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using ( id = (select auth.uid()) ) with check ( id = (select auth.uid()) );

drop policy if exists equipment_select on public.equipment;
create policy equipment_select on public.equipment for select to authenticated
  using ( carrier_id = public.current_carrier_id() );
drop policy if exists equipment_insert on public.equipment;
create policy equipment_insert on public.equipment for insert to authenticated
  with check ( carrier_id = public.current_carrier_id() );
drop policy if exists equipment_update on public.equipment;
create policy equipment_update on public.equipment for update to authenticated
  using ( carrier_id = public.current_carrier_id() ) with check ( carrier_id = public.current_carrier_id() );
drop policy if exists equipment_delete on public.equipment;
create policy equipment_delete on public.equipment for delete to authenticated
  using ( carrier_id = public.current_carrier_id() );

-- Loads & settlements are read-only and gated to ACTIVE carriers (pending gate).
drop policy if exists loads_select on public.loads;
create policy loads_select on public.loads for select to authenticated
  using ( carrier_id = public.current_carrier_id() and public.current_carrier_status() = 'active' );

drop policy if exists settlements_select on public.settlements;
create policy settlements_select on public.settlements for select to authenticated
  using ( carrier_id = public.current_carrier_id() and public.current_carrier_status() = 'active' );

-- Documents: read + upload + delete own (allowed while pending for onboarding).
drop policy if exists documents_select on public.documents;
create policy documents_select on public.documents for select to authenticated
  using ( carrier_id = public.current_carrier_id() );
drop policy if exists documents_insert on public.documents;
create policy documents_insert on public.documents for insert to authenticated
  with check ( carrier_id = public.current_carrier_id() );
drop policy if exists documents_delete on public.documents;
create policy documents_delete on public.documents for delete to authenticated
  using ( carrier_id = public.current_carrier_id() );

-- ---------- Storage ----------
insert into storage.buckets (id, name, public)
values ('carrier-documents', 'carrier-documents', false)
on conflict (id) do nothing;

-- Path convention: '<carrier_id>/<type>/<filename>' — first folder must be the carrier.
drop policy if exists "carrier docs select" on storage.objects;
create policy "carrier docs select" on storage.objects for select to authenticated
  using ( bucket_id = 'carrier-documents' and (storage.foldername(name))[1] = public.current_carrier_id()::text );
drop policy if exists "carrier docs insert" on storage.objects;
create policy "carrier docs insert" on storage.objects for insert to authenticated
  with check ( bucket_id = 'carrier-documents' and (storage.foldername(name))[1] = public.current_carrier_id()::text );
drop policy if exists "carrier docs update" on storage.objects;
create policy "carrier docs update" on storage.objects for update to authenticated
  using ( bucket_id = 'carrier-documents' and (storage.foldername(name))[1] = public.current_carrier_id()::text )
  with check ( bucket_id = 'carrier-documents' and (storage.foldername(name))[1] = public.current_carrier_id()::text );
drop policy if exists "carrier docs delete" on storage.objects;
create policy "carrier docs delete" on storage.objects for delete to authenticated
  using ( bucket_id = 'carrier-documents' and (storage.foldername(name))[1] = public.current_carrier_id()::text );
