import Link from "next/link";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { StatusBadge } from "@/ai-employees/components/status-badge";
import { listAiEmployees } from "@/ai-employees/data/repository";
import type { AiEmployeeStatus, AiEmployeeType } from "@/ai-employees/types";

const statusOptions: Array<AiEmployeeStatus | "all"> = [
  "all",
  "draft",
  "active",
  "paused",
  "archived"
];

const typeOptions: Array<AiEmployeeType | "all"> = [
  "all",
  "AI Receptionist / Appointment Setter",
  "AI Website Concierge",
  "AI Lead Qualifier",
  "AI Customer Support Agent"
];

export default async function AiEmployeesPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAiEmployeesAccess();
  const query = await searchParams;
  const status = stringParam(query.status);
  const type = stringParam(query.type);
  const search = stringParam(query.search);
  const includeArchived = stringParam(query.includeArchived) === "1" || status === "archived";
  const employees = await listAiEmployees({
    status,
    type,
    search,
    includeArchived
  });
  const totals = employees.reduce(
    (summary, employee) => ({
      leads: summary.leads + employee.total_leads,
      conversations: summary.conversations + employee.total_conversations,
      appointments: summary.appointments + employee.total_appointments,
      escalations: summary.escalations + employee.total_escalations
    }),
    { leads: 0, conversations: 0, appointments: 0, escalations: 0 }
  );

  return (
    <AppFrame>
      <div className="page-header">
        <div>
          <div className="eyebrow">AI employee dashboard</div>
          <h1>Manage AI employees</h1>
          <p className="muted">
            Receptionist and appointment-setting systems for small businesses.
          </p>
        </div>
        <Link href="/ai-employees/new" className="button">
          Create new AI employee
        </Link>
      </div>

      <section className="grid stats-grid" aria-label="AI employee totals">
        <Stat label="Leads captured" value={totals.leads} />
        <Stat label="Conversations" value={totals.conversations} />
        <Stat label="Appointments requested" value={totals.appointments} />
        <Stat label="Escalations" value={totals.escalations} />
      </section>

      <form className="card filters-bar">
        <div className="field">
          <label htmlFor="search">Search</label>
          <input id="search" name="search" defaultValue={search} placeholder="Employee or business name" />
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={status || "all"}>
            {statusOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="type">Employee type</label>
          <select id="type" name="type" defaultValue={type || "all"}>
            {typeOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <label className="check-row">
          <input name="includeArchived" type="checkbox" value="1" defaultChecked={includeArchived} />
          Show archived
        </label>
        <button className="button secondary" type="submit">Apply filters</button>
      </form>

      <section style={{ marginTop: 18 }}>
        {employees.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Assigned business</th>
                  <th>Leads</th>
                  <th>Conversations</th>
                  <th>Appointments</th>
                  <th>Last active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <strong>{employee.name}</strong>
                    </td>
                    <td>{employee.type}</td>
                    <td>
                      <StatusBadge status={employee.status} />
                    </td>
                    <td>{employee.business_name}</td>
                    <td>{employee.total_leads}</td>
                    <td>{employee.total_conversations}</td>
                    <td>{employee.total_appointments}</td>
                    <td>
                      {employee.last_active_at
                        ? new Date(employee.last_active_at).toLocaleString()
                        : "No activity"}
                    </td>
                    <td>
                      <div className="button-row">
                        <Link className="button secondary" href={`/ai-employees/${employee.id}`}>
                        View details
                        </Link>
                        <Link className="button secondary" href={`/ai-employees/${employee.id}/test`}>
                          Test
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card empty-state">
            <h2>No AI employees yet</h2>
            <p className="muted">Create a generic employee or adjust the filters to include archived records.</p>
            <Link href="/ai-employees/new" className="button">
              Create new AI employee
            </Link>
          </div>
        )}
      </section>
    </AppFrame>
  );
}

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
