import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { listAiEmployees, listEscalations } from "@/ai-employees/data/repository";

export default async function EscalationsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAiEmployeesAccess();
  const query = await searchParams;
  const employeeId = param(query.employee);
  const status = param(query.status);
  const [employees, escalations] = await Promise.all([
    listAiEmployees({ includeArchived: true }),
    listEscalations({ employeeId, status })
  ]);

  return (
    <AppFrame
      eyebrow="Human review queue"
      subtitle="Items the AI employee marked for human review."
      title="Escalations"
    >

      <form className="card filters-bar">
        <Select label="Employee" name="employee" value={employeeId} options={employees.map((employee) => [employee.id, employee.name])} />
        <Select label="Status" name="status" value={status} options={[["open", "open"], ["reviewed", "reviewed"], ["resolved", "resolved"]]} />
        <button className="button secondary" type="submit">Apply filters</button>
      </form>

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Reason</th>
              <th>Message</th>
              <th>Employee</th>
              <th>Lead</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {escalations.map((escalation) => (
              <tr key={escalation.id}>
                <td>{escalation.reason}</td>
                <td>{escalation.message}</td>
                <td>{escalation.ai_employees?.name ?? "Unknown employee"}</td>
                <td>{escalation.ai_employee_leads?.name ?? escalation.ai_employee_leads?.phone ?? "No linked lead"}</td>
                <td>{escalation.status}</td>
                <td>{new Date(escalation.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!escalations.length ? <div className="empty-state"><h2>No escalations match these filters</h2></div> : null}
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
