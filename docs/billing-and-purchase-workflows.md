# AI Employees Billing and Purchase Workflow

This document captures the current owner-first billing plan for the OBMC AI Employees platform.

## Current Build Decision

- The app must work without `OPENAI_API_KEY`.
- n8n is the current automation layer for setup, intake, purchase, and handoff workflows.
- Lead generation and external lead discovery are under development and are not part of the current build.
- The current build focuses on customer onboarding, five AI employee setup, GoHighLevel mapping, manual production-safe sync, and customer-facing workspace visibility.

## Recommended Pricing

| Plan | Setup | Monthly | Best fit |
| --- | ---: | ---: | --- |
| Starter AI Employee | $497 | $297/mo | One focused intake/support agent. |
| AI Employee Team | $1,500 | $997/mo | Recommended core offer: five-role AI employee system. |
| Automation Partner | $3,000 | $1,997/mo | Full AI team plus custom workflow and integration support. |

## GoHighLevel SaaS Plans

Created in GoHighLevel SaaS Configurator under `V2 One Big Media Company` and category `Ai Agents`.

| Plan | Product ID | Monthly | Annual | Trial | Credits |
| --- | --- | ---: | ---: | ---: | ---: |
| Starter AI Employee | `6a40aec8b393575dc95bf093` | $297 | $2,970 | 0 days | $0 |
| AI Employee Team | `6a40af23b3935784345bfa01` | $997 | $9,970 | 0 days | $0 |
| Automation Partner | `6a40af4eb39357166e5bfffb` | $1,997 | $19,970 | 0 days | $0 |

The GHL SaaS plan form supports recurring pricing directly. Setup fees are handled with separate one-time GHL products and active payment links.

## GoHighLevel Setup Fee Links

Created in GoHighLevel Payments as one-time setup products.

| Plan | Setup Product ID | Setup Payment Link Path | Setup |
| --- | --- | --- | ---: |
| Starter AI Employee | `6a40b2fe6ad3431dd323219a` | `/6a40b35c390a6e280643b034` | $497 |
| AI Employee Team | `6a40b3076ad3432e7d232228` | `/6a40b3ec9b12592b36824e77` | $1,500 |
| Automation Partner | `6a40b3136ad34355f6232403` | `/6a40b42a9b12592b36824e78` | $3,000 |

The app builds customer-facing setup fee URLs from `GHL_PAYMENT_LINK_BASE_URL` plus the path above. Current base URL:

- `https://link.fastpaydirect.com/payment-link`

Current managed sale flow:

1. Collect the one-time setup fee with the matching setup fee payment link.
2. Send the matching GHL SaaS subscription sale link for the recurring plan.
3. Move to intake and implementation after both payment steps are confirmed.

A bundled one-click checkout can be added later with custom Stripe checkout or a GHL funnel/order form after payment keys, products, webhook secrets, and ownership rules are finalized.

## Purchase Activation Workflow

1. Customer selects package and pays.
2. Customer completes business intake.
3. OBMC creates the five AI employees through onboarding.
4. OBMC runs no-LLM workflow tests and adjusts FAQs, lead fields, appointment rules, handoff rules, and escalation rules.
5. OBMC maps the AI employees to existing GoHighLevel calendars, pipeline stages, tags, and custom fields.
6. OBMC generates GoHighLevel profile/export packages.
7. OBMC activates production-safe manual sync and only adds workflows after review.
8. Customer sees the client workspace for AI employee status, leads, appointment requests, and launch progress.

## Stripe/n8n Connections

Add or verify these env vars for payment and setup automation:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `N8N_SETUP_REQUEST_WEBHOOK_URL`
- `N8N_INTAKE_LINK_WEBHOOK_URL`
- `N8N_INTAKE_SUBMITTED_WEBHOOK_URL`
- `N8N_PURCHASE_WEBHOOK_URL`

Local workflow template:

- `docs/n8n-ai-employee-obmc-purchase-activation.json`

n8n production workflow:

- Project: `Ai Employee OBMC`
- Workflow: `Ai Employee OBMC - Purchase Activation`
- Workflow ID: `AEPAT9UCpleI0acY`
- Status: active
- Webhook path: private UUID-style path stored in `N8N_PURCHASE_WEBHOOK_URL`

Suggested checkout event flow:

1. Stripe `checkout.session.completed`.
2. Verify webhook signature server-side.
3. Create or update the customer workspace.
4. Store plan, subscription, and customer IDs.
5. Notify the n8n purchase workflow.
6. Start the onboarding checklist.

Stripe webhook endpoint:

- `https://ai-employees-gamma.vercel.app/api/stripe/webhook`
- Stripe endpoint ID: `we_1TnBvyRaRrlHSu4LsgYB57Gm`
- Status: enabled

Supported Stripe events:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

Do not create public checkout until multi-client ownership, plan storage, and webhook verification are implemented.
