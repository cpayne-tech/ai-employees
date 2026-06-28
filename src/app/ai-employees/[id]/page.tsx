import Link from "next/link";
import { notFound } from "next/navigation";
import {
  activateAiEmployeeAction,
  archiveAiEmployeeAction,
  pauseAiEmployeeAction
} from "@/ai-employees/actions";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { StatusBadge } from "@/ai-employees/components/status-badge";
import { getAiEmployeeDetail } from "@/ai-employees/data/repository";

export default async function AiEmployeeProfilePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAiEmployeesAccess();
  const { id } = await params;
  const detail = await getAiEmployeeDetail(id);

  if (!detail) {
    notFound();
  }

  const { employee } = detail;

  return (
    <AppFrame
      actions={
        <>
          <Link href={`/ai-employees/${employee.id}/edit`} className="button secondary">
            Edit settings
          </Link>
          <Link href={`/ai-employees/${employee.id}/test`} className="button">
            Test employee
          </Link>
          {employee.status === "active" ? (
            <form action={pauseAiEmployeeAction.bind(null, employee.id)}>
              <button className="button secondary" type="submit">Pause</button>
            </form>
          ) : (
            <form action={activateAiEmployeeAction.bind(null, employee.id)}>
              <button className="button secondary" type="submit">Activate</button>
            </form>
          )}
          <form action={archiveAiEmployeeAction.bind(null, employee.id)}>
            <button className="button danger" type="submit">
              {employee.name === "OBMC Website Concierge" ? "Archive test employee" : "Archive"}
            </button>
          </form>
        </>
      }
      eyebrow="AI employee profile"
      subtitle={`${employee.type} for ${employee.business_name}`}
      title={employee.name}
    >
      <div className="button-row" style={{ marginBottom: 18 }}>
        <StatusBadge status={employee.status} />
      </div>

      <section className="grid stats-grid">
        <Stat label="Leads captured" value={employee.total_leads} />
        <Stat label="Conversations" value={employee.total_conversations} />
        <Stat label="Appointments" value={employee.total_appointments} />
        <Stat label="Escalations" value={employee.total_escalations} />
      </section>

      <div className="grid" style={{ marginTop: 18 }}>
        <section className="card">
          <h2>Overview</h2>
          <div className="detail-list">
            <Detail label="Business" value={employee.business_name} />
            <Detail label="Primary goal" value={employee.primary_goal} />
            <Detail label="Last active" value={employee.last_active_at ? new Date(employee.last_active_at).toLocaleString() : "No activity"} />
            <Detail label="Status" value={employee.status} />
          </div>
        </section>

        <div className="grid two-column-grid">
          <section className="card">
            <h2>Configuration</h2>
            <div className="detail-list">
              <Detail label="Business" value={employee.business_name} />
              <Detail label="Industry" value={employee.industry} />
              <Detail label="Phone" value={employee.business_phone} />
              <Detail label="Email" value={employee.business_email} />
              <Detail label="Website" value={employee.website} />
              <Detail label="Service area" value={employee.service_area} />
              <Detail label="Services" value={employee.services_offered} />
              <Detail label="Hours" value={employee.business_hours} />
              <Detail label="Primary goal" value={employee.primary_goal} />
              <Detail label="Required fields" value={employee.required_lead_fields.join(", ")} />
              <Detail label="Escalation email" value={employee.escalation_email} />
              <Detail label="Escalation phone" value={employee.escalation_phone} />
              <Detail label="Tone" value={employee.tone} />
              <Detail label="FAQs" value={employee.faqs} />
              <Detail label="Rules" value={employee.disqualifying_rules} />
              <Detail label="Appointment instructions" value={employee.appointment_instructions} />
            </div>
          </section>

          <section className="card">
            <h2>GoHighLevel Integration - Coming Next</h2>
            <p className="muted">Not connected. These saved fields are placeholders for Part 3.</p>
            <div className="detail-list">
              <Detail label="Location ID" value={employee.ghl_location_id} />
              <Detail label="Calendar ID" value={employee.ghl_calendar_id} />
              <Detail label="Pipeline ID" value={employee.ghl_pipeline_id} />
              <Detail label="Stage ID" value={employee.ghl_opportunity_stage_id} />
              <Detail label="Source name" value={employee.ghl_source_name} />
            </div>
          </section>
        </div>

        <div className="grid">
          <Records title="Conversations" empty="No conversations yet." rows={detail.conversations.map((item) => [
            item.status,
            item.visitor_name ?? "Unknown visitor",
            new Date(item.updated_at).toLocaleString()
          ])} />
          <Records title="Leads captured" empty="No leads captured yet." rows={detail.leads.map((item) => [
            item.name ?? "Unknown",
            item.phone ?? "No phone",
            item.email ?? "No email",
            item.status
          ])} />
          <Records title="Appointment requests" empty="No appointment requests yet." rows={detail.appointments.map((item) => [
            item.requested_time,
            item.appointment_status,
            new Date(item.created_at).toLocaleString()
          ])} />
          <Records title="Escalations" empty="No escalations yet." rows={detail.escalations.map((item) => [
            item.reason,
            item.status,
            new Date(item.created_at).toLocaleString()
          ])} />
        </div>
      </div>
    </AppFrame>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || "Not provided"}</strong>
    </div>
  );
}

function Records({
  title,
  empty,
  rows
}: {
  title: string;
  empty: string;
  rows: string[][];
}) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {rows.length ? (
        <div className="grid">
          {rows.map((row, index) => (
            <div className="detail-item" key={`${title}-${index}`}>
              <strong>{row[0]}</strong>
              <p className="muted" style={{ margin: "6px 0 0" }}>{row.slice(1).join(" · ")}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="muted">{empty}</p>
      )}
    </section>
  );
}
