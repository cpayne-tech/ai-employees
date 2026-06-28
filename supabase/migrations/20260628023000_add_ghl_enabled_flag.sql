alter table public.ai_employees
  add column if not exists ghl_enabled boolean not null default false;
