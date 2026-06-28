import Link from "next/link";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { EmptyState } from "@/ai-employees/components/empty-state";
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

export default async function AiEmployeesListPage({
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

  return (
    <AppFrame
      actions={<Link href="/ai-employees/new" className="button">New AI Employee</Link>}
      subtitle="Search, filter, test, and manage every AI employee."
      title="AI Employees"
    >
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

      {employees.length ? (
        <section className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Business</th>
                <th>Leads</th>
                <th>Conversations</th>
                <th>Appointments</th>
                <th>Escalations</th>
                <th>Last active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td><strong>{employee.name}</strong></td>
                  <td>{employee.type}</td>
                  <td><StatusBadge status={employee.status} /></td>
                  <td>{employee.business_name}</td>
                  <td>{employee.total_leads}</td>
                  <td>{employee.total_conversations}</td>
                  <td>{employee.total_appointments}</td>
                  <td>{employee.total_escalations}</td>
                  <td>
                    {employee.last_active_at
                      ? new Date(employee.last_active_at).toLocaleString()
                      : "No activity"}
                  </td>
                  <td>
                    <div className="button-row">
                      <Link className="button secondary" href={`/ai-employees/${employee.id}`}>
                        View
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
        </section>
      ) : (
        <div className="card">
          <EmptyState
            actionHref="/ai-employees/new"
            actionLabel="Create AI employee"
            description="Create a generic employee or adjust the filters to include archived records."
            title="No AI employees found"
          />
        </div>
      )}
    </AppFrame>
  );
}

function stringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}
