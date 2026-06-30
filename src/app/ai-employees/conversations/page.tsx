import Link from "next/link";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { EmptyState } from "@/ai-employees/components/empty-state";
import { StatusBadge } from "@/ai-employees/components/status-badge";
import { listAiEmployees, listConversations } from "@/ai-employees/data/repository";

export default async function ConversationsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAiEmployeesAccess();
  const query = await searchParams;
  const employeeId = param(query.employee);
  const status = param(query.status);
  const mode = param(query.mode);
  const [employees, conversations] = await Promise.all([
    listAiEmployees({ includeArchived: true }),
    listConversations({ employeeId, status, mode })
  ]);

  return (
    <AppFrame
      eyebrow="Conversation review"
      subtitle="Review transcripts, extracted leads, appointments, and escalations."
      title="Conversations"
    >

      <form className="card filters-bar">
        <Select label="Employee" name="employee" value={employeeId} options={employees.map((employee) => [employee.id, employee.name])} />
        <Select label="Status" name="status" value={status} options={[["in_progress", "in_progress"], ["qualified", "qualified"], ["appointment_requested", "appointment_requested"], ["escalated", "escalated"]]} />
        <Select label="Mode" name="mode" value={mode} options={[["test", "test"], ["live", "live"]]} />
        <button className="button secondary" type="submit">Apply filters</button>
      </form>

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Employee</th>
              <th>Status</th>
              <th>Mode</th>
              <th>Created</th>
              <th>Summary</th>
              <th>Lead</th>
              <th>Escalation</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {conversations.map((conversation) => (
              <tr key={conversation.id}>
                <td>{conversation.visitor_name ?? conversation.extracted_lead.name ?? "Unknown visitor"}</td>
                <td>{conversation.ai_employees?.name ?? "Unknown employee"}</td>
                <td><StatusBadge status={conversation.status} /></td>
                <td><span className="setup-badge needs-setup">{conversation.mode}</span></td>
                <td>{new Date(conversation.created_at).toLocaleString()}</td>
                <td>{conversation.summary ?? "No summary"}</td>
                <td>{conversation.extracted_lead.name || conversation.extracted_lead.phone || conversation.extracted_lead.email ? "Captured" : "None"}</td>
                <td>{conversation.extracted_lead.escalation_needed ? "Needs review" : "No"}</td>
                <td><Link className="button secondary" href={`/ai-employees/conversations/${conversation.id}`}>Open</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!conversations.length ? (
          <EmptyState
            actionHref="/ai-employees/employees"
            actionLabel="Start Test Conversation"
            description="Test conversation transcripts appear here after you send the first safe test message."
            title="No conversations match these filters"
          />
        ) : null}
      </section>
    </AppFrame>
  );
}

function Select({
  label,
  name,
  value,
  options
}: {
  label: string;
  name: string;
  value: string;
  options: string[][];
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={value || "all"}>
        <option value="all">All</option>
        {options.map(([optionValue, optionLabel]) => (
          <option value={optionValue} key={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </div>
  );
}

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
