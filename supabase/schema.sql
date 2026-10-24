create extension if not exists pgcrypto;

create type public.app_role as enum ('customer','agent','company','admin');
create type public.property_category as enum ('rent','sale','land');
create type public.property_status as enum ('draft','pending_review','verified','rejected','suspended','sold','rented');
create type public.document_kind as enum ('cofo','survey','deed','other');
create type public.document_status as enum ('pending','approved','rejected');
create type public.inspection_status as enum ('proposed','confirmed','suggested','declined','cancelled');

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  full_name text not null default '',
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  business_name text not null,
  rc_number text,
  status text not null default 'pending' check(status in ('pending','approved','rejected','suspended')),
  created_at timestamptz not null default now(),
  unique(owner_id)
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  audience text not null check(audience in ('customer','agency')),
  name text not null,
  price_kobo bigint not null check(price_kobo >= 0),
  interval text not null check(interval in ('month','year','once')),
  daily_ai_search_limit integer not null default 0 check(daily_ai_search_limit >= 0),
  search_credits integer not null default 0 check(search_credits >= 0),
  provider_plan_code text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.users(id) on delete cascade,
  plan_id uuid not null references public.plans(id),
  status text not null check(status in ('pending','active','past_due','cancelled','expired')),
  provider_ref text unique,
  provider_subscription_code text unique,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.processed_payments (
  provider text not null,
  provider_ref text not null,
  processed_at timestamptz not null default now(),
  primary key(provider,provider_ref)
);

create table if not exists public.ai_usage (
  user_id uuid not null references public.users(id) on delete cascade,
  day date not null default (now() at time zone 'Africa/Lagos')::date,
  search_count integer not null default 0 check(search_count >= 0),
  primary key(user_id,day)
);

create table if not exists public.ai_search_credits (
  user_id uuid primary key references public.users(id) on delete cascade,
  credits integer not null default 0 check(credits >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text not null,
  city text not null,
  tier text not null check(tier in ('standard','hot_zone','place_of_interest')),
  active boolean not null default true
);

create table if not exists public.fee_table (
  id uuid primary key default gen_random_uuid(),
  zone_tier text not null check(zone_tier in ('standard','hot_zone','place_of_interest')),
  property_type text not null,
  fixed_fee_kobo bigint not null check(fixed_fee_kobo >= 0),
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique(zone_tier,property_type)
);

create table if not exists public.parcels (
  id uuid primary key default gen_random_uuid(),
  survey_plan_number text not null unique,
  state text not null,
  lga text not null,
  polygon jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id),
  parcel_id uuid references public.parcels(id),
  category public.property_category not null,
  type text not null,
  title text not null check(length(title) between 8 and 120),
  description text not null check(length(description) between 30 and 5000),
  state text not null,
  lga text not null,
  city text not null,
  address text not null,
  latitude double precision check(latitude between -90 and 90),
  longitude double precision check(longitude between -180 and 180),
  zone_id uuid not null references public.zones(id),
  price_kobo bigint not null check(price_kobo > 0),
  bedrooms integer,
  plots numeric,
  land_size_sqm numeric,
  status public.property_status not null default 'draft',
  verified_at timestamptz,
  duplicate_flag boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists one_live_listing_per_parcel on public.properties(parcel_id) where parcel_id is not null and status = 'verified';
create index if not exists properties_discovery on public.properties(status, category, type, price_kobo);
create index if not exists properties_location on public.properties(state, city);

create table if not exists public.property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  url text not null,
  position integer not null default 0,
  alt text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  kind public.document_kind not null,
  storage_path text not null,
  status public.document_status not null default 'pending',
  reviewer_id uuid references public.users(id),
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  unique(property_id, kind, storage_path)
);

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id),
  customer_id uuid not null references public.users(id),
  agent_id uuid not null references public.users(id),
  created_at timestamptz not null default now(),
  unique(property_id, customer_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  sender_id uuid not null references public.users(id),
  body text not null check(length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  proposed_at timestamptz not null,
  status public.inspection_status not null default 'proposed',
  response_note text,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id),
  reporter_id uuid not null references public.users(id),
  reason text not null check(length(reason) between 10 and 1000),
  status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(),
  unique(property_id, reporter_id, status)
);

create table if not exists public.saved_properties (
  user_id uuid not null references public.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id, property_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.users(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.current_role() returns public.app_role language sql stable security definer set search_path = public as $$
  select role from public.users where id = (select auth.uid())
$$;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role() = 'admin', false)
$$;

revoke all on function public.current_role() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.current_role() to authenticated;
grant execute on function public.is_admin() to authenticated;

create or replace function public.bootstrap_profile() returns trigger language plpgsql security definer set search_path = public as $$
declare requested_role text := new.raw_user_meta_data ->> 'role';
begin
  insert into public.users(id, role, full_name, phone)
  values(
    new.id,
    case when requested_role in ('agent','company') then requested_role::public.app_role else 'customer'::public.app_role end,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  ) on conflict(id) do nothing;

  if requested_role in ('agent','company') and nullif(new.raw_user_meta_data ->> 'business_name','') is not null then
    insert into public.agencies(owner_id, business_name, rc_number)
    values(new.id, new.raw_user_meta_data ->> 'business_name', nullif(new.raw_user_meta_data ->> 'rc_number',''))
    on conflict(owner_id) do nothing;
  end if;

  return new;
end $$;

drop trigger if exists auth_user_bootstrap on auth.users;
create trigger auth_user_bootstrap after insert on auth.users for each row execute function public.bootstrap_profile();

create or replace function public.protect_profile_role() returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role then raise exception 'Role changes require an administrator.'; end if;
  return new;
end $$;

drop trigger if exists profile_role_guard on public.users;
create trigger profile_role_guard before update on public.users for each row execute function public.protect_profile_role();

create or replace function public.protect_agency_status() returns trigger language plpgsql as $$
begin
  if new.status is distinct from old.status and not public.is_admin() then raise exception 'Agency status changes require an administrator.'; end if;
  return new;
end $$;

drop trigger if exists agency_status_guard on public.agencies;
create trigger agency_status_guard before update on public.agencies for each row execute function public.protect_agency_status();

create or replace function public.audit_admin_action() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.audit_log(actor_id, action, entity, entity_id, metadata)
  values(auth.uid(), TG_ARGV[0], TG_TABLE_NAME, coalesce(new.id, old.id), jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new)));
  return coalesce(new, old);
end $$;

drop trigger if exists property_review_audit on public.properties;
create trigger property_review_audit after update of status,verified_at on public.properties
when (old.status is distinct from new.status or old.verified_at is distinct from new.verified_at)
execute function public.audit_admin_action('review');

drop trigger if exists document_review_audit on public.documents;
create trigger document_review_audit after update of status,reviewer_id,notes on public.documents
when (old.status is distinct from new.status or old.reviewer_id is distinct from new.reviewer_id or old.notes is distinct from new.notes)
execute function public.audit_admin_action('document_review');

drop trigger if exists fee_table_audit on public.fee_table;
create trigger fee_table_audit after insert or update or delete on public.fee_table execute function public.audit_admin_action('fee_table_change');

drop trigger if exists report_review_audit on public.reports;
create trigger report_review_audit after update of status on public.reports
when(old.status is distinct from new.status) execute function public.audit_admin_action('report_review');

create or replace function public.protect_property_approval() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if new.status is distinct from old.status and not public.is_admin() then raise exception 'Listing review decisions require an administrator.'; end if;
  if new.status='verified' and old.status is distinct from 'verified' then
    if not public.is_admin() then raise exception 'Only an administrator can approve a listing.'; end if;
    if new.duplicate_flag then raise exception 'Duplicate parcel must be resolved before approval.'; end if;
    if exists(select 1 from (values('cofo'::public.document_kind),('survey'::public.document_kind),('other'::public.document_kind)) required(kind)
      where not exists(select 1 from public.documents d where d.property_id=new.id and d.kind=required.kind and d.status='approved')) then
      raise exception 'All required documents must be approved first.';
    end if;
    if new.parcel_id is null then raise exception 'A survey plan number is required before approval.'; end if;
    new.verified_at := now();
  elsif new.status is distinct from 'verified' and not public.is_admin() then
    new.verified_at := null;
  end if;
  return new;
end $$;

drop trigger if exists property_approval_guard on public.properties;
create trigger property_approval_guard before update on public.properties for each row execute function public.protect_property_approval();

create or replace function public.protect_document_review() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if (new.status is distinct from old.status or new.reviewer_id is distinct from old.reviewer_id or new.reviewed_at is distinct from old.reviewed_at or new.notes is distinct from old.notes) and not public.is_admin() then
    raise exception 'Document review decisions require an administrator.';
  end if;
  if new.status is distinct from old.status then new.reviewer_id := auth.uid(); new.reviewed_at := now(); end if;
  return new;
end $$;

drop trigger if exists document_review_guard on public.documents;
create trigger document_review_guard before update on public.documents for each row execute function public.protect_document_review();

create or replace function public.review_property(p_property_id uuid, p_action text, p_note text default null) returns jsonb language plpgsql security definer set search_path=public as $$
declare target_status public.property_status;
begin
  if not public.is_admin() then raise exception 'admin required'; end if;
  if p_action not in ('approve','reject','suspend') then raise exception 'invalid review action'; end if;
  select status into target_status from public.properties where id=p_property_id for update;
  if target_status is null then raise exception 'listing not found'; end if;
  if p_action='approve' then
    if target_status<>'pending_review' then raise exception 'only pending listings can be approved'; end if;
    if exists(select 1 from (values('cofo'::public.document_kind),('survey'::public.document_kind),('other'::public.document_kind)) required(kind) where not exists(select 1 from public.documents d where d.property_id=p_property_id and d.kind=required.kind)) then raise exception 'required documents missing'; end if;
    update public.documents set status='approved',notes=nullif(p_note,'') where property_id=p_property_id;
    update public.properties set status='verified' where id=p_property_id;
  elsif p_action='reject' then
    if target_status<>'pending_review' or length(trim(coalesce(p_note,'')))<5 then raise exception 'rejection requires a note'; end if;
    update public.documents set status='rejected',notes=trim(p_note) where property_id=p_property_id;
    update public.properties set status='rejected',verified_at=null where id=p_property_id;
  else
    update public.properties set status='suspended',verified_at=null where id=p_property_id;
  end if;
  return jsonb_build_object('property_id',p_property_id,'status',case when p_action='approve' then 'verified' when p_action='reject' then 'rejected' else 'suspended' end);
end $$;

revoke all on function public.review_property(uuid,text,text) from public;
grant execute on function public.review_property(uuid,text,text) to authenticated;

create or replace function public.validate_chat_thread() returns trigger language plpgsql security definer set search_path=public as $$
declare owner_uuid uuid;
begin
  select a.owner_id into owner_uuid from public.properties p join public.agencies a on a.id=p.agency_id where p.id=new.property_id and p.status='verified';
  if owner_uuid is null or new.customer_id is distinct from auth.uid() or new.agent_id is distinct from owner_uuid then raise exception 'Invalid chat participants or listing.'; end if;
  return new;
end $$;

drop trigger if exists chat_thread_guard on public.chat_threads;
create trigger chat_thread_guard before insert on public.chat_threads for each row execute function public.validate_chat_thread();

create or replace function public.notify_chat_participant() returns trigger language plpgsql security definer set search_path=public as $$
declare recipient uuid; property_title text; thread public.chat_threads;
begin
  select * into thread from public.chat_threads where id=new.thread_id;
  recipient := case when new.sender_id = thread.customer_id then thread.agent_id else thread.customer_id end;
  select title into property_title from public.properties where id=thread.property_id;
  insert into public.notifications(user_id, kind, title, body, href)
  values(recipient, 'message', 'New message', left(new.body, 180), '/chat/' || thread.id::text);
  return new;
end $$;

drop trigger if exists message_notification on public.messages;
create trigger message_notification after insert on public.messages for each row execute function public.notify_chat_participant();

create or replace function public.notify_inspection_participant() returns trigger language plpgsql security definer set search_path=public as $$
declare thread public.chat_threads; recipient uuid;
begin
  select * into thread from public.chat_threads where id=new.thread_id;
  recipient := case when new.created_by = thread.customer_id then thread.agent_id else thread.customer_id end;
  insert into public.notifications(user_id, kind, title, body, href)
  values(recipient, 'inspection', 'Inspection update', 'An inspection time was requested or updated.', '/chat/' || thread.id::text);
  return new;
end $$;

drop trigger if exists inspection_notification on public.inspections;
create trigger inspection_notification after insert or update on public.inspections for each row execute function public.notify_inspection_participant();

create or replace function public.consume_ai_search(p_user_id uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare today date := (now() at time zone 'Africa/Lagos')::date; allowance integer; used integer; credits_left integer;
begin
  if auth.uid() is distinct from p_user_id then raise exception 'forbidden'; end if;
  select coalesce(
    (select pl.daily_ai_search_limit from public.subscriptions s join public.plans pl on pl.id=s.plan_id where s.subject_id=p_user_id and s.status='active' and pl.active order by pl.daily_ai_search_limit desc limit 1),
    (select pl.daily_ai_search_limit from public.plans pl where pl.audience='customer' and pl.active and pl.price_kobo=0 order by pl.daily_ai_search_limit desc limit 1),
    0
  ) into allowance;
  insert into public.ai_usage(user_id, day, search_count) values(p_user_id, today, 0) on conflict(user_id, day) do nothing;
  select search_count into used from public.ai_usage where user_id=p_user_id and day=today for update;
  if used < allowance then
    update public.ai_usage set search_count = search_count + 1 where user_id=p_user_id and day=today returning search_count into used;
    return jsonb_build_object('allowed', true, 'paid', false, 'used', used, 'limit', allowance, 'remaining', greatest(allowance - used, 0));
  end if;
  insert into public.ai_search_credits(user_id, credits) values(p_user_id, 0) on conflict(user_id) do nothing;
  select credits into credits_left from public.ai_search_credits where user_id=p_user_id for update;
  if credits_left > 0 then
    update public.ai_search_credits set credits = credits - 1, updated_at = now() where user_id=p_user_id returning credits into credits_left;
    return jsonb_build_object('allowed', true, 'paid', true, 'used', used, 'limit', allowance, 'credits_remaining', credits_left, 'remaining', credits_left);
  end if;
  return jsonb_build_object('allowed', false, 'paid', false, 'used', used, 'limit', allowance, 'remaining', 0, 'credits_remaining', 0);
end $$;

revoke all on function public.consume_ai_search(uuid) from public;
grant execute on function public.consume_ai_search(uuid) to authenticated;

create or replace function public.fulfill_paystack_checkout(p_reference text, p_amount bigint, p_currency text, p_subscription_code text default null) returns jsonb language plpgsql security definer set search_path=public as $$
declare sub public.subscriptions; plan public.plans; period_end timestamptz;
begin
  select * into sub from public.subscriptions where provider_ref=p_reference for update;
  if sub.id is null then return jsonb_build_object('ok', false, 'reason', 'checkout not found'); end if;
  if sub.status='active' then return jsonb_build_object('ok', true, 'duplicate', true); end if;
  if sub.status<>'pending' then return jsonb_build_object('ok', false, 'reason', 'checkout is not pending'); end if;
  select * into plan from public.plans where id=sub.plan_id and active;
  if plan.id is null or p_currency<>'NGN' or p_amount<>plan.price_kobo then return jsonb_build_object('ok', false, 'reason', 'payment does not match plan'); end if;
  insert into public.processed_payments(provider, provider_ref) values('paystack', p_reference) on conflict do nothing;
  if not found then return jsonb_build_object('ok', true, 'duplicate', true); end if;
  if plan.interval='once' then
    if plan.audience<>'customer' or plan.search_credits<1 then return jsonb_build_object('ok', false, 'reason', 'invalid credit plan'); end if;
    insert into public.ai_search_credits(user_id, credits) values(sub.subject_id, plan.search_credits)
      on conflict(user_id) do update set credits = public.ai_search_credits.credits + excluded.credits, updated_at = now();
    period_end := date_trunc('day', now() at time zone 'Africa/Lagos') at time zone 'Africa/Lagos' + interval '1 day';
  else
    if plan.audience<>'agency' or plan.interval not in ('month','year') then return jsonb_build_object('ok', false, 'reason', 'invalid hosting plan'); end if;
    period_end := now() + case when plan.interval='year' then interval '1 year' else interval '1 month' end;
  end if;
  update public.subscriptions set status='active', provider_subscription_code=coalesce(p_subscription_code, provider_subscription_code), current_period_end=period_end where id=sub.id;
  insert into public.audit_log(actor_id, action, entity, entity_id, metadata) values(sub.subject_id, 'payment_confirmed', 'subscriptions', sub.id, jsonb_build_object('provider','paystack','plan_id',plan.id));
  return jsonb_build_object('ok', true, 'duplicate', false);
end $$;

revoke all on function public.fulfill_paystack_checkout(text,bigint,text,text) from public;
grant execute on function public.fulfill_paystack_checkout(text,bigint,text,text) to service_role;

create or replace function public.fulfill_paystack_renewal(p_subscription_code text, p_reference text, p_amount bigint, p_currency text) returns jsonb language plpgsql security definer set search_path=public as $$
declare sub public.subscriptions; plan public.plans;
begin
  select * into sub from public.subscriptions where provider_subscription_code=p_subscription_code for update;
  if sub.id is null then return jsonb_build_object('ok', false, 'reason', 'subscription not found'); end if;
  insert into public.processed_payments(provider, provider_ref) values('paystack', p_reference) on conflict do nothing;
  if not found then return jsonb_build_object('ok', true, 'duplicate', true); end if;
  select * into plan from public.plans where id=sub.plan_id and active;
  if plan.id is null or p_currency<>'NGN' or p_amount<>plan.price_kobo then return jsonb_build_object('ok', false, 'reason', 'payment does not match plan'); end if;
  update public.subscriptions set status='active', current_period_end = greatest(coalesce(current_period_end, now()), now()) + case when plan.interval='year' then interval '1 year' else interval '1 month' end where id=sub.id;
  insert into public.audit_log(actor_id, action, entity, entity_id, metadata) values(sub.subject_id, 'payment_renewed', 'subscriptions', sub.id, jsonb_build_object('provider','paystack','plan_id',plan.id));
  return jsonb_build_object('ok', true, 'duplicate', false);
end $$;

revoke all on function public.fulfill_paystack_renewal(text,text,bigint,text) from public;
grant execute on function public.fulfill_paystack_renewal(text,text,bigint,text) to service_role;

create or replace function public.flag_duplicate_parcel(p_survey text, p_state text, p_lga text) returns jsonb language plpgsql security definer set search_path=public as $$
declare normalized text := upper(regexp_replace(trim(p_survey), '[^A-Za-z0-9]', '', 'g')); existing_id uuid;
begin
  if public.current_role() not in ('agent','company','admin') then raise exception 'forbidden'; end if;
  select id into existing_id from public.parcels where survey_plan_number=normalized;
  return jsonb_build_object('duplicate', existing_id is not null, 'parcel_id', existing_id, 'normalized', normalized, 'state', p_state, 'lga', p_lga);
end $$;

grant execute on function public.flag_duplicate_parcel(text,text,text) to authenticated;

create or replace function public.register_property_parcel(p_property_id uuid, p_survey text, p_state text, p_lga text) returns jsonb language plpgsql security definer set search_path=public as $$
declare normalized text := upper(regexp_replace(trim(p_survey), '[^A-Za-z0-9]', '', 'g')); parcel_uuid uuid; is_duplicate boolean;
begin
  if public.current_role() not in ('agent','company','admin') then raise exception 'forbidden'; end if;
  if not (public.is_admin() or exists(select 1 from public.properties p join public.agencies a on a.id=p.agency_id where p.id=p_property_id and a.owner_id=auth.uid())) then raise exception 'forbidden'; end if;
  if length(normalized)<4 then raise exception 'invalid survey plan number'; end if;
  select id into parcel_uuid from public.parcels where survey_plan_number=normalized;
  is_duplicate := parcel_uuid is not null;
  if parcel_uuid is null then
    insert into public.parcels(survey_plan_number, state, lga) values(normalized, p_state, p_lga) returning id into parcel_uuid;
  end if;
  update public.properties set parcel_id=parcel_uuid, duplicate_flag=is_duplicate where id=p_property_id;
  return jsonb_build_object('duplicate', is_duplicate, 'parcel_id', parcel_uuid);
end $$;

revoke all on function public.register_property_parcel(uuid,text,text,text) from public;
grant execute on function public.register_property_parcel(uuid,text,text,text) to authenticated;

alter table public.users enable row level security;
alter table public.agencies enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.ai_usage enable row level security;
alter table public.ai_search_credits enable row level security;
alter table public.zones enable row level security;
alter table public.fee_table enable row level security;
alter table public.parcels enable row level security;
alter table public.properties enable row level security;
alter table public.property_media enable row level security;
alter table public.documents enable row level security;
alter table public.chat_threads enable row level security;
alter table public.messages enable row level security;
alter table public.inspections enable row level security;
alter table public.reports enable row level security;
alter table public.saved_properties enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;

create policy if not exists "profile owner or admin reads" on public.users for select to authenticated using (id = auth.uid() or public.is_admin());
create policy if not exists "chat participants see counterpart name" on public.users for select to authenticated using (
  exists(select 1 from public.chat_threads t where (t.customer_id = auth.uid() and t.agent_id = id) or (t.agent_id = auth.uid() and t.customer_id = id))
);
create policy if not exists "profile owner updates safe fields" on public.users for update to authenticated using(id = auth.uid()) with check(id = auth.uid() and role = public.current_role());
create policy if not exists "agency owner and admin reads" on public.agencies for select to authenticated using(owner_id = auth.uid() or public.is_admin());
create policy if not exists "agency owner creates own" on public.agencies for insert to authenticated with check(owner_id = auth.uid() and public.current_role() in ('agent','company'));
create policy if not exists "agency owner updates own" on public.agencies for update to authenticated using(owner_id = auth.uid() or public.is_admin()) with check(owner_id = auth.uid() or public.is_admin());
create policy if not exists "plans public active read" on public.plans for select to anon,authenticated using(active);
create policy if not exists "subscription owner reads" on public.subscriptions for select to authenticated using(subject_id = auth.uid() or public.is_admin());
create policy if not exists "usage owner reads" on public.ai_usage for select to authenticated using(user_id = auth.uid());
create policy if not exists "search credits owner reads" on public.ai_search_credits for select to authenticated using(user_id = auth.uid());
create policy if not exists "zones public read" on public.zones for select to anon,authenticated using(active);
create policy if not exists "fees public read" on public.fee_table for select to anon,authenticated using(active);
create policy if not exists "fees admin manage" on public.fee_table for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy if not exists "parcels admin read" on public.parcels for select to authenticated using(public.is_admin());
create policy if not exists "verified property public read" on public.properties for select to anon,authenticated using((status='verified' and agency_id in(select a.id from public.agencies a join public.subscriptions s on s.subject_id=a.owner_id where s.status='active' and (s.current_period_end is null or s.current_period_end>now()))) or public.is_admin() or agency_id in (select id from public.agencies where owner_id=auth.uid()));
create policy if not exists "agency owner creates draft listing" on public.properties for insert to authenticated with check(agency_id in (select id from public.agencies where owner_id=auth.uid()) and status='draft' and verified_at is null);
create policy if not exists "agency owner updates own draft" on public.properties for update to authenticated using(agency_id in(select id from public.agencies where owner_id=auth.uid()) or public.is_admin()) with check(public.is_admin() or (agency_id in(select id from public.agencies where owner_id=auth.uid()) and verified_at is null and status in ('draft','pending_review')));
create policy if not exists "public media for visible listings" on public.property_media for select to anon,authenticated using(property_id in(select id from public.properties where status='verified') or public.is_admin() or property_id in(select p.id from public.properties p join public.agencies a on a.id=p.agency_id where a.owner_id=auth.uid()));
create policy if not exists "agency and admin manage listing media" on public.property_media for all to authenticated using(public.is_admin() or property_id in(select p.id from public.properties p join public.agencies a on a.id=p.agency_id where a.owner_id=auth.uid())) with check(public.is_admin() or property_id in(select p.id from public.properties p join public.agencies a on a.id=p.agency_id where a.owner_id=auth.uid()));
create policy if not exists "agency and admin read documents" on public.documents for select to authenticated using(public.is_admin() or property_id in(select p.id from public.properties p join public.agencies a on a.id=p.agency_id where a.owner_id=auth.uid()));
create policy if not exists "agency uploads pending documents" on public.documents for insert to authenticated with check(status='pending' and reviewer_id is null and property_id in(select p.id from public.properties p join public.agencies a on a.id=p.agency_id where a.owner_id=auth.uid() and p.status='draft'));
create policy if not exists "admin reviews documents" on public.documents for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy if not exists "participants read threads" on public.chat_threads for select to authenticated using(customer_id=auth.uid() or agent_id=auth.uid() or public.is_admin());
create policy if not exists "customer starts thread on verified listing" on public.chat_threads for insert to authenticated with check(customer_id=auth.uid() and property_id in(select id from public.properties where status='verified'));
create policy if not exists "participants read messages" on public.messages for select to authenticated using(thread_id in(select id from public.chat_threads where customer_id=auth.uid() or agent_id=auth.uid()) or public.is_admin());
create policy if not exists "participants send own message" on public.messages for insert to authenticated with check(sender_id=auth.uid() and thread_id in(select id from public.chat_threads where customer_id=auth.uid() or agent_id=auth.uid()));
create policy if not exists "participants read inspections" on public.inspections for select to authenticated using(thread_id in(select id from public.chat_threads where customer_id=auth.uid() or agent_id=auth.uid()) or public.is_admin());
create policy if not exists "participants propose inspection" on public.inspections for insert to authenticated with check(created_by=auth.uid() and status='proposed' and thread_id in(select id from public.chat_threads where customer_id=auth.uid() or agent_id=auth.uid()));
create policy if not exists "participants respond to inspection" on public.inspections for update to authenticated using(thread_id in(select id from public.chat_threads where customer_id=auth.uid() or agent_id=auth.uid())) with check(thread_id in(select id from public.chat_threads where customer_id=auth.uid() or agent_id=auth.uid()));
create policy if not exists "reporter reads reports" on public.reports for select to authenticated using(reporter_id=auth.uid() or public.is_admin());
create policy if not exists "customer reports listing" on public.reports for insert to authenticated with check(reporter_id=auth.uid() and property_id in(select id from public.properties where status='verified'));
create policy if not exists "admin handles reports" on public.reports for update to authenticated using(public.is_admin()) with check(public.is_admin());
create policy if not exists "saved listing owner controls" on public.saved_properties for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy if not exists "notification owner reads and updates" on public.notifications for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy if not exists "admin reads audit" on public.audit_log for select to authenticated using(public.is_admin());

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values
  ('listing-photos', 'listing-photos', true, 8388608, array['image/jpeg','image/png','image/webp']),
  ('listing-documents', 'listing-documents', false, 12582912, array['application/pdf','image/jpeg','image/png'])
on conflict(id) do nothing;

create policy if not exists "public verified listing photos" on storage.objects for select to anon,authenticated using(bucket_id='listing-photos' and (storage.foldername(name))[2] in(select p.id::text from public.properties p join public.agencies a on a.id=p.agency_id join public.subscriptions s on s.subject_id=a.owner_id where p.status='verified' and s.status='active' and (s.current_period_end is null or s.current_period_end>now())));
create policy if not exists "agency uploads listing photos" on storage.objects for insert to authenticated with check(bucket_id='listing-photos' and (storage.foldername(name))[1] in(select id::text from public.agencies where owner_id=auth.uid()));
create policy if not exists "agency manages own photos" on storage.objects for delete to authenticated using(bucket_id='listing-photos' and (storage.foldername(name))[1] in(select id::text from public.agencies where owner_id=auth.uid()));
create policy if not exists "agency uploads private docs" on storage.objects for insert to authenticated with check(bucket_id='listing-documents' and (storage.foldername(name))[1] in(select id::text from public.agencies where owner_id=auth.uid()));
create policy if not exists "agency and admin read own docs" on storage.objects for select to authenticated using(bucket_id='listing-documents' and (public.is_admin() or (storage.foldername(name))[1] in(select id::text from public.agencies where owner_id=auth.uid())));
create policy if not exists "agency deletes own docs" on storage.objects for delete to authenticated using(bucket_id='listing-documents' and (storage.foldername(name))[1] in(select id::text from public.agencies where owner_id=auth.uid()));

notify pgrst, 'reload schema';
