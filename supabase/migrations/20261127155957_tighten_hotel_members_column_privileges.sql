revoke select, insert on table public.hotel_members from authenticated;
grant select (id, hotel_id, user_id, role, created_at) on table public.hotel_members to authenticated;
grant insert (hotel_id, user_id, role) on table public.hotel_members to authenticated;
grant select (owner_user_id) on table public.hotels to authenticated;
