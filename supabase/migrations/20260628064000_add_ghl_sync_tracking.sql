alter table public.ai_employee_leads
  add column if not exists ghl_contact_id text,
  add column if not exists ghl_opportunity_id text,
  add column if not exists ghl_sync_status text not null default 'not_synced'
    check (ghl_sync_status in ('not_synced', 'synced', 'failed')),
  add column if not exists ghl_last_synced_at timestamptz,
  add column if not exists ghl_sync_error text;

alter table public.ai_employee_conversations
  add column if not exists ghl_note_id text,
  add column if not exists ghl_sync_status text not null default 'not_synced'
    check (ghl_sync_status in ('not_synced', 'synced', 'failed')),
  add column if not exists ghl_last_synced_at timestamptz,
  add column if not exists ghl_sync_error text;

create index if not exists ai_employee_leads_ghl_sync_idx
  on public.ai_employee_leads(owner_id, ghl_sync_status);

create index if not exists ai_employee_conversations_ghl_sync_idx
  on public.ai_employee_conversations(owner_id, ghl_sync_status);
