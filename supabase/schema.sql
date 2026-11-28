-- HospitIA multi-tenant database schema — France and Switzerland.
create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  city text,
  country text not null default 'FR' check (country in ('FR','CH')),
  language text not null default 'fr',
  plan text not null default 'starter' check (plan in ('starter','business','premium')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.hotel_members (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'manager' check (role in ('owner','manager','staff')),
  created_at timestamptz not null default now(),
  unique (hotel_id, user_id),
  unique (user_id)
);

create table if not exists public.hotel_facts (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  category text not null,
  question text not null,
  answer text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  channel text not null default 'web',
  guest_question text not null,
  assistant_answer text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.guest_requests (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  message text not null,
  status text not null default 'open' check (status in ('open','in_progress','closed')),
  created_at timestamptz not null default now()
);

alter table public.hotels enable row level security;
alter table public.hotel_members enable row level security;
alter table public.hotel_facts enable row level security;
alter table public.conversations enable row level security;
alter table public.guest_requests enable row level security;

revoke all on table public.hotels from anon, authenticated;
revoke all on table public.hotel_members from anon, authenticated;
revoke all on table public.hotel_facts from anon, authenticated;
revoke all on table public.conversations from anon, authenticated;
revoke all on table public.guest_requests from anon, authenticated;

grant select (id, name, city, language, is_active) on public.hotels to anon;
grant select (id, name, city, country, language, plan, slug, is_active, created_at) on public.hotels to authenticated;
grant select (id, hotel_id, user_id, role, created_at) on public.hotel_members to authenticated;
grant select (id, hotel_id, category, question, answer, is_public, created_at) on public.hotel_facts to anon, authenticated;
grant insert (hotel_id, category, question, answer, is_public) on public.hotel_facts to authenticated;
grant update (category, question, answer, is_public) on public.hotel_facts to authenticated;
grant delete on public.hotel_facts to authenticated;
grant select on public.conversations to authenticated;
grant select on public.guest_requests to authenticated;

drop policy if exists "members read own membership" on public.hotel_members;
create policy "members read own membership" on public.hotel_members for select to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "members read own hotel" on public.hotels;
create policy "members read own hotel" on public.hotels for select to authenticated
using (exists (select 1 from public.hotel_members m where m.hotel_id = hotels.id and m.user_id = (select auth.uid())));

drop policy if exists "public active hotel lookup" on public.hotels;
create policy "public active hotel lookup" on public.hotels for select to anon
using (is_active = true);

drop policy if exists "members read hotel facts" on public.hotel_facts;
create policy "members read hotel facts" on public.hotel_facts for select to authenticated
using (exists (select 1 from public.hotel_members m where m.hotel_id = hotel_facts.hotel_id and m.user_id = (select auth.uid())));

drop policy if exists "public read published facts for concierge" on public.hotel_facts;
create policy "public read published facts for concierge" on public.hotel_facts for select to anon
using (is_public = true and exists (select 1 from public.hotels h where h.id = hotel_facts.hotel_id and h.is_active = true));

drop policy if exists "members insert hotel facts" on public.hotel_facts;
create policy "members insert hotel facts" on public.hotel_facts for insert to authenticated
with check (exists (select 1 from public.hotel_members m where m.hotel_id = hotel_facts.hotel_id and m.user_id = (select auth.uid()) and m.role in ('owner','manager')));

drop policy if exists "members update hotel facts" on public.hotel_facts;
create policy "members update hotel facts" on public.hotel_facts for update to authenticated
using (exists (select 1 from public.hotel_members m where m.hotel_id = hotel_facts.hotel_id and m.user_id = (select auth.uid()) and m.role in ('owner','manager')))
with check (exists (select 1 from public.hotel_members m where m.hotel_id = hotel_facts.hotel_id and m.user_id = (select auth.uid()) and m.role in ('owner','manager')));

drop policy if exists "members delete hotel facts" on public.hotel_facts;
create policy "members delete hotel facts" on public.hotel_facts for delete to authenticated
using (exists (select 1 from public.hotel_members m where m.hotel_id = hotel_facts.hotel_id and m.user_id = (select auth.uid()) and m.role in ('owner','manager')));

drop policy if exists "members read conversations" on public.conversations;
create policy "members read conversations" on public.conversations for select to authenticated
using (exists (select 1 from public.hotel_members m where m.hotel_id = conversations.hotel_id and m.user_id = (select auth.uid())));

drop policy if exists "members read requests" on public.guest_requests;
create policy "members read requests" on public.guest_requests for select to authenticated
using (exists (select 1 from public.hotel_members m where m.hotel_id = guest_requests.hotel_id and m.user_id = (select auth.uid())));

create index if not exists hotel_members_user_id_idx on public.hotel_members(user_id);
create index if not exists hotel_facts_hotel_id_idx on public.hotel_facts(hotel_id);
create index if not exists conversations_hotel_id_idx on public.conversations(hotel_id);
create index if not exists guest_requests_hotel_id_idx on public.guest_requests(hotel_id);

-- Supabase platform trigger enables RLS automatically on public tables.
-- Direct execution through Data API is restricted; the database event trigger remains installed.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;


-- HospitIA operational modules and self-service onboarding (current schema snapshot).
alter table public.hotel_members drop constraint if exists hotel_members_user_id_key;

alter table public.guest_requests
  add column if not exists guest_name text,
  add column if not exists room_number text,
  add column if not exists category text,
  add column if not exists source text not null default 'guest'
    check (source in ('guest','staff','concierge'));

create table if not exists public.hotel_rooms (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels(id) on delete cascade,
  room_number text not null,
  room_type text not null default 'Chambre classique',
  floor text,
  status text not null default 'available' check (status in ('available','occupied','to_clean','out_of_service')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hotel_id, room_number)
);
alter table public.hotel_rooms enable row level security;

drop policy if exists "members read hotel rooms" on public.hotel_rooms;
create policy "members read hotel rooms" on public.hotel_rooms for select to authenticated
using (exists (select 1 from public.hotel_members m where m.hotel_id = hotel_rooms.hotel_id and m.user_id = (select auth.uid())));
drop policy if exists "managers insert hotel rooms" on public.hotel_rooms;
create policy "managers insert hotel rooms" on public.hotel_rooms for insert to authenticated
with check (exists (select 1 from public.hotel_members m where m.hotel_id = hotel_rooms.hotel_id and m.user_id = (select auth.uid()) and m.role in ('owner','manager')));
drop policy if exists "members update hotel room status" on public.hotel_rooms;
create policy "members update hotel room status" on public.hotel_rooms for update to authenticated
using (exists (select 1 from public.hotel_members m where m.hotel_id = hotel_rooms.hotel_id and m.user_id = (select auth.uid())))
with check (exists (select 1 from public.hotel_members m where m.hotel_id = hotel_rooms.hotel_id and m.user_id = (select auth.uid())));
drop policy if exists "managers delete hotel rooms" on public.hotel_rooms;
create policy "managers delete hotel rooms" on public.hotel_rooms for delete to authenticated
using (exists (select 1 from public.hotel_members m where m.hotel_id = hotel_rooms.hotel_id and m.user_id = (select auth.uid()) and m.role in ('owner','manager')));
grant select on public.hotel_rooms to authenticated;
grant insert (hotel_id, room_number, room_type, floor, status) on public.hotel_rooms to authenticated;
grant update (status) on public.hotel_rooms to authenticated;
grant delete on public.hotel_rooms to authenticated;

grant update (name, city, country, language) on public.hotels to authenticated;
drop policy if exists "managers update own hotel" on public.hotels;
create policy "managers update own hotel" on public.hotels for update to authenticated
using (exists (select 1 from public.hotel_members m where m.hotel_id = hotels.id and m.user_id = (select auth.uid()) and m.role in ('owner','manager')))
with check (exists (select 1 from public.hotel_members m where m.hotel_id = hotels.id and m.user_id = (select auth.uid()) and m.role in ('owner','manager')));

grant insert (hotel_id, channel, guest_question, assistant_answer) on public.conversations to anon;
drop policy if exists "guests write active hotel conversations" on public.conversations;
create policy "guests write active hotel conversations" on public.conversations for insert to anon
with check (exists (select 1 from public.hotels h where h.id = conversations.hotel_id and h.is_active = true));

grant insert (hotel_id, guest_name, room_number, category, message, source) on public.guest_requests to anon;
grant update (status) on public.guest_requests to authenticated;
drop policy if exists "guests submit to active hotels" on public.guest_requests;
create policy "guests submit to active hotels" on public.guest_requests for insert to anon
with check (status = 'open' and source = 'guest' and exists (select 1 from public.hotels h where h.id = guest_requests.hotel_id and h.is_active = true));
drop policy if exists "members update own guest requests" on public.guest_requests;
create policy "members update own guest requests" on public.guest_requests for update to authenticated
using (exists (select 1 from public.hotel_members m where m.hotel_id = guest_requests.hotel_id and m.user_id = (select auth.uid())))
with check (exists (select 1 from public.hotel_members m where m.hotel_id = guest_requests.hotel_id and m.user_id = (select auth.uid())));

create index if not exists hotel_rooms_hotel_id_idx on public.hotel_rooms(hotel_id);
create index if not exists guest_requests_hotel_status_created_idx on public.guest_requests(hotel_id, status, created_at desc);
create index if not exists conversations_hotel_created_idx on public.conversations(hotel_id, created_at desc);

alter table public.hotels add column if not exists owner_user_id uuid references auth.users(id) on delete set null;
grant insert (name, slug, city, country, language, plan, owner_user_id) on public.hotels to authenticated;
grant insert (hotel_id, user_id, role) on public.hotel_members to authenticated;

drop policy if exists "members read own hotel" on public.hotels;
create policy "members and owners read own hotel" on public.hotels for select to authenticated
using (owner_user_id = (select auth.uid()) or exists (select 1 from public.hotel_members m where m.hotel_id = hotels.id and m.user_id = (select auth.uid())));
drop policy if exists "authenticated owners create hotel" on public.hotels;
create policy "authenticated owners create hotel" on public.hotels for insert to authenticated
with check (owner_user_id = (select auth.uid()) and plan = 'starter');
drop policy if exists "owners join their created hotel" on public.hotel_members;
create policy "owners join their created hotel" on public.hotel_members for insert to authenticated
with check (user_id = (select auth.uid()) and role = 'owner' and exists (select 1 from public.hotels h where h.id = hotel_members.hotel_id and h.owner_user_id = (select auth.uid())));
create index if not exists hotels_owner_user_id_idx on public.hotels(owner_user_id);


-- Owner onboarding hardening: remove the hotels <-> hotel_members RLS recursion.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.is_hotel_owner(p_hotel_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.hotels h
    where h.id = p_hotel_id
      and h.owner_user_id = (select auth.uid())
  );
$function$;

revoke all on function private.is_hotel_owner(uuid) from public, anon;
grant execute on function private.is_hotel_owner(uuid) to authenticated;

drop policy if exists "owners join their created hotel" on public.hotel_members;
create policy "owners join their created hotel"
on public.hotel_members
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and private.is_hotel_owner(hotel_id)
);

-- Atomic, invoker-rights RPC so a hotel and its first owner are committed together.
create or replace function public.create_hotel_with_owner(
  p_name text,
  p_slug text,
  p_city text,
  p_country text,
  p_language text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_hotel_id uuid;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'Authentication required';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user_id::text, 0));

  if length(trim(coalesce(p_name, ''))) < 2 or length(p_name) > 150 then
    raise exception using errcode = '22023', message = 'Invalid hotel name';
  end if;

  if p_slug is null or length(trim(p_slug)) < 3 or length(p_slug) > 80 then
    raise exception using errcode = '22023', message = 'Invalid hotel slug';
  end if;

  if length(coalesce(p_city, '')) > 100 then
    raise exception using errcode = '22023', message = 'Invalid city';
  end if;

  if p_country not in ('FR', 'CH') then
    raise exception using errcode = '22023', message = 'Invalid country';
  end if;

  if p_language not in ('fr', 'en', 'it', 'de', 'es') then
    raise exception using errcode = '22023', message = 'Invalid language';
  end if;

  if exists (
    select 1 from public.hotel_members m where m.user_id = v_user_id
  ) or exists (
    select 1 from public.hotels h where h.owner_user_id = v_user_id
  ) then
    raise exception using errcode = '23505', message = 'An establishment is already associated with this account';
  end if;

  insert into public.hotels (
    name, slug, city, country, language, plan, owner_user_id
  ) values (
    trim(p_name),
    p_slug,
    nullif(trim(coalesce(p_city, '')), ''),
    p_country,
    p_language,
    'starter',
    v_user_id
  )
  returning id into v_hotel_id;

  insert into public.hotel_members (hotel_id, user_id, role)
  values (v_hotel_id, v_user_id, 'owner');

  return v_hotel_id;
end;
$function$;

revoke all on function public.create_hotel_with_owner(text, text, text, text, text) from public, anon;
grant execute on function public.create_hotel_with_owner(text, text, text, text, text) to authenticated;

-- Keep only the columns required by the dashboard and first-owner onboarding.
revoke select, insert on table public.hotel_members from authenticated;
grant select (id, hotel_id, user_id, role, created_at) on table public.hotel_members to authenticated;
grant insert (hotel_id, user_id, role) on table public.hotel_members to authenticated;
grant select (owner_user_id) on table public.hotels to authenticated;


-- Public API privilege corrections.
grant insert on table public.conversations to anon;
grant insert on table public.guest_requests to anon;
revoke all privileges on table public.hotel_rooms from anon;
revoke all privileges (id, hotel_id, room_number, room_type, floor, status, created_at, updated_at)
  on table public.hotel_rooms from anon;
