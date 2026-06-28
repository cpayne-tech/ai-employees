import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { EmptyState } from "@/ai-employees/components/empty-state";
import { StatusBadge } from "@/ai-employees/components/status-badge";
import { listAiEmployees, listAppointments } from "@/ai-employees/data/repository";

export default async function AppointmentsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAiEmployeesAccess();
  const query = await searchParams;
  const employeeId = param(query.employee);
  const status = param(query.status);
  const [employees, appointments] = await Promise.all([
    listAiEmployees({ includeArchived: true }),
    listAppointments({ employeeId, status })
  ]);

  return (
    <AppFrame
      eyebrow="Calendar queue"
      subtitle="Requested appointments. Calendar confirmation is intentionally not connected yet."
      title="Appointments"
    >

      <form className="card filters-bar">
        <Select label="Employee" name="employee" value={employeeId} options={employees.map((employee) => [employee.id, employee.name])} />
        <Select label="Status" name="status" value={status} options={[["requested", "requested"], ["confirmed", "confirmed"], ["completed", "completed"], ["canceled", "canceled"]]} />
        <button className="button secondary" type="submit">Apply filters</button>
      </form>

      <section className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Lead</th>
              <th>Requested time</th>
              <th>Employee</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appointment) => (
              <tr key={appointment.id}>
                <td>{appointment.ai_employee_leads?.name ?? appointment.ai_employee_leads?.phone ?? "Unknown lead"}</td>
                <td>{appointment.requested_time}</td>
                <td>{appointment.ai_employees?.name ?? "Unknown employee"}</td>
                <td><StatusBadge status={appointment.appointment_status} /></td>
                <td>{appointment.notes ?? "No notes"}</td>
                <td>{new Date(appointment.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!appointments.length ? (
          <EmptyState
            actionHref="/ai-employees/conversations"
            actionLabel="Review conversations"
            description="Appointment requests are created only when a test or future live conversation captures a preferred time."
            title="No appointment requests match these filters"
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
