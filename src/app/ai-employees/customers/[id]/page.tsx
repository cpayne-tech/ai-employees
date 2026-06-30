import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import {
  sendCustomerIntakeLinkAction,
  updateCustomerLifecycleAction,
  updateCustomerSetupTaskAction
} from "@/ai-employees/customer-actions";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { EmptyState } from "@/ai-employees/components/empty-state";
import { getCustomerDetail } from "@/ai-employees/data/repository";
import { getN8nStatus } from "@/ai-employees/integrations/n8n/client";
import type {
  AiEmployeeCustomerLifecycleStatus,
  AiEmployeeCustomerOnboardingStatus,
  AiEmployeeCustomerSetupTaskStatus
} from "@/ai-employees/types";

const lifecycleStatuses: AiEmployeeCustomerLifecycleStatus[] = [
  "new",
  "paid_setup",
  "intake_needed",
  "in_setup",
  "ready_for_review",
  "live",
  "paused",
  "canceled"
];

const onboardingStatuses: AiEmployeeCustomerOnboardingStatus[] = [
  "not_started",
  "intake_sent",
  "intake_received",
  "drafting",
  "review_ready",
  "approved",
  "live"
];

const taskStatuses: AiEmployeeCustomerSetupTaskStatus[] = [
  "not_started",
  "in_progress",
  "waiting_on_customer",
  "waiting_on_obmc",
  "done",
  "skipped"
];

export default async function AiEmployeeCustomerDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAiEmployeesAccess();
  const { id } = await params;
  const detail = await getCustomerDetail(id);

  if (!detail) {
    notFound();
  }

  const { customer, purchases, setupTasks, stripeEvents } = detail;
  const n8nStatus = getN8nStatus();
  const portalPath = `/ai-employees/portal/${customer.portal_token}`;
  const setupPercent = customer.total_setup_tasks
    ? Math.round((customer.completed_setup_tasks / customer.total_setup_tasks) * 100)
    : 0;

  return (
    <AppFrame
      actions={
        <>
          <Link className="button secondary" href="/ai-employees/customers">All customers</Link>
          <Link className="button secondary" href={portalPath}>
            Customer portal
            <ExternalLink size={16} />
          </Link>
        </>
      }
      eyebrow="Customer setup"
      subtitle={`${customer.plan_name ?? customer.plan_id} • ${customer.email ?? "email pending"}`}
      title={customer.business_name ?? customer.contact_name ?? "Customer"}
    >
      <section className="customer-detail-hero">
        <div>
          <div className="eyebrow">Setup progress</div>
          <h2>{setupPercent}% complete</h2>
          <p>
            Track the managed implementation from payment confirmation through intake, AI employee drafting,
            GoHighLevel mapping, review, and activation.
          </p>
        </div>
        <div className="customer-status-panel">
          <span className={`setup-badge ${badgeTone(customer.lifecycle_status)}`}>
            {formatStatus(customer.lifecycle_status)}
          </span>
          <strong>{formatStatus(customer.onboarding_status)}</strong>
          <p>Portal: {portalPath}</p>
        </div>
      </section>

      <section className="settings-grid">
        <div className="grid">
          <section className="card">
            <div className="section-header">
              <div>
                <h2>Business Intake</h2>
                <p className="muted">Customer-submitted setup details for role configuration.</p>
              </div>
              <span className={`setup-badge ${detail.intake ? "ready" : "manual"}`}>
                {detail.intake ? formatStatus(detail.intake.submission_status) : "Needed"}
              </span>
            </div>
            {detail.intake ? (
              <div className="intake-review-grid">
                <Detail label="Industry" value={detail.intake.industry} />
                <Detail label="Service area" value={detail.intake.service_area} />
                <Detail label="Launch priority" value={formatStatus(detail.intake.launch_priority)} />
                <Detail label="Required fields" value={detail.intake.required_lead_fields.join(", ")} />
                <Detail label="Services" value={detail.intake.services_offered} />
                <Detail label="Hours" value={detail.intake.business_hours} />
                <Detail label="Ideal customer" value={detail.intake.ideal_customer} />
                <Detail label="Common questions" value={detail.intake.common_questions} />
                <Detail label="Appointment rules" value={detail.intake.appointment_rules} />
                <Detail label="Escalation contacts" value={detail.intake.escalation_contacts} />
                <Detail label="Tone" value={detail.intake.tone_preferences} />
                <Detail label="Disqualifying rules" value={detail.intake.disqualifying_rules} />
                <Detail label="GHL notes" value={detail.intake.ghl_notes} />
              </div>
            ) : (
              <div className="setup-note">
                Customer intake has not been submitted yet. Send the customer portal link and ask them to complete the intake form.
              </div>
            )}
          </section>

          <section className="card">
            <div className="section-header">
              <div>
                <h2>Customer Status</h2>
                <p className="muted">Admin-only controls for the customer lifecycle.</p>
              </div>
            </div>
            <form action={updateCustomerLifecycleAction.bind(null, customer.id)} className="form-grid">
              <label className="field">
                Lifecycle status
                <select name="lifecycle_status" defaultValue={customer.lifecycle_status}>
                  {lifecycleStatuses.map((status) => (
                    <option key={status} value={status}>{formatStatus(status)}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                Onboarding status
                <select name="onboarding_status" defaultValue={customer.onboarding_status}>
                  {onboardingStatuses.map((status) => (
                    <option key={status} value={status}>{formatStatus(status)}</option>
                  ))}
                </select>
              </label>
              <div className="field full">
                <button className="button" type="submit">Update status</button>
              </div>
            </form>
          </section>

          <section className="card">
            <div className="section-header">
              <div>
                <h2>Intake Delivery</h2>
                <p className="muted">Trigger n8n to send or resend the private intake link.</p>
              </div>
              <span className={`setup-badge ${n8nStatus.intakeLink === "ready" ? "ready" : "needs-setup"}`}>
                {n8nStatus.intakeLink === "ready" ? "n8n ready" : "webhook needed"}
              </span>
            </div>
            <form action={sendCustomerIntakeLinkAction.bind(null, customer.id)} className="setup-note">
              <strong>{portalPath}</strong>
              <p>
                n8n should email this private link to {customer.email ?? "the customer"} and create a GHL follow-up task.
              </p>
              <button className="button" disabled={n8nStatus.intakeLink !== "ready"} type="submit">
                Send intake link with n8n
              </button>
            </form>
          </section>

          <section className="card">
            <div className="section-header">
              <div>
                <h2>Setup Tasks</h2>
                <p className="muted">The operational checklist created after purchase.</p>
              </div>
            </div>
            <div className="setup-task-list">
              {setupTasks.map((task) => (
                <form
                  action={updateCustomerSetupTaskAction.bind(null, customer.id, task.id)}
                  className="setup-task-row"
                  key={task.id}
                >
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.description}</p>
                    <small>{task.completed_at ? `Completed ${formatDate(task.completed_at)}` : "Open task"}</small>
                  </div>
                  <select name="task_status" defaultValue={task.task_status}>
                    {taskStatuses.map((status) => (
                      <option key={status} value={status}>{formatStatus(status)}</option>
                    ))}
                  </select>
                  <button className="button secondary" type="submit">Save</button>
                </form>
              ))}
            </div>
          </section>
        </div>

        <div className="settings-stack">
          <section className="card">
            <div className="section-header">
              <div>
                <h2>Customer Details</h2>
                <p className="muted">Values captured from Stripe/GHL and ready for onboarding.</p>
              </div>
            </div>
            <div className="detail-list single">
              <Detail label="Business" value={customer.business_name} />
              <Detail label="Contact" value={customer.contact_name} />
              <Detail label="Email" value={customer.email} />
              <Detail label="Plan" value={customer.plan_name ?? customer.plan_id} />
              <Detail label="Stripe customer" value={customer.stripe_customer_id} />
              <Detail label="Subscription" value={customer.stripe_subscription_id} />
            </div>
          </section>

          <section className="card">
            <div className="section-header">
              <div>
                <h2>Purchases</h2>
                <p className="muted">Stored payment records from signed webhook events.</p>
              </div>
            </div>
            {purchases.length ? (
              <div className="record-list">
                {purchases.map((purchase) => (
                  <div className="record-row" key={purchase.id}>
                    <div>
                      <strong>{purchase.plan_name ?? purchase.plan_id}</strong>
                      <p className="muted">{formatMoney(purchase.amount_total, purchase.currency)} • {formatDate(purchase.purchased_at)}</p>
                    </div>
                    <span className={`setup-badge ${badgeTone(purchase.purchase_status)}`}>
                      {formatStatus(purchase.purchase_status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                description="No purchase rows are linked to this customer yet."
                title="No purchases"
              />
            )}
          </section>

          <section className="card">
            <div className="section-header">
              <div>
                <h2>Stripe Events</h2>
                <p className="muted">Webhook processing history.</p>
              </div>
            </div>
            {stripeEvents.length ? (
              <div className="record-list">
                {stripeEvents.slice(0, 6).map((event) => (
                  <div className="record-row" key={event.id}>
                    <div>
                      <strong>{event.event_type}</strong>
                      <p className="muted">{event.stripe_event_id}</p>
                    </div>
                    <span className={`setup-badge ${badgeTone(event.processed_status)}`}>
                      {formatStatus(event.processed_status)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                description="Stripe event rows appear after the webhook receives a supported event."
                title="No webhook events"
              />
            )}
          </section>
        </div>
      </section>
    </AppFrame>
  );
}

function Detail({
  label,
  value
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || "Not captured"}</strong>
    </div>
  );
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : "No date";
}

function formatMoney(value?: number | null, currency?: string | null) {
  if (typeof value !== "number") {
    return "Amount pending";
  }

  return new Intl.NumberFormat("en-US", {
    currency: (currency ?? "usd").toUpperCase(),
    style: "currency"
  }).format(value / 100);
}

function badgeTone(value: string) {
  if (["live", "paid_setup", "paid", "processed", "done"].includes(value)) {
    return "ready";
  }
  if (["failed", "canceled", "paused"].includes(value)) {
    return "not-connected";
  }

  return "manual";
}
