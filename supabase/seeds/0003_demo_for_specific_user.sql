-- Demo seed bound to a specific user email.
-- Replace the email below before running.

do $$
declare
  v_target_email text := 'replace-with-your-email@example.com';
  v_user_id uuid;
  v_org_id uuid;
begin
  select id into v_user_id
  from auth.users
  where email = v_target_email
  limit 1;

  if v_user_id is null then
    raise exception 'User with email % not found in auth.users.', v_target_email;
  end if;

  delete from public.organizations where name = 'Mini ATS Personal Demo';

  insert into public.organizations (name)
  values ('Mini ATS Personal Demo')
  returning id into v_org_id;

  insert into public.organization_members (organization_id, user_id, role)
  values (v_org_id, v_user_id, 'owner')
  on conflict (organization_id, user_id) do nothing;

  insert into public.candidates (
    organization_id,
    full_name,
    email,
    phone,
    stage,
    salary_expectation,
    source,
    created_by
  ) values
    (v_org_id, 'Paula Ortega', 'paula.ortega@demo.local', '+34 630 300 001', 'applied', 41000, 'LinkedIn', v_user_id),
    (v_org_id, 'Quentin Vega', 'quentin.vega@demo.local', '+34 630 300 002', 'screening', 47000, 'Referral', v_user_id),
    (v_org_id, 'Rocio Flores', 'rocio.flores@demo.local', '+34 630 300 003', 'interview', 52000, 'Indeed', v_user_id),
    (v_org_id, 'Sergio Leon', 'sergio.leon@demo.local', '+34 630 300 004', 'offer', 62000, 'Website', v_user_id),
    (v_org_id, 'Tamara Ruiz', 'tamara.ruiz@demo.local', '+34 630 300 005', 'hired', 68000, 'Referral', v_user_id),
    (v_org_id, 'Uriel Ramos', 'uriel.ramos@demo.local', '+34 630 300 006', 'rejected', 38000, 'LinkedIn', v_user_id);
end $$;
