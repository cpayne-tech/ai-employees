import Link from "next/link";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { DataCard } from "@/ai-employees/components/data-card";
import { EmptyState } from "@/ai-employees/components/empty-state";
import { StatCard } from "@/ai-employees/components/stat-card";
import { StatusBadge } from "@/ai-employees/components/status-badge";
import {
  listAiEmployees,
  listConversations,
  listCustomers,
  listEscalations,
  listLeads
} from "@/ai-employees/data/repository";
import { getLatestGhlDiscoveryReport } from "@/ai-employees/data/ghl-discovery";
import { listGhlAiAgentProfiles } from "@/ai-employees/data/ghl-profiles";
import { getN8nStatus } from "@/ai-employees/integrations/n8n/client";
import { aiEmployeeRoleBlueprints } from "@/ai-employees/role-blueprints";

export default async function AiEmployeesDashboardPage() {
  await requireAiEmployeesAccess();
  const [employees, leads, conversations, escalations, customers, ghlProfiles, discovery] = await Promise.all([
    listAiEmployees({ includeArchived: true }),
    listLeads(),
    listConversations(),
    listEscalations({ status: "open" }),
    listCustomers(),
    listGhlAiAgentProfiles(),
    getLatestGhlDiscoveryReport()
  ]);
  const n8nStatus = getN8nStatus();
  const visibleEmployees = employees.filter((employee) => employee.status !== "archived");
  const activeEmployees = employees.filter((employee) => employee.status === "active");
  const configuredRoles = aiEmployeeRoleBlueprints.filter((blueprint) =>
    visibleEmployees.some((employee) => employee.type === blueprint.type)
  );
  const totalAppointments = employees.reduce(
    (count, employee) => count + employee.total_appointments,
    0
  );
  const discoveryComplete = discovery?.status === "discovered";
  const setupItems = [
    {
      label: "No-LLM test mode",
      ready: true,
      detail: "Ready without OpenAI"
    },
    {
      label: "n8n workflows",
      ready: n8nStatus.setupRequest === "ready" && n8nStatus.intakeSubmitted === "ready",
      detail: `${[
        n8nStatus.setupRequest === "ready" ? "setup" : null,
        n8nStatus.intakeLink === "ready" ? "intake link" : null,
        n8nStatus.intakeSubmitted === "ready" ? "intake" : null,
        n8nStatus.purchaseWebhook === "ready" ? "purchase" : null
      ].filter(Boolean).length} of 4 core webhooks ready`
    },
    {
      label: "GoHighLevel",
      ready: Boolean(process.env.GHL_API_KEY || process.env.GOHIGHLEVEL_API_KEY),
      detail: "Credentials pending"
    },
    {
      label: "GHL discovery",
      ready: discoveryComplete,
      detail: discovery?.status?.replaceAll("_", " ") ?? "not started"
    },
    {
      label: "Five-agent roster",
      ready: configuredRoles.length === 5,
      detail: `${configuredRoles.length} of 5 roles configured`
    },
    {
      label: "Billing workflow",
      ready: discoveryComplete,
      detail: discoveryComplete ? "Ready for manual sale flow" : "Confirm GHL map before live sale"
    }
  ];
  const setupReadyCount = setupItems.filter((item) => item.ready).length;
  const profilesReady = ghlProfiles.filter((profile) => profile.deployment_status === "ready_for_review").length;
  const profilesExported = ghlProfiles.filter((profile) => profile.deployment_status === "exported").length;
  const profilesConnected = ghlProfiles.filter((profile) => profile.deployment_status === "connected").length;
  const profilesNeedUpdate = ghlProfiles.filter((profile) => profile.deployment_status === "needs_update").length;
  const customersNeedingIntake = customers.filter((customer) =>
    ["paid_setup", "intake_needed"].includes(customer.lifecycle_status)
  ).length;
  const openSetupTasks = customers.reduce(
    (count, customer) => count + Math.max(customer.total_setup_tasks - customer.completed_setup_tasks, 0),
    0
  );
  const operatorQueue = [
    {
      count: customersNeedingIntake,
      href: "/ai-employees/customers",
      label: "Send intake link",
      text: "New paid customers need their business intake completed."
    },
    {
      count: 5 - configuredRoles.length,
      href: "/ai-employees/onboarding",
      label: "Create missing AI roles",
      text: "Finish the five-role team before presenting a complete setup."
    },
    {
      count: setupItems.length - setupReadyCount,
      href: "/ai-employees/settings",
      label: "Clear setup blockers",
      text: "Review integration readiness and any pending configuration."
    },
    {
      count: escalations.length,
      href: "/ai-employees/escalations",
      label: "Review escalations",
      text: "Open human-review items need attention before launch."
    }
  ];

  return (
    <AppFrame
      actions={
        <>
          <Link className="button secondary" href="/ai-employees/customer-preview">Customer view</Link>
          <Link className="button secondary" href="/ai-employees/billing">Billing</Link>
          <Link className="button secondary" href="/ai-employees/onboarding">Create from wizard</Link>
          <Link className="button" href="/ai-employees/new">New AI Employee</Link>
        </>
      }
      subtitle="A GoHighLevel-native control center for AI Employees with discovery-first production safety."
      title="Dashboard"
    >
      <section className="dashboard-hero">
        <div className="hero-copy">
          <div className="eyebrow">AI workforce rollout</div>
          <h2>{configuredRoles.length} of 5 roles configured</h2>
          <p>
            Current build focus: configure the five-agent team, preview the customer workspace,
            use no-LLM workflow testing, and keep GoHighLevel production changes review-first.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button" href="/ai-employees/customer-preview">View customer side</Link>
          <Link className="button secondary" href="/ai-employees/billing">Pricing workflow</Link>
          <Link className="button" href="/ai-employees/onboarding">Create from wizard</Link>
          <Link className="button" href="/ai-employees/employees">Manage roster</Link>
        </div>
      </section>

      <section className="product-lane-grid">
        <div className="product-lane ready">
          <span>Current build</span>
          <strong>n8n workflow hooks, customer preview, GHL sync, billing workflow</strong>
        </div>
        <div className="product-lane future">
          <span>Future build</span>
          <strong>Lead discovery, deeper workflow reporting, client self-serve controls</strong>
        </div>
      </section>

      <section className="operator-queue">
        <div className="section-header">
          <div>
            <h2>Operator Queue</h2>
            <p className="muted">Start here. These are the next admin tasks in priority order.</p>
          </div>
          <Link className="button secondary" href="/ai-employees/customers">Open customers</Link>
        </div>
        <div className="operator-queue-grid">
          {operatorQueue.map((item) => (
            <Link className="operator-task-card" href={item.href} key={item.label}>
              <span>{Math.max(item.count, 0)}</span>
              <strong>{item.label}</strong>
              <p>{item.text}</p>
            </Link>
          ))}
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
          detail="Saved native AI Agent profiles"
          label="GHL Profiles"
          value={ghlProfiles.length}
        />
        <StatCard
          detail={`${profilesReady} ready for review`}
          label="Profiles Exported"
          value={profilesExported}
        />
        <StatCard
          detail={`${profilesNeedUpdate} need update`}
          label="Profiles Connected"
          value={profilesConnected}
        />
        <StatCard
          detail="Needs human review"
          label="Open Escalations"
          value={escalations.length}
        />
        <StatCard
          detail="Across all customer setups"
          label="Open Setup Tasks"
          value={openSetupTasks}
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
                    href={employee ? `/ai-employees/${employee.id}` : "/ai-employees/onboarding"}
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
                href="/ai-employees/gohighlevel"
                label="GoHighLevel discovery and gap-analysis items need review"
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
              description="Test conversation transcripts appear here before the profile is deployed into GoHighLevel."
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
