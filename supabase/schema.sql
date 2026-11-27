-- HospitIA multi-tenant database schema (MVP)
create extension if not exists pgcrypto;
create table if not exists public.hotels (
 id uuid primary key default gen_random_uuid(), name text not null, slug text unique, city text,
 country text not null default 'FR' check (country in ('FR','CH')), language text not null default 'fr',
 plan text not null default 'starter' check (plan in ('starter','business','premium')),
 is_active boolean not null default true, created_at timestamptz not null default now()
);
create table if not exists public.hotel_members (
 id uuid primary key default gen_random_uuid(), hotel_id uuid not null references public.hotels(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null default 'manager' check (role in ('owner','manager','staff')),
 created_at timestamptz not null default now(), unique(hotel_id,user_id), unique(user_id)
);
create table if not exists public.hotel_facts (
 id uuid primary key default gen_random_uuid(), hotel_id uuid not null references public.hotels(id) on delete cascade,
 category text not null, question text not null, answer text not null, created_at timestamptz not null default now()
);
create table if not exists public.conversations (
 id uuid primary key default gen_random_uuid(), hotel_id uuid not null references public.hotels(id) on delete cascade,
 channel text not null default 'web', guest_question text not null, assistant_answer text not null,
 created_at timestamptz not null default now()
);
create table if not exists public.guest_requests (
 id uuid primary key default gen_random_uuid(), hotel_id uuid not null references public.hotels(id) on delete cascade,
 message text not null, status text not null default 'open' check (status in ('open','in_progress','closed')),
 created_at timestamptz not null default now()
);
alter table public.hotels enable row level security;
alter table public.hotel_members enable row level security;
alter table public.hotel_facts enable row level security;
alter table public.conversations enable row level security;
alter table public.guest_requests enable row level security;

drop policy if exists "members read own membership" on public.hotel_members;
create policy "members read own membership" on public.hotel_members for select to authenticated using (user_id=auth.uid());
drop policy if exists "members read own hotel" on public.hotels;
create policy "members read own hotel" on public.hotels for select to authenticated using (
 exists(select 1 from public.hotel_members m where m.hotel_id=hotels.id and m.user_id=auth.uid())
);
drop policy if exists "public active hotel lookup" on public.hotels;
create policy "public active hotel lookup" on public.hotels for select to anon using (is_active=true);

drop policy if exists "members read hotel facts" on public.hotel_facts;
create policy "members read hotel facts" on public.hotel_facts for select to authenticated using (
 exists(select 1 from public.hotel_members m where m.hotel_id=hotel_facts.hotel_id and m.user_id=auth.uid())
);
drop policy if exists "public read facts for concierge" on public.hotel_facts;
create policy "public read facts for concierge" on public.hotel_facts for select to anon using (
 exists(select 1 from public.hotels h where h.id=hotel_facts.hotel_id and h.is_active=true)
);
drop policy if exists "members insert hotel facts" on public.hotel_facts;
create policy "members insert hotel facts" on public.hotel_facts for insert to authenticated with check (
 exists(select 1 from public.hotel_members m where m.hotel_id=hotel_facts.hotel_id and m.user_id=auth.uid() and m.role in ('owner','manager'))
);
drop policy if exists "members delete hotel facts" on public.hotel_facts;
create policy "members delete hotel facts" on public.hotel_facts for delete to authenticated using (
 exists(select 1 from public.hotel_members m where m.hotel_id=hotel_facts.hotel_id and m.user_id=auth.uid() and m.role in ('owner','manager'))
);
drop policy if exists "members read conversations" on public.conversations;
create policy "members read conversations" on public.conversations for select to authenticated using (
 exists(select 1 from public.hotel_members m where m.hotel_id=conversations.hotel_id and m.user_id=auth.uid())
);
drop policy if exists "members read requests" on public.guest_requests;
create policy "members read requests" on public.guest_requests for select to authenticated using (
 exists(select 1 from public.hotel_members m where m.hotel_id=guest_requests.hotel_id and m.user_id=auth.uid())
);
-- Guest chat writes are disabled until a server-side write path and rate limiting are configured.
