-- Allow authenticated users to bootstrap their first organization safely.

drop policy if exists "organizations_insert_authenticated" on public.organizations;
create policy "organizations_insert_authenticated"
  on public.organizations
  for insert
  to authenticated
  with check (true);

drop policy if exists "organization_members_insert_bootstrap_owner" on public.organization_members;
create policy "organization_members_insert_bootstrap_owner"
  on public.organization_members
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and exists (
      select 1
      from public.organizations o
      where o.id = organization_members.organization_id
    )
    and not exists (
      select 1
      from public.organization_members om
      where om.organization_id = organization_members.organization_id
    )
  );
