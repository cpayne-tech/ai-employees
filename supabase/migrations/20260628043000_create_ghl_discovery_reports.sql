create table if not exists public.ghl_discovery_reports (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  location_id text,
  account_name text,
  source text not null default 'manual'
    check (source in ('browser', 'api', 'manual', 'import')),
  status text not null default 'in_progress'
    check (status in ('not_started', 'in_progress', 'discovered', 'blocked', 'needs_review')),
  inventory jsonb not null default '[]'::jsonb,
  gap_analysis jsonb not null default '[]'::jsonb,
  blocked_reason text,
  notes text,
  discovered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ghl_discovery_reports_owner_status_idx
  on public.ghl_discovery_reports(owner_id, status);

create index if not exists ghl_discovery_reports_location_idx
  on public.ghl_discovery_reports(owner_id, location_id);

drop trigger if exists set_ghl_discovery_reports_updated_at on public.ghl_discovery_reports;
create trigger set_ghl_discovery_reports_updated_at
before update on public.ghl_discovery_reports
for each row execute function public.set_updated_at();

alter table public.ghl_discovery_reports enable row level security;

drop policy if exists "Owners can select ghl discovery reports" on public.ghl_discovery_reports;
create policy "Owners can select ghl discovery reports"
on public.ghl_discovery_reports for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "Owners can insert ghl discovery reports" on public.ghl_discovery_reports;
create policy "Owners can insert ghl discovery reports"
on public.ghl_discovery_reports for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners can update ghl discovery reports" on public.ghl_discovery_reports;
create policy "Owners can update ghl discovery reports"
on public.ghl_discovery_reports for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "Owners can delete ghl discovery reports" on public.ghl_discovery_reports;
create policy "Owners can delete ghl discovery reports"
on public.ghl_discovery_reports for delete
to authenticated
using ((select auth.uid()) = owner_id);
