import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { getLeadDetail } from "@/ai-employees/data/repository";

export default async function LeadDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAiEmployeesAccess();
  const { id } = await params;
  const detail = await getLeadDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <AppFrame>
      <div className="page-header">
        <div>
          <div className="eyebrow">Lead detail</div>
          <h1>{detail.lead.name ?? "Unknown lead"}</h1>
          <p className="muted">{detail.lead.ai_employees?.name ?? "Unknown employee"}</p>
        </div>
        <Link className="button secondary" href="/ai-employees/leads">Back to leads</Link>
      </div>

      <div className="grid two-column-grid">
        <section className="card">
          <h2>Contact info</h2>
          <Detail label="Phone" value={detail.lead.phone} />
          <Detail label="Email" value={detail.lead.email} />
          <Detail label="Service needed" value={detail.lead.service_needed} />
          <Detail label="Preferred time" value={detail.lead.preferred_time} />
          <Detail label="Status" value={detail.lead.status} />
          <Detail label="Source" value={detail.lead.source} />
        </section>
        <section className="card">
          <h2>Related records</h2>
          <Detail label="Notes" value={detail.lead.notes} />
          <Detail label="Conversation" value={detail.conversation ? detail.conversation.summary ?? detail.conversation.status : "None"} />
          <Detail label="Appointment request" value={detail.appointment ? `${detail.appointment.requested_time} (${detail.appointment.appointment_status})` : "None"} />
          <Detail label="Escalation" value={detail.escalation ? `${detail.escalation.reason} (${detail.escalation.status})` : "None"} />
        </section>
      </div>
    </AppFrame>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value || "Not captured"}</strong>
    </div>
  );
}
