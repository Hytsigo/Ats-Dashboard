-- Creates an organization + owner membership in one atomic operation.
-- This bypasses client-side RLS insert issues for first-time users.

create or replace function public.bootstrap_organization(org_name text default 'My Company')
returns public.organizations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_organization public.organizations;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'You must be authenticated to create an organization.';
  end if;

  insert into public.organizations (name)
  values (coalesce(nullif(trim(org_name), ''), 'My Company'))
  returning * into v_organization;

  insert into public.organization_members (organization_id, user_id, role)
  values (v_organization.id, v_user_id, 'owner');

  return v_organization;
end;
$$;

revoke all on function public.bootstrap_organization(text) from public;
grant execute on function public.bootstrap_organization(text) to authenticated;
