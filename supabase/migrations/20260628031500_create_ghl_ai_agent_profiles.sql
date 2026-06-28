create table if not exists public.ghl_ai_agent_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  workspace_id uuid,
  ai_employee_id uuid not null references public.ai_employees(id) on delete cascade,
  profile_name text not null,
  ghl_location_id text,
  ghl_agent_id text,
  ghl_channel text,
  objective text,
  personality text,
  instructions text,
  knowledge_summary text,
  lead_capture_fields jsonb not null default '[]'::jsonb,
  qualification_rules jsonb not null default '{}'::jsonb,
  escalation_rules jsonb not null default '{}'::jsonb,
  booking_rules jsonb not null default '{}'::jsonb,
  workflow_triggers jsonb not null default '{}'::jsonb,
  pipeline_mapping jsonb not null default '{}'::jsonb,
  calendar_mapping jsonb not null default '{}'::jsonb,
  deployment_status text not null default 'draft'
    check (deployment_status in ('draft', 'ready_for_review', 'exported', 'connected', 'needs_update')),
  last_exported_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ghl_ai_agent_profiles_owner_idx
  on public.ghl_ai_agent_profiles(owner_id);

create index if not exists ghl_ai_agent_profiles_employee_idx
  on public.ghl_ai_agent_profiles(ai_employee_id);

create index if not exists ghl_ai_agent_profiles_status_idx
  on public.ghl_ai_agent_profiles(owner_id, deployment_status);

drop trigger if exists set_ghl_ai_agent_profiles_updated_at on public.ghl_ai_agent_profiles;
create trigger set_ghl_ai_agent_profiles_updated_at
before update on public.ghl_ai_agent_profiles
for each row execute function public.set_updated_at();

alter table public.ghl_ai_agent_profiles enable row level security;

drop policy if exists "Owners can select ghl ai agent profiles" on public.ghl_ai_agent_profiles;
create policy "Owners can select ghl ai agent profiles"
on public.ghl_ai_agent_profiles for select
using (owner_id = (select auth.uid()));

drop policy if exists "Owners can insert ghl ai agent profiles" on public.ghl_ai_agent_profiles;
create policy "Owners can insert ghl ai agent profiles"
on public.ghl_ai_agent_profiles for insert
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can update ghl ai agent profiles" on public.ghl_ai_agent_profiles;
create policy "Owners can update ghl ai agent profiles"
on public.ghl_ai_agent_profiles for update
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can delete ghl ai agent profiles" on public.ghl_ai_agent_profiles;
create policy "Owners can delete ghl ai agent profiles"
on public.ghl_ai_agent_profiles for delete
using (owner_id = (select auth.uid()));
