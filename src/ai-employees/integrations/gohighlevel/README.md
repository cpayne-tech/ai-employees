# GoHighLevel Integration Preparation

This folder prepares and sends clean server-side payloads for contacts, notes,
tags, and opportunities. Live writes are explicit: the current production path
is the manual lead-detail sync action.

Live sending should only run after:

- `GHL_API_KEY` or `GOHIGHLEVEL_API_KEY` is configured server-side.
- `GHL_LOCATION_ID` or `GOHIGHLEVEL_LOCATION_ID` is configured when using a global location.
- The employee has the relevant calendar, pipeline, stage, and source settings.
- The user explicitly invokes the lead sync action from the app.

Use `pnpm ghl:setup` after a GoHighLevel private integration token is stored in
the environment. The setup script creates only namespaced `OBMC AI - ...` tags
and custom fields, skips existing names, and never deletes or renames production
assets.

Runtime sync:

- `syncAiLeadToGoHighLevel` is the server-side sync entry point.
- It uses `POST /contacts/upsert`, `POST /contacts/:contactId/tags`,
  `POST /contacts/:contactId/notes`, and `POST /opportunities/upsert`.
- It stores the returned GHL contact/opportunity/note IDs on app records.
- It does not run from the internal simulation automatically.

See `docs/ai-employees-ghl-production-map.md` for the current five-agent GHL
resource map and workflow recipes.

n8n is not required for the current AI Employees app. Keep it optional for
advanced cross-app orchestration, external handoffs, or long-running workflows
that are awkward to run inside the Next.js app or native GoHighLevel workflows.
When `N8N_WEBHOOK_URL` is configured, successful manual GHL lead syncs also
send an `ai_employee.lead_synced` event to n8n. n8n failures are logged without
marking the completed GHL sync as failed.

Current status values:

- `not_connected`: no usable credentials.
- `credentials_present`: at least one credential is present, but the setup is incomplete.
- `ready_for_test`: API key and location are present; manual sync is available.
