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
import { getLatestGhlDiscoveryReport } from "@/ai-employees/data/ghl-discovery";
import { listGhlAiAgentProfiles } from "@/ai-employees/data/ghl-profiles";
import { aiEmployeeRoleBlueprints } from "@/ai-employees/role-blueprints";

export default async function AiEmployeesDashboardPage() {
  await requireAiEmployeesAccess();
  const [employees, leads, conversations, escalations, ghlProfiles, discovery] = await Promise.all([
    listAiEmployees({ includeArchived: true }),
    listLeads(),
    listConversations(),
    listEscalations({ status: "open" }),
    listGhlAiAgentProfiles(),
    getLatestGhlDiscoveryReport()
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
  const discoveryComplete = discovery?.status === "discovered";
  const setupItems = [
    {
      label: "Simulation provider",
      ready: aiProvider.configured,
      detail: aiProvider.configured ? aiProvider.provider : "Add API key later"
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
      label: "Gap analysis",
      ready: discoveryComplete,
      detail: discoveryComplete ? "Inventory evaluated" : "Blocked until discovery"
    }
  ];
  const setupReadyCount = setupItems.filter((item) => item.ready).length;
  const profilesReady = ghlProfiles.filter((profile) => profile.deployment_status === "ready_for_review").length;
  const profilesExported = ghlProfiles.filter((profile) => profile.deployment_status === "exported").length;
  const profilesConnected = ghlProfiles.filter((profile) => profile.deployment_status === "connected").length;
  const profilesNeedUpdate = ghlProfiles.filter((profile) => profile.deployment_status === "needs_update").length;

  return (
    <AppFrame
      actions={
        <>
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
            Build the operating team first, run read-only GoHighLevel discovery, compare gaps,
            then prepare safe AI Agent configuration packages.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="button" href="/ai-employees/onboarding">Create from wizard</Link>
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
              description="Internal Simulation transcripts appear here before the profile is deployed into GoHighLevel."
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
