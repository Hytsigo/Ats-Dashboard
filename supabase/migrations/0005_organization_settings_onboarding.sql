create table if not exists public.organization_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  onboarding_demo_seen boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.create_organization_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.organization_settings (organization_id)
  values (new.id)
  on conflict (organization_id) do nothing;

  return new;
end;
$$;

drop trigger if exists organizations_create_settings on public.organizations;
create trigger organizations_create_settings
after insert on public.organizations
for each row
execute procedure public.create_organization_settings();

insert into public.organization_settings (organization_id)
select o.id
from public.organizations o
left join public.organization_settings s on s.organization_id = o.id
where s.organization_id is null;

drop trigger if exists organization_settings_touch_updated_at on public.organization_settings;
create trigger organization_settings_touch_updated_at
before update on public.organization_settings
for each row
execute procedure public.touch_updated_at();

alter table public.organization_settings enable row level security;

drop policy if exists "organization_settings_select_members" on public.organization_settings;
create policy "organization_settings_select_members"
  on public.organization_settings
  for select
  using (public.is_member_of_organization(organization_id));

drop policy if exists "organization_settings_update_members" on public.organization_settings;
create policy "organization_settings_update_members"
  on public.organization_settings
  for update
  using (public.is_member_of_organization(organization_id))
  with check (public.is_member_of_organization(organization_id));
