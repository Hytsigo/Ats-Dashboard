-- Mini-ATS demo seed
-- Run this in Supabase SQL Editor after applying migrations.
-- Requirement: at least one authenticated user must exist in auth.users.

do $$
declare
  v_user_id uuid;
  v_org_id uuid;
  v_candidate_1 uuid;
  v_candidate_2 uuid;
  v_candidate_3 uuid;
begin
  select id into v_user_id
  from auth.users
  order by created_at asc
  limit 1;

  if v_user_id is null then
    raise exception 'No users found in auth.users. Create a user first from Supabase Auth.';
  end if;

  delete from public.organizations where name = 'Mini ATS Demo Org';

  insert into public.organizations (name)
  values ('Mini ATS Demo Org')
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
    created_by,
    created_at
  ) values
    (v_org_id, 'Ana Torres', 'ana.torres@example.com', '+34 600 111 111', 'applied', 35000, 'LinkedIn', v_user_id, now() - interval '2 days'),
    (v_org_id, 'Bruno Diaz', 'bruno.diaz@example.com', '+34 600 222 222', 'screening', 42000, 'Referral', v_user_id, now() - interval '6 days'),
    (v_org_id, 'Carla Mendez', 'carla.mendez@example.com', '+34 600 333 333', 'interview', 50000, 'Indeed', v_user_id, now() - interval '10 days'),
    (v_org_id, 'Diego Herrera', 'diego.herrera@example.com', '+34 600 444 444', 'offer', 60000, 'LinkedIn', v_user_id, now() - interval '14 days'),
    (v_org_id, 'Elena Soto', 'elena.soto@example.com', '+34 600 555 555', 'hired', 65000, 'Referral', v_user_id, now() - interval '20 days'),
    (v_org_id, 'Fabian Ruiz', 'fabian.ruiz@example.com', '+34 600 666 666', 'rejected', 38000, 'Website', v_user_id, now() - interval '8 days'),
    (v_org_id, 'Gabriela Cruz', 'gabriela.cruz@example.com', '+34 600 777 777', 'screening', 47000, 'LinkedIn', v_user_id, now() - interval '4 days'),
    (v_org_id, 'Hector Lima', 'hector.lima@example.com', '+34 600 888 888', 'applied', 33000, 'Website', v_user_id, now() - interval '1 day');

  select id into v_candidate_1 from public.candidates where organization_id = v_org_id and email = 'ana.torres@example.com' limit 1;
  select id into v_candidate_2 from public.candidates where organization_id = v_org_id and email = 'carla.mendez@example.com' limit 1;
  select id into v_candidate_3 from public.candidates where organization_id = v_org_id and email = 'diego.herrera@example.com' limit 1;

  insert into public.notes (candidate_id, author_id, content)
  values
    (v_candidate_1, v_user_id, 'Strong frontend portfolio. Follow up this week.'),
    (v_candidate_2, v_user_id, 'Completed technical interview, waiting for feedback.'),
    (v_candidate_3, v_user_id, 'Offer drafted with remote option and learning budget.');

  insert into public.activity_logs (candidate_id, action, performed_by)
  values
    (v_candidate_1, 'candidate_created', v_user_id),
    (v_candidate_1, 'note_added', v_user_id),
    (v_candidate_2, 'stage_changed:screening->interview', v_user_id),
    (v_candidate_3, 'stage_changed:interview->offer', v_user_id);
end $$;
