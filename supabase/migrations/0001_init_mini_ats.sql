create extension if not exists "pgcrypto";

do $$ begin
  create type public.candidate_stage as enum (
    'applied',
    'screening',
    'interview',
    'offer',
    'hired',
    'rejected'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type public.organization_role as enum ('owner', 'admin', 'recruiter');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.organization_role not null default 'recruiter',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.candidates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  stage public.candidate_stage not null default 'applied',
  salary_expectation numeric(12, 2),
  source text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  action text not null,
  performed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidates(id) on delete cascade,
  file_url text not null,
  file_name text not null,
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists candidates_org_idx
  on public.candidates (organization_id, stage, created_at desc);

create index if not exists notes_candidate_idx
  on public.notes (candidate_id, created_at desc);

create index if not exists activity_logs_candidate_idx
  on public.activity_logs (candidate_id, created_at desc);

create index if not exists files_candidate_idx
  on public.files (candidate_id, created_at desc);

create or replace function public.is_member_of_organization(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = org_id
      and om.user_id = auth.uid()
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists candidates_touch_updated_at on public.candidates;
create trigger candidates_touch_updated_at
before update on public.candidates
for each row
execute procedure public.touch_updated_at();

create or replace function public.log_candidate_stage_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.stage is distinct from new.stage then
    insert into public.activity_logs (candidate_id, action, performed_by)
    values (
      new.id,
      format('stage_changed:%s->%s', old.stage, new.stage),
      auth.uid()
    );
  end if;

  return new;
end;
$$;

drop trigger if exists candidates_log_stage_change on public.candidates;
create trigger candidates_log_stage_change
after update on public.candidates
for each row
execute procedure public.log_candidate_stage_change();

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.candidates enable row level security;
alter table public.notes enable row level security;
alter table public.activity_logs enable row level security;
alter table public.files enable row level security;

drop policy if exists "organizations_select_members" on public.organizations;
create policy "organizations_select_members"
  on public.organizations
  for select
  using (public.is_member_of_organization(id));

drop policy if exists "organizations_update_admins" on public.organizations;
create policy "organizations_update_admins"
  on public.organizations
  for update
  using (
    exists (
      select 1
      from public.organization_members om
      where om.organization_id = organizations.id
        and om.user_id = auth.uid()
        and om.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1
      from public.organization_members om
      where om.organization_id = organizations.id
        and om.user_id = auth.uid()
        and om.role in ('owner', 'admin')
    )
  );

drop policy if exists "organization_members_select_members" on public.organization_members;
create policy "organization_members_select_members"
  on public.organization_members
  for select
  using (public.is_member_of_organization(organization_id));

drop policy if exists "organization_members_insert_admins" on public.organization_members;
create policy "organization_members_insert_admins"
  on public.organization_members
  for insert
  with check (
    exists (
      select 1
      from public.organization_members om
      where om.organization_id = organization_members.organization_id
        and om.user_id = auth.uid()
        and om.role in ('owner', 'admin')
    )
  );

drop policy if exists "organization_members_update_admins" on public.organization_members;
create policy "organization_members_update_admins"
  on public.organization_members
  for update
  using (
    exists (
      select 1
      from public.organization_members om
      where om.organization_id = organization_members.organization_id
        and om.user_id = auth.uid()
        and om.role in ('owner', 'admin')
    )
  )
  with check (
    exists (
      select 1
      from public.organization_members om
      where om.organization_id = organization_members.organization_id
        and om.user_id = auth.uid()
        and om.role in ('owner', 'admin')
    )
  );

drop policy if exists "organization_members_delete_admins" on public.organization_members;
create policy "organization_members_delete_admins"
  on public.organization_members
  for delete
  using (
    exists (
      select 1
      from public.organization_members om
      where om.organization_id = organization_members.organization_id
        and om.user_id = auth.uid()
        and om.role in ('owner', 'admin')
    )
  );

drop policy if exists "candidates_all_members" on public.candidates;
create policy "candidates_all_members"
  on public.candidates
  for all
  using (public.is_member_of_organization(organization_id))
  with check (public.is_member_of_organization(organization_id));

drop policy if exists "notes_all_members" on public.notes;
create policy "notes_all_members"
  on public.notes
  for all
  using (
    exists (
      select 1
      from public.candidates c
      where c.id = notes.candidate_id
        and public.is_member_of_organization(c.organization_id)
    )
  )
  with check (
    exists (
      select 1
      from public.candidates c
      where c.id = notes.candidate_id
        and public.is_member_of_organization(c.organization_id)
    )
  );

drop policy if exists "activity_logs_all_members" on public.activity_logs;
create policy "activity_logs_all_members"
  on public.activity_logs
  for all
  using (
    exists (
      select 1
      from public.candidates c
      where c.id = activity_logs.candidate_id
        and public.is_member_of_organization(c.organization_id)
    )
  )
  with check (
    exists (
      select 1
      from public.candidates c
      where c.id = activity_logs.candidate_id
        and public.is_member_of_organization(c.organization_id)
    )
  );

drop policy if exists "files_all_members" on public.files;
create policy "files_all_members"
  on public.files
  for all
  using (
    exists (
      select 1
      from public.candidates c
      where c.id = files.candidate_id
        and public.is_member_of_organization(c.organization_id)
    )
  )
  with check (
    exists (
      select 1
      from public.candidates c
      where c.id = files.candidate_id
        and public.is_member_of_organization(c.organization_id)
    )
  );

insert into storage.buckets (id, name, public)
values ('candidate-files', 'candidate-files', false)
on conflict (id) do nothing;

drop policy if exists "candidate_files_read_members" on storage.objects;
create policy "candidate_files_read_members"
  on storage.objects
  for select
  using (
    bucket_id = 'candidate-files'
    and public.is_member_of_organization(split_part(name, '/', 1)::uuid)
  );

drop policy if exists "candidate_files_insert_members" on storage.objects;
create policy "candidate_files_insert_members"
  on storage.objects
  for insert
  with check (
    bucket_id = 'candidate-files'
    and public.is_member_of_organization(split_part(name, '/', 1)::uuid)
  );

drop policy if exists "candidate_files_update_members" on storage.objects;
create policy "candidate_files_update_members"
  on storage.objects
  for update
  using (
    bucket_id = 'candidate-files'
    and public.is_member_of_organization(split_part(name, '/', 1)::uuid)
  )
  with check (
    bucket_id = 'candidate-files'
    and public.is_member_of_organization(split_part(name, '/', 1)::uuid)
  );

drop policy if exists "candidate_files_delete_members" on storage.objects;
create policy "candidate_files_delete_members"
  on storage.objects
  for delete
  using (
    bucket_id = 'candidate-files'
    and public.is_member_of_organization(split_part(name, '/', 1)::uuid)
  );
