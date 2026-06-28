import Link from "next/link";
import { notFound } from "next/navigation";
import { Bot, CalendarCheck, CheckCircle2, ClipboardList, ShieldCheck } from "lucide-react";
import { getCustomerPortalDetail } from "@/ai-employees/data/repository";

export default async function AiEmployeeCustomerPortalPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const detail = await getCustomerPortalDetail(token);

  if (!detail) {
    notFound();
  }

  const { customer, purchases, setupTasks } = detail;
  const { intake } = detail;
  const completedTasks = setupTasks.filter((task) => task.task_status === "done").length;
  const setupPercent = setupTasks.length
    ? Math.round((completedTasks / setupTasks.length) * 100)
    : 0;
  const nextTask = intake
    ? setupTasks.find((task) => !["done", "skipped"].includes(task.task_status))
    : null;

  return (
    <main className="client-portal-shell">
      <nav className="client-portal-nav">
        <Link className="public-brand" href="/ai-employees/pricing">
          <Bot size={22} />
          <span>
            <strong>One Big Media Company</strong>
            AI Employees
          </span>
        </Link>
        <span className={`setup-badge ${customer.lifecycle_status === "live" ? "ready" : "manual"}`}>
          {formatStatus(customer.lifecycle_status)}
        </span>
      </nav>

      <section className="client-portal-hero">
        <div>
          <div className="eyebrow">Customer workspace</div>
          <h1>{customer.business_name ?? "Your AI Employee setup"}</h1>
          <p>
            Your implementation is being configured by OBMC. This workspace shows package details,
            onboarding progress, and what is needed next before launch.
          </p>
        </div>
        <div className="client-progress-panel">
          <span>Setup progress</span>
          <strong>{setupPercent}%</strong>
          <p>{completedTasks} of {setupTasks.length} launch tasks complete</p>
        </div>
      </section>

      <section className="client-portal-grid">
        <div className="client-portal-card">
          <ClipboardList size={22} />
          <span>Current package</span>
          <strong>{customer.plan_name ?? customer.plan_id}</strong>
          <p>{purchases.at(0) ? `${formatMoney(purchases[0].amount_total, purchases[0].currency)} recorded` : "Payment record pending review"}</p>
        </div>
        <div className="client-portal-card">
          <CalendarCheck size={22} />
          <span>Next step</span>
          <strong>{nextTask?.title ?? (intake ? "Ready for launch review" : "Complete business intake")}</strong>
          <p>{nextTask?.description ?? (intake ? "OBMC will confirm activation details before production changes go live." : "Submit your services, rules, FAQs, lead fields, and launch preferences.")}</p>
        </div>
        <div className="client-portal-card">
          <ShieldCheck size={22} />
          <span>Production safety</span>
          <strong>Review-first activation</strong>
          <p>CRM writes, automations, and escalations stay controlled until your setup is approved.</p>
        </div>
      </section>

      <section className="client-portal-grid">
        <div className="client-portal-card action-card">
          <ClipboardList size={22} />
          <span>Business intake</span>
          <strong>{intake ? formatStatus(intake.submission_status) : "Needed"}</strong>
          <p>{intake ? `Submitted ${formatDate(intake.submitted_at)}` : "This is the next required customer step."}</p>
          <Link className="button" href={`/ai-employees/portal/${token}/intake`}>
            {intake ? "Update intake" : "Complete intake"}
          </Link>
        </div>
        <div className="client-portal-card action-card">
          <ShieldCheck size={22} />
          <span>Human review</span>
          <strong>OBMC setup team</strong>
          <p>After intake, OBMC drafts roles, maps GHL, and moves setup tasks forward.</p>
        </div>
        <div className="client-portal-card action-card">
          <CalendarCheck size={22} />
          <span>Launch target</span>
          <strong>{intake ? formatStatus(intake.launch_priority) : "Standard"}</strong>
          <p>{intake?.service_area ?? "Service area pending intake."}</p>
        </div>
      </section>

      <section className="client-portal-layout">
        <div className="client-portal-main">
          <div className="client-section-heading">
            <span className="eyebrow">Launch checklist</span>
            <h2>Implementation progress</h2>
          </div>
          <div className="client-task-list">
            {setupTasks.map((task) => (
              <div className="client-task-row" key={task.id}>
                <div className={task.task_status === "done" ? "client-task-icon done" : "client-task-icon"}>
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <strong>{task.title}</strong>
                  <p>{task.description}</p>
                </div>
                <span className={`setup-badge ${task.task_status === "done" ? "ready" : "manual"}`}>
                  {formatStatus(task.task_status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <aside className="client-portal-side">
          <div className="client-section-heading">
            <span className="eyebrow">Contact</span>
            <h2>Your setup record</h2>
          </div>
          <div className="detail-list single">
            <Detail label="Business" value={customer.business_name} />
            <Detail label="Contact" value={customer.contact_name} />
            <Detail label="Email" value={customer.email} />
            <Detail label="Onboarding" value={formatStatus(customer.onboarding_status)} />
            <Detail label="Intake" value={intake ? formatStatus(intake.submission_status) : "Needed"} />
          </div>
          <div className="client-note">
            <strong>Need something changed?</strong>
            <p>Send updates to your OBMC contact. This portal is a progress view, not an admin editor.</p>
          </div>
        </aside>
      </section>
    </main>
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
      <strong>{value || "Pending"}</strong>
    </div>
  );
}

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function formatMoney(value?: number | null, currency?: string | null) {
  if (typeof value !== "number") {
    return "Payment pending";
  }

  return new Intl.NumberFormat("en-US", {
    currency: (currency ?? "usd").toUpperCase(),
    style: "currency"
  }).format(value / 100);
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleDateString() : "recently";
}
