import Link from "next/link";
import { getAiProviderStatus } from "@/ai-employees/ai";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { DataCard } from "@/ai-employees/components/data-card";
import { EmptyState } from "@/ai-employees/components/empty-state";
import { StatCard } from "@/ai-employees/components/stat-card";
import { StatusBadge } from "@/ai-employees/components/status-badge";
import {
  listAiEmployees,
  listConversations,
  listEscalations,
  listLeads
} from "@/ai-employees/data/repository";
import { aiEmployeeRoleBlueprints } from "@/ai-employees/role-blueprints";

export default async function AiEmployeesDashboardPage() {
  await requireAiEmployeesAccess();
  const [employees, leads, conversations, escalations] = await Promise.all([
    listAiEmployees({ includeArchived: true }),
    listLeads(),
    listConversations(),
    listEscalations({ status: "open" })
  ]);
  const aiProvider = getAiProviderStatus();
  const visibleEmployees = employees.filter((employee) => employee.status !== "archived");
  const activeEmployees = employees.filter((employee) => employee.status === "active");
  const configuredRoles = aiEmployeeRoleBlueprints.filter((blueprint) =>
    visibleEmployees.some((employee) => employee.type === blueprint.type)
  );
  const totalAppointments = employees.reduce(
    (count, employee) => count + employee.total_appointments,
    0
  );
  const setupItems = [
    {
      label: "AI provider",
      ready: aiProvider.configured,
      detail: aiProvider.configured ? aiProvider.provider : "Add API key later"
    },
    {
      label: "GoHighLevel",
      ready: Boolean(process.env.GHL_API_KEY || process.env.GOHIGHLEVEL_API_KEY),
      detail: "Credentials pending"
    },
    {
      label: "Calendar",
      ready: false,
      detail: "Not connected"
    },
    {
      label: "Public capture",
      ready: false,
      detail: "Widget/API pending"
    }
  ];
  const setupReadyCount = setupItems.filter((item) => item.ready).length;

  return (
    <AppFrame
      actions={<Link className="button" href="/ai-employees/new">New AI Employee</Link>}
      subtitle="A command center for the five AI employees that will run intake, qualification, support, appointments, and follow-up."
      title="Dashboard"
    >
      <section className="dashboard-hero">
        <div className="hero-copy">
          <div className="eyebrow">AI workforce rollout</div>
          <h2>{configuredRoles.length} of 5 roles configured</h2>
          <p>
            Build the operating team first, then connect AI, GoHighLevel, calendar,
            and public lead capture when you are ready.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button" href="/ai-employees/employees">Manage roster</Link>
          <Link className="button secondary" href="/ai-employees/settings">Setup status</Link>
        </div>
      </section>

      <section className="grid stats-grid" aria-label="AI employee totals">
        <StatCard
          detail="Goal is 5 specialized employees"
          label="Roster Progress"
          value={`${configuredRoles.length}/5`}
        />
        <StatCard
          detail={`${visibleEmployees.length} total visible`}
          label="Active Employees"
          value={activeEmployees.length}
        />
        <StatCard
          detail="Captured from test/live conversations"
          label="Leads"
          value={leads.length}
        />
        <StatCard
          detail="Conversation records"
          label="Conversations"
          value={conversations.length}
        />
        <StatCard
          detail="Calendar connection pending"
          label="Appointment Requests"
          value={totalAppointments}
        />
        <StatCard
          detail="Needs human review"
          label="Open Escalations"
          value={escalations.length}
        />
      </section>

      <section className="dashboard-layout">
        <DataCard
          description="Each card represents one planned AI employee. Cards use real employee records when they exist."
          title="Five AI Employee Blueprint"
          viewAllHref="/ai-employees/employees"
        >
          <div className="role-grid">
            {aiEmployeeRoleBlueprints.map((blueprint) => {
              const employee = visibleEmployees.find((item) => item.type === blueprint.type);

              return (
                <div className="role-card" key={blueprint.type}>
                  <div className="role-card-header">
                    <div>
                      <span>{blueprint.label}</span>
                      <strong>{employee?.name ?? "Not created yet"}</strong>
                    </div>
                    {employee ? <StatusBadge status={employee.status} /> : <span className="setup-badge needs-setup">Needed</span>}
                  </div>
                  <p>{blueprint.job}</p>
                  <div className="role-outcome">{blueprint.outcome}</div>
                  <div className="chip-row">
                    {blueprint.setupFocus.slice(0, 3).map((item) => (
                      <span className="mini-chip" key={item}>{item}</span>
                    ))}
                  </div>
                  <Link
                    className="text-link"
                    href={employee ? `/ai-employees/${employee.id}` : "/ai-employees/new"}
                  >
                    {employee ? "Open employee" : "Create this role"}
                  </Link>
                </div>
              );
            })}
          </div>
        </DataCard>

        <div className="side-stack">
          <DataCard
            description={`${setupReadyCount} of ${setupItems.length} launch dependencies are ready.`}
            title="Launch Readiness"
            viewAllHref="/ai-employees/settings"
          >
            <div className="readiness-list">
              {setupItems.map((item) => (
                <div className="readiness-row" key={item.label}>
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.detail}</span>
                  </div>
                  <span className={`setup-badge ${item.ready ? "ready" : "not-connected"}`}>
                    {item.ready ? "Ready" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </DataCard>

          <DataCard
            description="The most important operator-facing items right now."
            title="Needs Attention"
          >
            <div className="attention-list">
              <AttentionItem
                count={5 - configuredRoles.length}
                href="/ai-employees/new"
                label="AI employee roles still need to be created"
              />
              <AttentionItem
                count={setupItems.length - setupReadyCount}
                href="/ai-employees/settings"
                label="launch dependencies still need setup"
              />
              <AttentionItem
                count={escalations.length}
                href="/ai-employees/escalations"
                label="open escalations need review"
              />
            </div>
          </DataCard>
        </div>
      </section>

      <div className="dashboard-grid">
        <DataCard
          description="Newest leads captured by test or live conversations."
          title="Recent Leads"
          viewAllHref="/ai-employees/leads"
        >
          {leads.length ? (
            <div className="record-list">
              {leads.slice(0, 5).map((lead) => (
                <Link className="record-row" href={`/ai-employees/leads/${lead.id}`} key={lead.id}>
                  <div>
                    <strong>{lead.name ?? lead.phone ?? lead.email ?? "Unknown lead"}</strong>
                    <p className="muted">{lead.service_needed ?? "Service not captured"}</p>
                  </div>
                  <span className="record-meta">{lead.status}</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              description="Leads will appear here as test or live conversations capture contact details."
              title="No leads captured"
            />
          )}
        </DataCard>

        <DataCard
          description="Recent transcripts from AI employee interactions."
          title="Recent Conversations"
          viewAllHref="/ai-employees/conversations"
        >
          {conversations.length ? (
            <div className="record-list">
              {conversations.slice(0, 5).map((conversation) => (
                <Link className="record-row" href={`/ai-employees/conversations/${conversation.id}`} key={conversation.id}>
                  <div>
                    <strong>{conversation.visitor_name ?? conversation.extracted_lead.name ?? "Unknown visitor"}</strong>
                    <p className="muted">{conversation.summary ?? "No summary yet"}</p>
                  </div>
                  <span className="record-meta">{conversation.mode}</span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              description="Test chat transcripts and future live conversations will show here."
              title="No conversations yet"
            />
          )}
        </DataCard>
      </div>
    </AppFrame>
  );
}

function AttentionItem({
  count,
  href,
  label
}: {
  count: number;
  href: string;
  label: string;
}) {
  return (
    <Link className="attention-item" href={href}>
      <strong>{count}</strong>
      <span>{label}</span>
    </Link>
  );
}
