create table if not exists public.ai_employee_customer_intakes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  customer_id uuid not null references public.ai_employee_customers(id) on delete cascade,
  business_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  website text,
  industry text not null,
  service_area text,
  services_offered text not null,
  business_hours text,
  ideal_customer text,
  common_questions text,
  appointment_rules text,
  escalation_contacts text,
  tone_preferences text,
  required_lead_fields text[] not null default array['name', 'phone', 'email']::text[],
  disqualifying_rules text,
  ghl_notes text,
  launch_priority text not null default 'standard'
    check (launch_priority in ('standard', 'soon', 'urgent')),
  submission_status text not null default 'submitted'
    check (submission_status in ('draft', 'submitted', 'reviewed', 'approved')),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists ai_employee_customer_intakes_customer_idx
  on public.ai_employee_customer_intakes(customer_id);

create index if not exists ai_employee_customer_intakes_owner_status_idx
  on public.ai_employee_customer_intakes(owner_id, submission_status, created_at desc);

drop trigger if exists set_ai_employee_customer_intakes_updated_at on public.ai_employee_customer_intakes;
create trigger set_ai_employee_customer_intakes_updated_at
before update on public.ai_employee_customer_intakes
for each row execute function public.set_updated_at();

alter table public.ai_employee_customer_intakes enable row level security;

drop policy if exists "Owners can select ai employee customer intakes" on public.ai_employee_customer_intakes;
create policy "Owners can select ai employee customer intakes"
on public.ai_employee_customer_intakes for select
to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "Owners can insert ai employee customer intakes" on public.ai_employee_customer_intakes;
create policy "Owners can insert ai employee customer intakes"
on public.ai_employee_customer_intakes for insert
to authenticated
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can update ai employee customer intakes" on public.ai_employee_customer_intakes;
create policy "Owners can update ai employee customer intakes"
on public.ai_employee_customer_intakes for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

grant select, insert, update on public.ai_employee_customer_intakes to authenticated;
