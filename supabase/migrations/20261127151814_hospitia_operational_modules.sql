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
  status text not null default 'available'
    check (status in ('available','occupied','to_clean','out_of_service')),
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
