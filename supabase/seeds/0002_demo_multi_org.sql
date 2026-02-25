-- Multi-tenant demo seed for Mini-ATS
-- Run after migration + 0001_demo_seed.sql.
-- It uses the first 2 users in auth.users when available.

do $$
declare
  v_user_a uuid;
  v_user_b uuid;
  v_org_a uuid;
  v_org_b uuid;
begin
  select id into v_user_a
  from auth.users
  order by created_at asc
  limit 1;

  select id into v_user_b
  from auth.users
  where id <> v_user_a
  order by created_at asc
  limit 1;

  if v_user_a is null then
    raise exception 'No users found in auth.users. Create users first from /auth.';
  end if;

  if v_user_b is null then
    v_user_b := v_user_a;
  end if;

  delete from public.organizations where name in ('Acme Hiring Group', 'Northstar Recruiting');

  insert into public.organizations (name)
  values ('Acme Hiring Group')
  returning id into v_org_a;

  insert into public.organizations (name)
  values ('Northstar Recruiting')
  returning id into v_org_b;

  insert into public.organization_members (organization_id, user_id, role)
  values
    (v_org_a, v_user_a, 'owner'),
    (v_org_b, v_user_b, 'owner')
  on conflict (organization_id, user_id) do nothing;

  insert into public.candidates (
    organization_id,
    full_name,
    email,
    phone,
    stage,
    salary_expectation,
    source,
    created_by,
    created_at
  )
  values
    (v_org_a, 'Irene Martin', 'irene.martin@acme.dev', '+34 610 100 001', 'applied', 39000, 'LinkedIn', v_user_a, now() - interval '3 days'),
    (v_org_a, 'Javier Nunez', 'javier.nunez@acme.dev', '+34 610 100 002', 'interview', 52000, 'Referral', v_user_a, now() - interval '7 days'),
    (v_org_a, 'Laura Campos', 'laura.campos@acme.dev', '+34 610 100 003', 'offer', 61000, 'Website', v_user_a, now() - interval '12 days'),
    (v_org_b, 'Mateo Paredes', 'mateo.paredes@northstar.io', '+34 620 200 001', 'screening', 44000, 'Indeed', v_user_b, now() - interval '2 days'),
    (v_org_b, 'Nora Vidal', 'nora.vidal@northstar.io', '+34 620 200 002', 'hired', 70000, 'LinkedIn', v_user_b, now() - interval '15 days'),
    (v_org_b, 'Oscar Rojas', 'oscar.rojas@northstar.io', '+34 620 200 003', 'rejected', 36000, 'Website', v_user_b, now() - interval '9 days');
end $$;
