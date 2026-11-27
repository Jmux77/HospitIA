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
