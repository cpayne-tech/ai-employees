create table if not exists public.ai_employee_customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  business_name text,
  contact_name text,
  email text,
  phone text,
  website text,
  plan_id text not null default 'manual',
  plan_name text,
  lifecycle_status text not null default 'new'
    check (lifecycle_status in ('new', 'paid_setup', 'intake_needed', 'in_setup', 'ready_for_review', 'live', 'paused', 'canceled')),
  onboarding_status text not null default 'not_started'
    check (onboarding_status in ('not_started', 'intake_sent', 'intake_received', 'drafting', 'review_ready', 'approved', 'live')),
  portal_token uuid not null default gen_random_uuid(),
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_latest_checkout_session_id text,
  ghl_contact_id text,
  ghl_opportunity_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_employee_customer_purchases (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  customer_id uuid references public.ai_employee_customers(id) on delete set null,
  plan_id text not null default 'manual',
  plan_name text,
  purchase_status text not null default 'received'
    check (purchase_status in ('received', 'paid', 'failed', 'refunded', 'canceled', 'requires_review')),
  payment_source text not null default 'stripe'
    check (payment_source in ('stripe', 'gohighlevel', 'manual')),
  stripe_event_id text,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_invoice_id text,
  stripe_subscription_id text,
  stripe_customer_id text,
  customer_email text,
  customer_name text,
  amount_total integer,
  currency text,
  payment_status text,
  metadata jsonb not null default '{}'::jsonb,
  raw_summary jsonb not null default '{}'::jsonb,
  purchased_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_employee_customer_setup_tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  customer_id uuid not null references public.ai_employee_customers(id) on delete cascade,
  title text not null,
  description text,
  task_status text not null default 'not_started'
    check (task_status in ('not_started', 'in_progress', 'waiting_on_customer', 'waiting_on_obmc', 'done', 'skipped')),
  sort_order integer not null default 0,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_employee_stripe_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  stripe_event_id text not null unique,
  event_type text not null,
  livemode boolean not null default true,
  processed_status text not null default 'processed'
    check (processed_status in ('processed', 'skipped', 'failed')),
  error_message text,
  customer_id uuid references public.ai_employee_customers(id) on delete set null,
  purchase_id uuid references public.ai_employee_customer_purchases(id) on delete set null,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create unique index if not exists ai_employee_customers_owner_email_idx
  on public.ai_employee_customers(owner_id, lower(email))
  where email is not null;

create unique index if not exists ai_employee_customers_portal_token_idx
  on public.ai_employee_customers(portal_token);

create index if not exists ai_employee_customers_owner_status_idx
  on public.ai_employee_customers(owner_id, lifecycle_status, onboarding_status);

create index if not exists ai_employee_customers_stripe_customer_idx
  on public.ai_employee_customers(stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists ai_employee_customer_purchases_owner_created_idx
  on public.ai_employee_customer_purchases(owner_id, created_at desc);

create index if not exists ai_employee_customer_purchases_customer_idx
  on public.ai_employee_customer_purchases(customer_id, created_at desc);

create index if not exists ai_employee_customer_purchases_stripe_session_idx
  on public.ai_employee_customer_purchases(stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists ai_employee_customer_setup_tasks_customer_order_idx
  on public.ai_employee_customer_setup_tasks(customer_id, sort_order);

create index if not exists ai_employee_stripe_events_owner_received_idx
  on public.ai_employee_stripe_events(owner_id, received_at desc);

drop trigger if exists set_ai_employee_customers_updated_at on public.ai_employee_customers;
create trigger set_ai_employee_customers_updated_at
before update on public.ai_employee_customers
for each row execute function public.set_updated_at();

drop trigger if exists set_ai_employee_customer_purchases_updated_at on public.ai_employee_customer_purchases;
create trigger set_ai_employee_customer_purchases_updated_at
before update on public.ai_employee_customer_purchases
for each row execute function public.set_updated_at();

drop trigger if exists set_ai_employee_customer_setup_tasks_updated_at on public.ai_employee_customer_setup_tasks;
create trigger set_ai_employee_customer_setup_tasks_updated_at
before update on public.ai_employee_customer_setup_tasks
for each row execute function public.set_updated_at();

alter table public.ai_employee_customers enable row level security;
alter table public.ai_employee_customer_purchases enable row level security;
alter table public.ai_employee_customer_setup_tasks enable row level security;
alter table public.ai_employee_stripe_events enable row level security;

drop policy if exists "Owners can select ai employee customers" on public.ai_employee_customers;
create policy "Owners can select ai employee customers"
on public.ai_employee_customers for select
to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "Owners can insert ai employee customers" on public.ai_employee_customers;
create policy "Owners can insert ai employee customers"
on public.ai_employee_customers for insert
to authenticated
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can update ai employee customers" on public.ai_employee_customers;
create policy "Owners can update ai employee customers"
on public.ai_employee_customers for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can select ai employee customer purchases" on public.ai_employee_customer_purchases;
create policy "Owners can select ai employee customer purchases"
on public.ai_employee_customer_purchases for select
to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "Owners can select ai employee customer setup tasks" on public.ai_employee_customer_setup_tasks;
create policy "Owners can select ai employee customer setup tasks"
on public.ai_employee_customer_setup_tasks for select
to authenticated
using (owner_id = (select auth.uid()));

drop policy if exists "Owners can update ai employee customer setup tasks" on public.ai_employee_customer_setup_tasks;
create policy "Owners can update ai employee customer setup tasks"
on public.ai_employee_customer_setup_tasks for update
to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can select ai employee stripe events" on public.ai_employee_stripe_events;
create policy "Owners can select ai employee stripe events"
on public.ai_employee_stripe_events for select
to authenticated
using (owner_id = (select auth.uid()));

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.ai_employee_customers to authenticated;
grant select on public.ai_employee_customer_purchases to authenticated;
grant select, update on public.ai_employee_customer_setup_tasks to authenticated;
grant select on public.ai_employee_stripe_events to authenticated;
