grant select (is_active) on public.hotels to anon;

create index if not exists hotel_facts_hotel_id_idx on public.hotel_facts(hotel_id);
create index if not exists conversations_hotel_id_idx on public.conversations(hotel_id);
create index if not exists guest_requests_hotel_id_idx on public.guest_requests(hotel_id);
create index if not exists hotel_members_user_id_idx on public.hotel_members(user_id);
