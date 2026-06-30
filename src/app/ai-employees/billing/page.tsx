import Link from "next/link";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { billingPlans, billingReadiness, purchaseWorkflow } from "@/ai-employees/billing";
import { AppFrame } from "@/ai-employees/components/app-frame";

type BillingState = "ready" | "manual" | "future";

export default async function AiEmployeesBillingPage() {
  await requireAiEmployeesAccess();
  const stripeConfigured = Boolean(
    process.env.STRIPE_SECRET_KEY &&
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET
  );
  const n8nPurchaseConfigured = Boolean(process.env.N8N_PURCHASE_WEBHOOK_URL);

  return (
    <AppFrame
      actions={
        <>
          <Link className="button secondary" href="/ai-employees/customer-preview">Customer preview</Link>
          <Link className="button secondary" href="/ai-employees/customers">Customers</Link>
          <Link className="button secondary" href="/ai-employees/pricing">Pricing page</Link>
          <Link className="button" href="/ai-employees/onboarding">Start setup</Link>
        </>
      }
      eyebrow="Owner-first billing"
      subtitle="Pricing, purchase readiness, and the post-purchase activation path before public checkout is connected."
      title="Billing"
    >
      <section className="billing-hero">
        <div>
          <div className="eyebrow">Recommended offer</div>
          <h2>Sell the five-agent AI Employee Team first.</h2>
          <p>
            The current build is strongest as a managed setup: you sell the package, collect business intake,
            configure the five AI employees, then activate safe GoHighLevel sync after review.
          </p>
        </div>
        <div className="billing-snapshot">
          <span>Current billing mode</span>
          <strong>{stripeConfigured ? "Stripe purchase capture ready" : "Manual checkout first"}</strong>
          <p>{n8nPurchaseConfigured ? "n8n purchase notification is configured." : "n8n is optional; Stripe records purchases directly."}</p>
        </div>
      </section>

      <section className="pricing-grid" aria-label="Recommended pricing packages">
        {billingPlans.map((plan) => (
          <article className={plan.recommended ? "pricing-card recommended" : "pricing-card"} key={plan.id}>
            <div className="pricing-card-header">
              <div>
                <span>{plan.audience}</span>
                <h2>{plan.name}</h2>
              </div>
              <StatusPill state={plan.currentBuildStatus} />
            </div>
            <div className="price-row">
              <strong>{plan.setupFee}</strong>
              <span>{plan.monthlyFee}</span>
            </div>
            <div className="record-row compact">
              <strong>GHL setup fee link</strong>
              <span>{plan.setupPaymentLinkPath}</span>
            </div>
            <p>{plan.summary}</p>
            <ul className="feature-list">
              {plan.includes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="two-column-grid grid">
        <div className="card">
          <div className="section-header">
            <div>
              <h2>Billing Readiness</h2>
              <p className="muted">What is usable now versus what needs Stripe later.</p>
            </div>
          </div>
          <div className="readiness-list">
            {billingReadiness.map((item) => (
              <div className="readiness-row" key={item.label}>
                <div>
                  <strong>{item.label}</strong>
                  <span>{item.detail}</span>
                </div>
                <StatusPill state={item.status} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <div>
              <h2>Connection Targets</h2>
              <p className="muted">No secret values are shown here.</p>
            </div>
          </div>
          <div className="record-list">
            <ConnectionRow label="Stripe secret key" ready={Boolean(process.env.STRIPE_SECRET_KEY)} />
            <ConnectionRow label="Stripe publishable key" ready={Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)} />
            <ConnectionRow label="Stripe webhook secret" ready={Boolean(process.env.STRIPE_WEBHOOK_SECRET)} />
            <ConnectionRow label="n8n purchase webhook" ready={n8nPurchaseConfigured} optional />
            <ConnectionRow label="Optional AI testing key" ready={Boolean(process.env.OPENAI_API_KEY)} optional />
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <div>
            <h2>After-Purchase Workflow</h2>
            <p className="muted">This is the operating workflow to use before automated checkout is connected.</p>
          </div>
        </div>
        <div className="workflow-timeline">
          {purchaseWorkflow.map((item, index) => (
            <div className="workflow-step" key={item.step}>
              <span className="workflow-index">{index + 1}</span>
              <div>
                <div className="workflow-step-header">
                  <strong>{item.step}</strong>
                  <StatusPill state={item.status} />
                </div>
                <p>{item.detail}</p>
                <small>{item.owner}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <div className="section-header">
          <div>
            <h2>Production Handoff</h2>
            <p className="muted">What happens across GHL, Stripe, this app, and n8n after a customer buys.</p>
          </div>
        </div>
        <div className="handoff-grid">
          <HandoffItem
            title="GoHighLevel payment links"
            status="Ready"
            text="Setup fee links are live and remain the customer-facing purchase entry point."
          />
          <HandoffItem
            title="Stripe webhook"
            status={stripeConfigured ? "Ready" : "Needs setup"}
            text="Signed payment events create customer records, purchase rows, setup tasks, and private portal links."
          />
          <HandoffItem
            title="Customer intake"
            status="Ready"
            text="Customers complete business setup details from their private portal after purchase or manual creation."
          />
          <HandoffItem
            title="n8n purchase notification"
            status={n8nPurchaseConfigured ? "Ready" : "Optional"}
            text="n8n receives a downstream notification only after the app safely stores the purchase record."
          />
        </div>
      </section>
    </AppFrame>
  );
}

function ConnectionRow({
  label,
  optional = false,
  ready
}: {
  label: string;
  optional?: boolean;
  ready: boolean;
}) {
  return (
    <div className="record-row">
      <strong>{label}</strong>
      <StatusPill state={ready ? "ready" : optional ? "future" : "manual"} />
    </div>
  );
}

function StatusPill({ state }: { state: BillingState }) {
  const label = {
    future: "Future",
    manual: "Manual",
    ready: "Ready"
  }[state];

  return <span className={`setup-badge ${state}`}>{label}</span>;
}

function HandoffItem({
  status,
  text,
  title
}: {
  status: string;
  text: string;
  title: string;
}) {
  return (
    <div className="handoff-item">
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
      <span className={`setup-badge ${status === "Ready" ? "ready" : status === "Optional" ? "optional" : "manual"}`}>
        {status}
      </span>
    </div>
  );
}
