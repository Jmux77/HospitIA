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

grant select (id, name, city, is_active) on public.hotels to anon;
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
