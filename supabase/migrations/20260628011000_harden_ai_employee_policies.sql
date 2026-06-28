alter function public.set_updated_at() set search_path = public, pg_temp;

create index if not exists ai_employee_leads_conversation_idx
  on public.ai_employee_leads(conversation_id);

create index if not exists ai_employee_appointments_conversation_idx
  on public.ai_employee_appointments(conversation_id);

create index if not exists ai_employee_appointments_lead_idx
  on public.ai_employee_appointments(lead_id);

create index if not exists ai_employee_escalations_conversation_idx
  on public.ai_employee_escalations(conversation_id);

create index if not exists ai_employee_escalations_lead_idx
  on public.ai_employee_escalations(lead_id);

drop policy if exists "Owners can select ai employees" on public.ai_employees;
create policy "Owners can select ai employees"
on public.ai_employees for select
using (owner_id = (select auth.uid()));

drop policy if exists "Owners can insert ai employees" on public.ai_employees;
create policy "Owners can insert ai employees"
on public.ai_employees for insert
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can update ai employees" on public.ai_employees;
create policy "Owners can update ai employees"
on public.ai_employees for update
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can delete ai employees" on public.ai_employees;
create policy "Owners can delete ai employees"
on public.ai_employees for delete
using (owner_id = (select auth.uid()));

drop policy if exists "Owners can select ai employee conversations" on public.ai_employee_conversations;
create policy "Owners can select ai employee conversations"
on public.ai_employee_conversations for select
using (owner_id = (select auth.uid()));

drop policy if exists "Owners can insert ai employee conversations" on public.ai_employee_conversations;
create policy "Owners can insert ai employee conversations"
on public.ai_employee_conversations for insert
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can update ai employee conversations" on public.ai_employee_conversations;
create policy "Owners can update ai employee conversations"
on public.ai_employee_conversations for update
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can delete ai employee conversations" on public.ai_employee_conversations;
create policy "Owners can delete ai employee conversations"
on public.ai_employee_conversations for delete
using (owner_id = (select auth.uid()));

drop policy if exists "Owners can select ai employee leads" on public.ai_employee_leads;
create policy "Owners can select ai employee leads"
on public.ai_employee_leads for select
using (owner_id = (select auth.uid()));

drop policy if exists "Owners can insert ai employee leads" on public.ai_employee_leads;
create policy "Owners can insert ai employee leads"
on public.ai_employee_leads for insert
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can update ai employee leads" on public.ai_employee_leads;
create policy "Owners can update ai employee leads"
on public.ai_employee_leads for update
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can delete ai employee leads" on public.ai_employee_leads;
create policy "Owners can delete ai employee leads"
on public.ai_employee_leads for delete
using (owner_id = (select auth.uid()));

drop policy if exists "Owners can select ai employee appointments" on public.ai_employee_appointments;
create policy "Owners can select ai employee appointments"
on public.ai_employee_appointments for select
using (owner_id = (select auth.uid()));

drop policy if exists "Owners can insert ai employee appointments" on public.ai_employee_appointments;
create policy "Owners can insert ai employee appointments"
on public.ai_employee_appointments for insert
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can update ai employee appointments" on public.ai_employee_appointments;
create policy "Owners can update ai employee appointments"
on public.ai_employee_appointments for update
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can delete ai employee appointments" on public.ai_employee_appointments;
create policy "Owners can delete ai employee appointments"
on public.ai_employee_appointments for delete
using (owner_id = (select auth.uid()));

drop policy if exists "Owners can select ai employee escalations" on public.ai_employee_escalations;
create policy "Owners can select ai employee escalations"
on public.ai_employee_escalations for select
using (owner_id = (select auth.uid()));

drop policy if exists "Owners can insert ai employee escalations" on public.ai_employee_escalations;
create policy "Owners can insert ai employee escalations"
on public.ai_employee_escalations for insert
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can update ai employee escalations" on public.ai_employee_escalations;
create policy "Owners can update ai employee escalations"
on public.ai_employee_escalations for update
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can delete ai employee escalations" on public.ai_employee_escalations;
create policy "Owners can delete ai employee escalations"
on public.ai_employee_escalations for delete
using (owner_id = (select auth.uid()));
