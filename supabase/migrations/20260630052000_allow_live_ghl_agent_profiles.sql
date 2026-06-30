alter table public.ghl_ai_agent_profiles
  drop constraint if exists ghl_ai_agent_profiles_deployment_status_check;

alter table public.ghl_ai_agent_profiles
  add constraint ghl_ai_agent_profiles_deployment_status_check
  check (deployment_status in ('draft', 'ready_for_review', 'exported', 'connected', 'live', 'needs_update'));
