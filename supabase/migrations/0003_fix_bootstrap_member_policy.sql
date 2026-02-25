-- Fix first-member bootstrap policy for organization_members.
-- Previous policy depended on reading organizations through RLS,
-- which blocks first membership creation for brand-new organizations.

drop policy if exists "organization_members_insert_bootstrap_owner" on public.organization_members;

create policy "organization_members_insert_bootstrap_owner"
  on public.organization_members
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and role = 'owner'
    and not exists (
      select 1
      from public.organization_members om
      where om.organization_id = organization_members.organization_id
    )
  );
