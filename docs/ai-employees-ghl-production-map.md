# AI Employees GoHighLevel Production Map

This file documents the current production-safe GoHighLevel setup for the One Big Media Company AI Employees app.

## Guardrails

- Existing GoHighLevel resources are production assets.
- Form2Account and FormVeritas resources are preserved and are not reused for generic OBMC AI Employees.
- The app does not seed Alder, Mia, life insurance, or client-specific demo data.
- Live GHL writes happen only from explicit server actions, starting with the lead detail page sync button.
- n8n is the automation layer for setup, intake, purchase, and downstream lead-sync events. Direct GHL writes remain review-first.

## Shared GoHighLevel Resources

- Location: `CEVz3TXL08KjE5pr44t2`
- Pipeline: `Agentic Development - High Ticket Services`
- Default discovery calendar: `OBMC - Discovery Call`
- Support calendar: `OBMC - Support Review`
- Demo calendar: `OBMC - SaaS Demo`

## Agent Mapping

| AI employee | Primary role | Calendar | Pipeline stage | Sync purpose |
| --- | --- | --- | --- | --- |
| OBMC Website Concierge | Capture website visitors and route next steps | OBMC - Discovery Call | New AI Services Lead | Create contact, note, tags, and a new-services opportunity. |
| OBMC Appointment Setter | Convert qualified intent into appointment requests | OBMC - Discovery Call | Strategy Call Scheduled | Create contact, note, tags, and a strategy-call opportunity. |
| OBMC Lead Qualifier | Separate ready buyers from low-fit inquiries | OBMC - SaaS Demo | Qualified Lead | Create contact, note, tags, and a qualified opportunity. |
| OBMC Customer Support Agent | Capture support context and human-review needs | OBMC - Support Review | Follow-Up / Objection Handling | Create contact, support tag, note, and an opportunity only when review is useful. |
| OBMC Follow-up Coordinator | Keep warm leads moving toward the next step | OBMC - Discovery Call | Follow-Up / Objection Handling | Create contact, note, tags, and a follow-up opportunity. |

## Existing OBMC AI Tags

- `obmc ai - employee lead`
- `obmc ai - qualified`
- `obmc ai - appointment requested`
- `obmc ai - follow-up needed`
- `obmc ai - escalation needed`
- `obmc ai - human takeover requested`
- `obmc ai - support request`

## Existing OBMC AI Custom Fields

- `OBMC AI - Lead Intent`
- `OBMC AI - Service Needed`
- `OBMC AI - Conversation Summary`
- `OBMC AI - Follow-up Status`
- `OBMC AI - Preferred Appointment Time`
- `OBMC AI - Urgency`
- `OBMC AI - Qualification Status`
- `OBMC AI - Escalation Needed`
- `OBMC AI - Escalation Reason`
- `OBMC AI - Last AI Touchpoint`

## Workflow Recipes To Build In GHL

Create these as namespaced additive workflows when ready. Do not edit existing workflows unless explicitly approved.

| Workflow | Trigger | Main actions |
| --- | --- | --- |
| OBMC AI - New Lead Captured | Tag added: `obmc ai - employee lead` | Notify owner, assign pipeline if missing, wait for response window. |
| OBMC AI - Qualified Lead | Tag added: `obmc ai - qualified` | Move/check stage, notify sales, prompt appointment setter. |
| OBMC AI - Appointment Requested | Tag added: `obmc ai - appointment requested` | Notify owner, check calendar, send confirmation request. |
| OBMC AI - Follow-up Needed | Tag added: `obmc ai - follow-up needed` | Start follow-up cadence and stop on reply or qualification. |
| OBMC AI - Escalation Needed | Tag added: `obmc ai - escalation needed` | Notify human owner and mark the contact for review. |
| OBMC AI - Human Takeover | Tag added: `obmc ai - human takeover requested` | Stop AI messaging and notify staff. |
| OBMC AI - Support Request | Tag added: `obmc ai - support request` | Route to support review and summarize the conversation note. |

## Current Functional Path

1. Test or live conversation creates an app-side lead.
2. Open the lead detail page.
3. Click `Sync to GoHighLevel`.
4. The app upserts the GHL contact, adds OBMC AI tags, writes a contact note, and creates or updates the mapped opportunity.
5. Sync status, contact ID, opportunity ID, and any error are stored on the lead.
6. If `N8N_WEBHOOK_URL` is configured, the app sends an `ai_employee.lead_synced` event to n8n after successful GHL sync.

## n8n Workflows

- Project: `Ai Employee OBMC`

### Lead Sync Orchestration

- Workflow: `Ai Employee OBMC - Lead Sync Orchestration`
- Workflow ID: `2201wJ74Il6gHEpG`
- Status: active
- Local import package: `docs/n8n-ai-employee-obmc-workflow.json`
- Webhook path: private UUID-style path stored in server env only
- App env vars:
  - `N8N_WEBHOOK_URL`
  - `N8N_WEBHOOK_SECRET` (optional bearer secret)

The workflow receives the app event, normalizes employee/lead/GHL IDs, computes a simple next-step label, and responds with JSON. Add downstream n8n actions such as Slack, email, task creation, or additional CRM routing only after the webhook is active and verified.

### Lead Discovery Agent

- Workflow: `Ai Employee OBMC - Lead Discovery Agent`
- Workflow ID: `p9Xin7MCBBfdEXCH`
- Status: under development / not part of the current build
- Local import package: `docs/n8n-ai-employee-obmc-lead-discovery-agent.json`
- Webhook path: private UUID-style path stored in server env only
- App env vars:
  - `N8N_LEAD_DISCOVERY_WEBHOOK_URL`
  - `LEAD_DISCOVERY_SEARCH_API_KEY` (future compliant search provider)
  - `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` (future Reddit API integration)

The lead discovery agent is parked for a future build. It accepts a business type, service area, optional client name, keywords, and source preferences, but it should not be treated as part of current launch readiness. LinkedIn and Facebook sources are intentionally limited to manual review or official API/import paths; Reddit, forums, and web sources should use public pages, approved APIs, or a compliant search provider. Discovered leads should remain review-first until the app has an approval screen and an explicit GHL contact-create action for this workflow.
