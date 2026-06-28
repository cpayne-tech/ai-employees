alter table public.ai_employees
  drop constraint if exists ai_employees_status_check;

alter table public.ai_employees
  add constraint ai_employees_status_check
  check (status in ('draft', 'active', 'paused', 'archived'));

alter table public.ai_employees
  add column if not exists ghl_location_id text,
  add column if not exists ghl_calendar_id text,
  add column if not exists ghl_pipeline_id text,
  add column if not exists ghl_opportunity_stage_id text,
  add column if not exists ghl_source_name text;

create index if not exists ai_employees_owner_status_idx
  on public.ai_employees(owner_id, status);

create index if not exists ai_employee_leads_owner_status_idx
  on public.ai_employee_leads(owner_id, status);

create index if not exists ai_employee_conversations_owner_status_idx
  on public.ai_employee_conversations(owner_id, status);

create index if not exists ai_employee_appointments_owner_status_idx
  on public.ai_employee_appointments(owner_id, appointment_status);

create index if not exists ai_employee_escalations_owner_status_idx
  on public.ai_employee_escalations(owner_id, status);
