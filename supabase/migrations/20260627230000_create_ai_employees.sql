create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.ai_employees (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null,
  type text not null,
  status text not null default 'draft' check (status in ('draft', 'active', 'paused')),
  business_name text not null,
  industry text not null,
  business_phone text,
  business_email text,
  website text,
  services_offered text,
  service_area text,
  business_hours text,
  appointment_instructions text,
  escalation_email text,
  escalation_phone text,
  tone text,
  faqs text,
  disqualifying_rules text,
  required_lead_fields jsonb not null default '[]'::jsonb,
  primary_goal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_employee_conversations (
  id uuid primary key default gen_random_uuid(),
  ai_employee_id uuid not null references public.ai_employees(id) on delete cascade,
  owner_id uuid not null,
  visitor_name text,
  visitor_email text,
  visitor_phone text,
  status text not null default 'in_progress',
  mode text not null default 'test',
  transcript jsonb not null default '[]'::jsonb,
  extracted_lead jsonb not null default '{}'::jsonb,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_employee_leads (
  id uuid primary key default gen_random_uuid(),
  ai_employee_id uuid not null references public.ai_employees(id) on delete cascade,
  conversation_id uuid references public.ai_employee_conversations(id) on delete set null,
  owner_id uuid not null,
  name text,
  email text,
  phone text,
  service_needed text,
  preferred_time text,
  status text not null default 'captured',
  source text not null default 'test',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_employee_appointments (
  id uuid primary key default gen_random_uuid(),
  ai_employee_id uuid not null references public.ai_employees(id) on delete cascade,
  conversation_id uuid references public.ai_employee_conversations(id) on delete set null,
  lead_id uuid references public.ai_employee_leads(id) on delete set null,
  owner_id uuid not null,
  requested_time text not null,
  appointment_status text not null default 'requested',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_employee_escalations (
  id uuid primary key default gen_random_uuid(),
  ai_employee_id uuid not null references public.ai_employees(id) on delete cascade,
  conversation_id uuid references public.ai_employee_conversations(id) on delete set null,
  lead_id uuid references public.ai_employee_leads(id) on delete set null,
  owner_id uuid not null,
  reason text not null,
  message text not null,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_employees_owner_id_idx on public.ai_employees(owner_id);
create index if not exists ai_employee_conversations_employee_idx on public.ai_employee_conversations(ai_employee_id);
create index if not exists ai_employee_leads_employee_idx on public.ai_employee_leads(ai_employee_id);
create index if not exists ai_employee_appointments_employee_idx on public.ai_employee_appointments(ai_employee_id);
create index if not exists ai_employee_escalations_employee_idx on public.ai_employee_escalations(ai_employee_id);

drop trigger if exists set_ai_employees_updated_at on public.ai_employees;
create trigger set_ai_employees_updated_at
before update on public.ai_employees
for each row execute function public.set_updated_at();

drop trigger if exists set_ai_employee_conversations_updated_at on public.ai_employee_conversations;
create trigger set_ai_employee_conversations_updated_at
before update on public.ai_employee_conversations
for each row execute function public.set_updated_at();

drop trigger if exists set_ai_employee_leads_updated_at on public.ai_employee_leads;
create trigger set_ai_employee_leads_updated_at
before update on public.ai_employee_leads
for each row execute function public.set_updated_at();

drop trigger if exists set_ai_employee_appointments_updated_at on public.ai_employee_appointments;
create trigger set_ai_employee_appointments_updated_at
before update on public.ai_employee_appointments
for each row execute function public.set_updated_at();

drop trigger if exists set_ai_employee_escalations_updated_at on public.ai_employee_escalations;
create trigger set_ai_employee_escalations_updated_at
before update on public.ai_employee_escalations
for each row execute function public.set_updated_at();

alter table public.ai_employees enable row level security;
alter table public.ai_employee_conversations enable row level security;
alter table public.ai_employee_leads enable row level security;
alter table public.ai_employee_appointments enable row level security;
alter table public.ai_employee_escalations enable row level security;

drop policy if exists "Owners can select ai employees" on public.ai_employees;
create policy "Owners can select ai employees"
on public.ai_employees for select
using (owner_id = auth.uid());

drop policy if exists "Owners can insert ai employees" on public.ai_employees;
create policy "Owners can insert ai employees"
on public.ai_employees for insert
with check (owner_id = auth.uid());

drop policy if exists "Owners can update ai employees" on public.ai_employees;
create policy "Owners can update ai employees"
on public.ai_employees for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Owners can delete ai employees" on public.ai_employees;
create policy "Owners can delete ai employees"
on public.ai_employees for delete
using (owner_id = auth.uid());

drop policy if exists "Owners can select ai employee conversations" on public.ai_employee_conversations;
create policy "Owners can select ai employee conversations"
on public.ai_employee_conversations for select
using (owner_id = auth.uid());

drop policy if exists "Owners can insert ai employee conversations" on public.ai_employee_conversations;
create policy "Owners can insert ai employee conversations"
on public.ai_employee_conversations for insert
with check (owner_id = auth.uid());

drop policy if exists "Owners can update ai employee conversations" on public.ai_employee_conversations;
create policy "Owners can update ai employee conversations"
on public.ai_employee_conversations for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Owners can delete ai employee conversations" on public.ai_employee_conversations;
create policy "Owners can delete ai employee conversations"
on public.ai_employee_conversations for delete
using (owner_id = auth.uid());

drop policy if exists "Owners can select ai employee leads" on public.ai_employee_leads;
create policy "Owners can select ai employee leads"
on public.ai_employee_leads for select
using (owner_id = auth.uid());

drop policy if exists "Owners can insert ai employee leads" on public.ai_employee_leads;
create policy "Owners can insert ai employee leads"
on public.ai_employee_leads for insert
with check (owner_id = auth.uid());

drop policy if exists "Owners can update ai employee leads" on public.ai_employee_leads;
create policy "Owners can update ai employee leads"
on public.ai_employee_leads for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Owners can delete ai employee leads" on public.ai_employee_leads;
create policy "Owners can delete ai employee leads"
on public.ai_employee_leads for delete
using (owner_id = auth.uid());

drop policy if exists "Owners can select ai employee appointments" on public.ai_employee_appointments;
create policy "Owners can select ai employee appointments"
on public.ai_employee_appointments for select
using (owner_id = auth.uid());

drop policy if exists "Owners can insert ai employee appointments" on public.ai_employee_appointments;
create policy "Owners can insert ai employee appointments"
on public.ai_employee_appointments for insert
with check (owner_id = auth.uid());

drop policy if exists "Owners can update ai employee appointments" on public.ai_employee_appointments;
create policy "Owners can update ai employee appointments"
on public.ai_employee_appointments for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Owners can delete ai employee appointments" on public.ai_employee_appointments;
create policy "Owners can delete ai employee appointments"
on public.ai_employee_appointments for delete
using (owner_id = auth.uid());

drop policy if exists "Owners can select ai employee escalations" on public.ai_employee_escalations;
create policy "Owners can select ai employee escalations"
on public.ai_employee_escalations for select
using (owner_id = auth.uid());

drop policy if exists "Owners can insert ai employee escalations" on public.ai_employee_escalations;
create policy "Owners can insert ai employee escalations"
on public.ai_employee_escalations for insert
with check (owner_id = auth.uid());

drop policy if exists "Owners can update ai employee escalations" on public.ai_employee_escalations;
create policy "Owners can update ai employee escalations"
on public.ai_employee_escalations for update
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists "Owners can delete ai employee escalations" on public.ai_employee_escalations;
create policy "Owners can delete ai employee escalations"
on public.ai_employee_escalations for delete
using (owner_id = auth.uid());
