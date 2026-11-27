-- Enable public concierge writes while retaining row-level restrictions.
grant insert on table public.conversations to anon;
grant insert on table public.guest_requests to anon;

-- Public visitors must never access hotel room inventory.
revoke all privileges on table public.hotel_rooms from anon;
revoke all privileges (id, hotel_id, room_number, room_type, floor, status, created_at, updated_at)
  on table public.hotel_rooms from anon;
