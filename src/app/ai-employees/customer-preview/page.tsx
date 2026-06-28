import Link from "next/link";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { EmptyState } from "@/ai-employees/components/empty-state";
import { StatCard } from "@/ai-employees/components/stat-card";
import { StatusBadge } from "@/ai-employees/components/status-badge";
import { listAiEmployees, listAppointments, listCustomers, listEscalations, listLeads } from "@/ai-employees/data/repository";
import { aiEmployeeRoleBlueprints } from "@/ai-employees/role-blueprints";

export default async function CustomerPreviewPage() {
  await requireAiEmployeesAccess();
  const [employees, leads, appointments, escalations, customers] = await Promise.all([
    listAiEmployees({ includeArchived: false }),
    listLeads(),
    listAppointments(),
    listEscalations({ status: "open" }),
    listCustomers()
  ]);
  const activeEmployees = employees.filter((employee) => employee.status === "active");
  const configuredRoles = aiEmployeeRoleBlueprints.filter((blueprint) =>
    employees.some((employee) => employee.type === blueprint.type)
  );
  const setupPercent = Math.round((configuredRoles.length / aiEmployeeRoleBlueprints.length) * 100);

  return (
    <AppFrame
      actions={
        <>
          <Link className="button secondary" href="/ai-employees">Admin dashboard</Link>
          <Link className="button secondary" href="/ai-employees/pricing">Pricing page</Link>
          <Link className="button secondary" href="/ai-employees/customers">Customers</Link>
          <Link className="button" href="/ai-employees/billing">Billing setup</Link>
        </>
      }
      eyebrow="Customer-side preview"
      subtitle="A preview of what clients should see after purchase and onboarding."
      title="Client Workspace"
    >
      <section className="customer-hero">
        <div>
          <div className="eyebrow">AI Employee Workspace</div>
          <h2>Your AI team setup is {setupPercent}% complete.</h2>
          <p>
            This view is intentionally simpler than the admin side: customers should see their AI team,
            captured opportunities, appointment requests, and the next launch task.
          </p>
        </div>
        <div className="customer-next-action">
          <span>Next action</span>
          <strong>{configuredRoles.length < 5 ? "Finish AI employee setup" : "Review production activation"}</strong>
          <p>{configuredRoles.length}/5 AI employee roles are configured.</p>
        </div>
      </section>

      <section className="card" style={{ marginBottom: 18 }}>
        <div className="section-header">
          <div>
            <h2>{customers.length ? "Real portals are available" : "This is a generic preview"}</h2>
            <p className="muted">
              {customers.length
                ? "Use the real customer portal links below for customer-specific setup status and intake."
                : "Create a customer manually or wait for a Stripe purchase event to generate a private customer portal."}
            </p>
          </div>
          <Link className="button" href={customers.length ? "/ai-employees/customers" : "/ai-employees/customers/new"}>
            {customers.length ? "Manage customers" : "Create customer"}
          </Link>
        </div>
      </section>

      {customers.length ? (
        <section className="card" style={{ marginBottom: 18 }}>
          <div className="section-header">
            <div>
              <h2>Real Customer Portals</h2>
              <p className="muted">Token-based customer views created from purchase records.</p>
            </div>
          </div>
          <div className="record-list">
            {customers.slice(0, 4).map((customer) => (
              <Link className="record-row" href={`/ai-employees/portal/${customer.portal_token}`} key={customer.id}>
                <div>
                  <strong>{customer.business_name ?? customer.contact_name ?? customer.email ?? "Customer"}</strong>
                  <p className="muted">{customer.plan_name ?? customer.plan_id}</p>
                </div>
                <span className="record-meta">{customer.completed_setup_tasks}/{customer.total_setup_tasks} tasks</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid stats-grid compact-stats" aria-label="Customer workspace totals">
        <StatCard detail="Configured roles" label="AI Team" value={`${configuredRoles.length}/5`} />
        <StatCard detail="Ready for traffic" label="Active Agents" value={activeEmployees.length} />
        <StatCard detail="Captured so far" label="Leads" value={leads.length} />
        <StatCard detail="Requested follow-ups" label="Appointments" value={appointments.length} />
        <StatCard detail="Needs human review" label="Escalations" value={escalations.length} />
      </section>

      <section className="customer-layout">
        <div className="card">
          <div className="section-header">
            <div>
              <h2>Your AI Employees</h2>
              <p className="muted">The five roles customers are buying and reviewing.</p>
            </div>
          </div>
          <div className="customer-agent-list">
            {aiEmployeeRoleBlueprints.map((blueprint) => {
              const employee = employees.find((item) => item.type === blueprint.type);

              return (
                <div className="customer-agent-row" key={blueprint.type}>
                  <div>
                    <span>{blueprint.label}</span>
                    <strong>{employee?.name ?? "Waiting for setup"}</strong>
                    <p>{blueprint.outcome}</p>
                  </div>
                  {employee ? <StatusBadge status={employee.status} /> : <span className="setup-badge manual">Setup</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="side-stack">
          <div className="card">
            <div className="section-header">
              <div>
                <h2>Launch Checklist</h2>
                <p className="muted">Plain-language customer progress.</p>
              </div>
            </div>
            <ul className="checklist">
              <CustomerChecklistItem ready={configuredRoles.length >= 1} text="Business intake received" />
              <CustomerChecklistItem ready={configuredRoles.length >= 5} text="Five AI employee roles configured" />
              <CustomerChecklistItem ready={activeEmployees.length >= 1} text="At least one agent activated" />
              <CustomerChecklistItem ready={appointments.length > 0 || leads.length > 0} text="First lead or appointment captured" />
              <CustomerChecklistItem ready={false} text="Production automation approved" future />
            </ul>
          </div>

          <div className="card">
            <div className="section-header">
              <div>
                <h2>Support Summary</h2>
                <p className="muted">What a customer should understand at a glance.</p>
              </div>
            </div>
            <div className="support-summary">
              <strong>Human review stays in control.</strong>
              <p>
                AI employees can capture, qualify, and summarize. Production CRM writes and workflow changes remain review-first until the client approves launch.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="card">
          <div className="section-header">
            <div>
              <h2>Recent Leads</h2>
              <p className="muted">Customer-facing version of lead activity.</p>
            </div>
          </div>
          {leads.length ? (
            <div className="record-list">
              {leads.slice(0, 4).map((lead) => (
                <div className="record-row" key={lead.id}>
                  <div>
                    <strong>{lead.name ?? lead.email ?? lead.phone ?? "Unknown lead"}</strong>
                    <p className="muted">{lead.service_needed ?? "Service not captured yet"}</p>
                  </div>
                  <span className="record-meta">{lead.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              description="Once the AI team captures a lead, the customer should see it here without needing admin controls."
              title="No customer leads yet"
            />
          )}
        </div>

        <div className="card">
          <div className="section-header">
            <div>
              <h2>Appointment Requests</h2>
              <p className="muted">Simple customer-facing appointment queue.</p>
            </div>
          </div>
          {appointments.length ? (
            <div className="record-list">
              {appointments.slice(0, 4).map((appointment) => (
                <div className="record-row" key={appointment.id}>
                  <div>
                    <strong>{appointment.requested_time}</strong>
                    <p className="muted">{appointment.notes ?? "Awaiting confirmation"}</p>
                  </div>
                  <span className="record-meta">{appointment.appointment_status}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              description="Requested bookings will appear here after the receptionist or follow-up agent captures a time."
              title="No appointment requests"
            />
          )}
        </div>
      </section>
    </AppFrame>
  );
}

function CustomerChecklistItem({
  future = false,
  ready,
  text
}: {
  future?: boolean;
  ready: boolean;
  text: string;
}) {
  return (
    <li>
      <span>{text}</span>
      <span className={`setup-badge ${ready ? "ready" : future ? "future" : "manual"}`}>
        {ready ? "Done" : future ? "Later" : "Next"}
      </span>
    </li>
  );
}
