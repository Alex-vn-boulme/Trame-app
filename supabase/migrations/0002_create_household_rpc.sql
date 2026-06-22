-- ──────────────────────────────────────────────────────────────────────────
-- create_household_with_member(name, initial, color, display_name)
--
-- Atomic onboarding helper: inserts a household and the calling user as its
-- first member in a single transaction, returning the new household id.
--
-- Needed because RLS on `households` filters SELECT to existing members, so
-- a bare INSERT … RETURNING id from the client returns 0 rows (the caller
-- isn't a member yet at the moment the RETURNING is filtered).
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.create_household_with_member(
  p_name         text,
  p_initial      char(1),
  p_color        text,
  p_display_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id  uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated' using errcode = '42501';
  end if;

  insert into public.households (name)
  values (p_name)
  returning id into v_id;

  insert into public.household_members (
    household_id, user_id, initial, color, display_name
  ) values (
    v_id, v_uid, p_initial, p_color, p_display_name
  );

  return v_id;
end;
$$;

revoke all on function public.create_household_with_member(text, char, text, text) from public;
grant execute on function public.create_household_with_member(text, char, text, text) to authenticated;
