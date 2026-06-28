import Link from "next/link";
import { ArrowRight, ReceiptText, UsersRound } from "lucide-react";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { EmptyState } from "@/ai-employees/components/empty-state";
import { StatCard } from "@/ai-employees/components/stat-card";
import { listCustomers } from "@/ai-employees/data/repository";

export default async function AiEmployeeCustomersPage() {
  await requireAiEmployeesAccess();
  const customers = await listCustomers();
  const activeCustomers = customers.filter((customer) =>
    ["paid_setup", "intake_needed", "in_setup", "ready_for_review", "live"].includes(
      customer.lifecycle_status
    )
  );
  const setupTasks = customers.reduce((count, customer) =>
    count + Math.max(customer.total_setup_tasks - customer.completed_setup_tasks, 0), 0);
  const revenueCents = customers.reduce((total, customer) => {
    if (customer.latest_purchase_status === "paid") {
      return total + 1;
    }

    return total;
  }, 0);

  return (
    <AppFrame
      actions={
        <>
          <Link className="button secondary" href="/ai-employees/billing">Billing setup</Link>
          <Link className="button secondary" href="/ai-employees/pricing">Pricing page</Link>
          <Link className="button" href="/ai-employees/customer-preview">Preview portal</Link>
          <Link className="button" href="/ai-employees/customers/new">New customer</Link>
        </>
      }
      eyebrow="Customer operations"
      subtitle="Post-purchase customers, Stripe events, and setup tasks for the managed AI Employee install."
      title="Customers"
    >
      <section className="grid stats-grid" aria-label="Customer setup totals">
        <StatCard detail="Created from paid events or manual review" label="Customers" value={customers.length} />
        <StatCard detail="Currently in setup or live" label="Active Setup" value={activeCustomers.length} />
        <StatCard detail="Remaining onboarding work" label="Open Tasks" value={setupTasks} />
        <StatCard detail="Paid purchase events recorded" label="Paid Events" value={revenueCents} />
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <div className="section-header">
          <div>
            <h2>Customer Queue</h2>
            <p className="muted">New Stripe purchases appear here first, then move through intake, setup, review, and launch.</p>
          </div>
          <UsersRound size={22} />
        </div>

        {customers.length ? (
          <div className="record-list">
            {customers.map((customer) => (
              <Link className="customer-record-row" href={`/ai-employees/customers/${customer.id}`} key={customer.id}>
                <div className="customer-record-main">
                  <strong>{customer.business_name ?? customer.contact_name ?? customer.email ?? "New customer"}</strong>
                  <span>{customer.plan_name ?? customer.plan_id}</span>
                  <p>{customer.email ?? "No email captured yet"}</p>
                </div>
                <div className="customer-record-meta">
                  <ProgressRing
                    completed={customer.completed_setup_tasks}
                    total={customer.total_setup_tasks}
                  />
                  <span className={`setup-badge ${badgeTone(customer.lifecycle_status)}`}>
                    {formatStatus(customer.lifecycle_status)}
                  </span>
                  <ArrowRight size={18} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            description="No customer purchases have been recorded yet. GHL setup links and Stripe webhooks are ready to create customers when a purchase event arrives."
            title="No customers yet"
          />
        )}
      </section>

      <section className="card" style={{ marginTop: 18 }}>
        <div className="section-header">
          <div>
            <h2>Purchase Capture Path</h2>
            <p className="muted">How a buyer becomes a managed setup record.</p>
          </div>
          <ReceiptText size={22} />
        </div>
        <div className="workflow-timeline">
          {[
            "Customer pays the GHL/Stripe setup link.",
            "Stripe sends a signed event to the webhook.",
            "The app creates or updates the customer record.",
            "Default setup tasks are created for the OBMC admin team.",
            "n8n is notified when a purchase webhook URL is configured."
          ].map((item, index) => (
            <div className="workflow-step" key={item}>
              <span className="workflow-index">{index + 1}</span>
              <div>
                <strong>{item}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppFrame>
  );
}

function ProgressRing({
  completed,
  total
}: {
  completed: number;
  total: number;
}) {
  const percent = total ? Math.round((completed / total) * 100) : 0;

  return (
    <span className="progress-pill">
      {percent}% setup
    </span>
  );
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function badgeTone(value: string) {
  if (["live", "paid_setup"].includes(value)) {
    return "ready";
  }
  if (["canceled", "paused"].includes(value)) {
    return "not-connected";
  }

  return "manual";
}
