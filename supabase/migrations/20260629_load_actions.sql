-- ============================================================
-- Carrier-side load actions: status advance + POD → ready_to_invoice.
-- ============================================================

-- Carriers may update their own active loads (columns restricted by trigger below).
grant update on public.loads to authenticated;
drop policy if exists loads_update on public.loads;
create policy loads_update on public.loads for update to authenticated
  using ( carrier_id = public.current_carrier_id() and public.current_carrier_status() = 'active' )
  with check ( carrier_id = public.current_carrier_id() );

-- Restrict carrier edits to status + lifecycle timestamps only.
create or replace function public.lock_load_fields()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if current_user = 'authenticated' then
    if new.ref_number is distinct from old.ref_number
       or new.broker_name is distinct from old.broker_name
       or new.rate is distinct from old.rate
       or new.miles is distinct from old.miles
       or new.carrier_id is distinct from old.carrier_id
       or new.ready_to_invoice is distinct from old.ready_to_invoice then
      raise exception 'carriers may only update load status';
    end if;
  end if;
  return new;
end; $$;
revoke all on function public.lock_load_fields() from public, anon, authenticated;
drop trigger if exists trg_lock_load_fields on public.loads;
create trigger trg_lock_load_fields before update on public.loads for each row execute function public.lock_load_fields();

-- Status change → notification + audit.
create or replace function public.tg_loads_status_changed()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status is distinct from old.status then
    insert into public.notifications(carrier_id, type, title, body, entity_type, entity_id)
    values (new.carrier_id, 'load_status', 'Load ' || replace(new.status,'_',' '),
            coalesce(new.ref_number,'Load') || ' is now ' || replace(new.status,'_',' ') || '.', 'load', new.id);
    insert into public.audit_log(carrier_id, actor_id, action, entity_type, entity_id, metadata)
    values (new.carrier_id, (select auth.uid()), 'load_status_changed', 'load', new.id,
            jsonb_build_object('ref_number', new.ref_number, 'status', new.status));
  end if;
  return new;
end; $$;
revoke all on function public.tg_loads_status_changed() from public, anon, authenticated;
drop trigger if exists trg_loads_status_changed on public.loads;
create trigger trg_loads_status_changed after update on public.loads for each row execute function public.tg_loads_status_changed();

-- POD uploaded → mark load ready_to_invoice + notify + audit.
create or replace function public.tg_pod_uploaded()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.type = 'pod' and new.load_id is not null then
    update public.loads set ready_to_invoice = true where id = new.load_id and carrier_id = new.carrier_id;
    insert into public.notifications(carrier_id, type, title, body, entity_type, entity_id)
    values (new.carrier_id, 'pod', 'POD uploaded', 'Proof of delivery received — load is ready to invoice.', 'load', new.load_id);
    insert into public.audit_log(carrier_id, actor_id, action, entity_type, entity_id, metadata)
    values (new.carrier_id, (select auth.uid()), 'pod_uploaded', 'load', new.load_id, '{}'::jsonb);
  end if;
  return new;
end; $$;
revoke all on function public.tg_pod_uploaded() from public, anon, authenticated;
drop trigger if exists trg_pod_uploaded on public.documents;
create trigger trg_pod_uploaded after insert on public.documents for each row execute function public.tg_pod_uploaded();
