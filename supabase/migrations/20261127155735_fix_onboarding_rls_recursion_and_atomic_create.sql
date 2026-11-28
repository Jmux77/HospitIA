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

  if length(trim(coalesce(p_name, ''))) < 2 or length(p_name) > 150 then
    raise exception using errcode = '22023', message = 'Invalid hotel name';
  end if;

  if p_country not in ('FR', 'CH') then
    raise exception using errcode = '22023', message = 'Invalid country';
  end if;

  if p_language not in ('fr', 'en', 'it', 'de', 'es') then
    raise exception using errcode = '22023', message = 'Invalid language';
  end if;

  if exists (
    select 1 from public.hotel_members m where m.user_id = v_user_id
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
