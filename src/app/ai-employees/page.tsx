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
  listEscalations,
  listLeads
} from "@/ai-employees/data/repository";

export default async function AiEmployeesDashboardPage() {
  await requireAiEmployeesAccess();
  const [employees, leads, conversations, escalations] = await Promise.all([
    listAiEmployees({ includeArchived: true }),
    listLeads(),
    listConversations(),
    listEscalations({ status: "open" })
  ]);

  const visibleEmployees = employees.filter((employee) => employee.status !== "archived");
  const totals = employees.reduce(
    (summary, employee) => ({
      appointments: summary.appointments + employee.total_appointments,
      conversations: summary.conversations + employee.total_conversations,
      escalations: summary.escalations + employee.total_escalations,
      leads: summary.leads + employee.total_leads
    }),
    { appointments: 0, conversations: 0, escalations: 0, leads: 0 }
  );

  return (
    <AppFrame
      actions={<Link className="button" href="/ai-employees/new">New AI Employee</Link>}
      subtitle="Manage AI employees, captured leads, conversations, and automation activity."
      title="Dashboard"
    >
      <section className="grid stats-grid" aria-label="AI employee totals">
        <StatCard label="Total AI Employees" value={visibleEmployees.length} />
        <StatCard label="Active AI Employees" value={employees.filter((employee) => employee.status === "active").length} />
        <StatCard label="Total Leads" value={totals.leads} />
        <StatCard label="Total Conversations" value={totals.conversations} />
        <StatCard label="Appointment Requests" value={totals.appointments} />
        <StatCard label="Open Escalations" value={escalations.length} />
      </section>

      <div className="dashboard-grid">
        <DataCard
          description="Most recently created or updated employee records."
          title="Recent AI Employees"
          viewAllHref="/ai-employees/employees"
        >
          {employees.length ? (
            <div className="record-list">
              {employees.slice(0, 5).map((employee) => (
                <Link className="record-row" href={`/ai-employees/${employee.id}`} key={employee.id}>
                  <div>
                    <strong>{employee.name}</strong>
                    <p className="muted">{employee.type} - {employee.business_name}</p>
                  </div>
                  <StatusBadge status={employee.status} />
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              actionHref="/ai-employees/new"
              actionLabel="Create AI employee"
              description="Create your first generic AI employee to start testing the workflow."
              title="No AI employees yet"
            />
          )}
        </DataCard>

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

        <DataCard
          description="Open items waiting for human review."
          title="Recent Escalations"
          viewAllHref="/ai-employees/escalations"
        >
          {escalations.length ? (
            <div className="record-list">
              {escalations.slice(0, 5).map((escalation) => (
                <div className="record-row" key={escalation.id}>
                  <div>
                    <strong>{escalation.reason}</strong>
                    <p className="muted">{escalation.message}</p>
                  </div>
                  <span className="record-meta">{escalation.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              description="Escalations will appear when an AI employee flags an item for review."
              title="No open escalations"
            />
          )}
        </DataCard>
      </div>
    </AppFrame>
  );
}
