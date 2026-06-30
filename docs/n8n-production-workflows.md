# OBMC AI Employees n8n Production Workflows

The current build does not require an LLM provider. The app stores records in Supabase, shows the admin/customer portals, and sends structured events to n8n. n8n is the automation layer that should update GoHighLevel, notify OBMC, and move operational work forward.

Project URL: `https://obmc.app.n8n.cloud/projects/CyrqC4yeTLDeW2U2/workflows`

## Import files

Import these workflows into the `Ai Employee OBMC` n8n project:

- `docs/n8n-ai-employee-obmc-setup-request.json`
- `docs/n8n-ai-employee-obmc-intake-link.json`
- `docs/n8n-ai-employee-obmc-intake-submitted.json`
- `docs/n8n-ai-employee-obmc-purchase-activation.json`
- `docs/n8n-ai-employee-obmc-workflow.json`

Leave `docs/n8n-ai-employee-obmc-lead-discovery-agent.json` inactive. Lead discovery is a future module.

## Required environment variables

- `N8N_WEBHOOK_SECRET`: optional shared bearer token sent to n8n as `Authorization: Bearer <secret>`.
- `N8N_SETUP_REQUEST_WEBHOOK_URL`: receives public setup requests from `/contact`.
- `N8N_INTAKE_LINK_WEBHOOK_URL`: receives admin requests to send or resend a private intake link.
- `N8N_INTAKE_SUBMITTED_WEBHOOK_URL`: receives customer intake submissions from the private portal.
- `N8N_PURCHASE_WEBHOOK_URL`: receives Stripe purchase events after the app stores the purchase record.
- `N8N_WEBHOOK_URL`: receives manual lead-sync events after a lead is synced to GoHighLevel.

After importing each workflow, replace the placeholder webhook path with a private UUID-style path, activate the workflow, copy the production webhook URL, and paste it into the matching Vercel environment variable.

## Workflow 1: Setup Request Created

Trigger: `POST` from `N8N_SETUP_REQUEST_WEBHOOK_URL`

Event name: `ai_employee.setup_request_created`

Minimum n8n actions:

1. Verify the bearer token if `N8N_WEBHOOK_SECRET` is set.
2. Create or update the GoHighLevel contact using email as the primary match key.
3. Add tags such as `OBMC AI Employees`, `Setup Request`, and the selected plan.
4. Create or update a GoHighLevel opportunity in the appropriate setup pipeline.
5. Create an OBMC follow-up task with the customer portal path.
6. Notify OBMC by email, SMS, or internal Slack/notification channel.

Notes:

- The app intentionally creates the Supabase customer record first.
- n8n should not create duplicate customers in the app.
- n8n may email the private intake link only to the submitted customer email.

## Workflow 2: Send Intake Link

Trigger: `POST` from `N8N_INTAKE_LINK_WEBHOOK_URL`

Event name: `ai_employee.send_intake_link`

Minimum n8n actions:

1. Verify the bearer token if configured.
2. Send the private intake link to the customer's stored email address.
3. Optionally send an SMS if a phone number exists and the customer has permissioned text communication.
4. Create or update a GoHighLevel task noting that the intake link was sent.
5. Tag the GoHighLevel contact with `Intake Link Sent`.

## Workflow 3: Customer Intake Submitted

Trigger: `POST` from `N8N_INTAKE_SUBMITTED_WEBHOOK_URL`

Event name: `ai_employee.customer_intake_submitted`

Minimum n8n actions:

1. Verify the bearer token if configured.
2. Update the existing GoHighLevel contact with business details, service area, phone, website, and notes.
3. Add or update custom fields for services, lead fields, appointment rules, escalation contacts, and launch priority.
4. Move the opportunity to an intake received or implementation stage.
5. Create OBMC implementation tasks for role drafting, GHL handoff mapping, and launch review.
6. Notify OBMC that intake is ready for review.

## Workflow 4: Purchase Event Stored

Trigger: `POST` from `N8N_PURCHASE_WEBHOOK_URL`

Event name: `ai_employee.stripe_purchase_event`

Minimum n8n actions:

1. Verify the bearer token if configured.
2. Confirm the purchase status and plan metadata.
3. Create or update the GoHighLevel contact.
4. Add tags for the package, payment source, and purchase status.
5. Create or move the GoHighLevel opportunity to paid setup.
6. Send the customer the next-step intake instructions if your payment flow should trigger it automatically.
7. Notify OBMC that a paid setup is ready to start.

## Workflow 5: Lead Synced

Trigger: `POST` from `N8N_WEBHOOK_URL`

Event name: `ai_employee.lead_synced`

Minimum n8n actions:

1. Verify the bearer token if configured.
2. Check that the app already completed the GoHighLevel lead sync.
3. Route internal notifications or reporting updates.
4. Do not create duplicate contacts unless the payload explicitly indicates the GHL sync failed.

## Future module: lead discovery

Lead discovery and scraping are intentionally under development. Do not activate LinkedIn, Facebook, Reddit, forum, or search scraping workflows until a compliance review, source-specific permissions, and rate-limit rules are defined.
