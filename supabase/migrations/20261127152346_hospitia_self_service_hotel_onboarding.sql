alter table public.hotels
  add column if not exists owner_user_id uuid references auth.users(id) on delete set null;

grant insert (name, slug, city, country, language, plan, owner_user_id) on public.hotels to authenticated;
grant insert (hotel_id, user_id, role) on public.hotel_members to authenticated;

drop policy if exists "members read own hotel" on public.hotels;
create policy "members and owners read own hotel"
on public.hotels for select to authenticated
using (
  owner_user_id = (select auth.uid())
  or exists (
    select 1 from public.hotel_members m
    where m.hotel_id = hotels.id and m.user_id = (select auth.uid())
  )
);

drop policy if exists "authenticated owners create hotel" on public.hotels;
create policy "authenticated owners create hotel"
on public.hotels for insert to authenticated
with check (owner_user_id = (select auth.uid()) and plan = 'starter');

drop policy if exists "owners join their created hotel" on public.hotel_members;
create policy "owners join their created hotel"
on public.hotel_members for insert to authenticated
with check (
  user_id = (select auth.uid())
  and role = 'owner'
  and exists (
    select 1 from public.hotels h
    where h.id = hotel_members.hotel_id and h.owner_user_id = (select auth.uid())
  )
);

create index if not exists hotels_owner_user_id_idx on public.hotels(owner_user_id);
