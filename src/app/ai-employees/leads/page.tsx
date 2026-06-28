import Link from "next/link";
import { archiveLeadAction } from "@/ai-employees/actions";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { EmptyState } from "@/ai-employees/components/empty-state";
import { StatusBadge } from "@/ai-employees/components/status-badge";
import { listAiEmployees, listLeads } from "@/ai-employees/data/repository";

export default async function LeadsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAiEmployeesAccess();
  const query = await searchParams;
  const employeeId = param(query.employee);
  const status = param(query.status);
  const source = param(query.source);
  const search = param(query.search);
  const [employees, leads] = await Promise.all([
    listAiEmployees({ includeArchived: true }),
    listLeads({ employeeId, status, source, search })
  ]);

  return (
    <AppFrame
      eyebrow="Captured demand"
      subtitle="All lead records captured by AI employees."
      title="Leads"
    >

      <form className="card filters-bar">
        <div className="field">
          <label htmlFor="search">Search</label>
          <input id="search" name="search" defaultValue={search} placeholder="Name, email, phone, or service" />
        </div>
        <Select label="Employee" name="employee" value={employeeId} options={employees.map((employee) => [employee.id, employee.name])} />
        <Select label="Status" name="status" value={status} options={[["captured", "captured"], ["qualified", "qualified"], ["unqualified", "unqualified"], ["archived", "archived"]]} />
        <Select label="Source" name="source" value={source} options={[["test", "test"], ["live", "live"]]} />
        <button className="button secondary" type="submit">Apply filters</button>
      </form>

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Service needed</th>
              <th>Employee</th>
              <th>Status</th>
              <th>Source</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.name ?? "Unknown"}</td>
                <td>{lead.phone ?? "Not captured"}</td>
                <td>{lead.email ?? "Not captured"}</td>
                <td>{lead.service_needed ?? "Not captured"}</td>
                <td>{lead.ai_employees?.name ?? "Unknown employee"}</td>
                <td><StatusBadge status={lead.status} /></td>
                <td><span className="setup-badge needs-setup">{lead.source}</span></td>
                <td>{new Date(lead.created_at).toLocaleString()}</td>
                <td>
                  <div className="button-row">
                    <Link className="button secondary" href={`/ai-employees/leads/${lead.id}`}>Open</Link>
                    {lead.status !== "archived" ? (
                      <form action={archiveLeadAction.bind(null, lead.id)}>
                        <button className="button danger" type="submit">Archive</button>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!leads.length ? (
          <EmptyState
            actionHref="/ai-employees/employees"
            actionLabel="Test an employee"
            description="Captured test and future live leads will appear here. Archived leads stay hidden unless you filter for archived."
            title="No leads match these filters"
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
