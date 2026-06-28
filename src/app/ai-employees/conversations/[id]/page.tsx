import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAiEmployeesAccess } from "@/ai-employees/auth";
import { AppFrame } from "@/ai-employees/components/app-frame";
import { getConversationDetail } from "@/ai-employees/data/repository";

export default async function ConversationDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAiEmployeesAccess();
  const { id } = await params;
  const detail = await getConversationDetail(id);

  if (!detail) {
    notFound();
  }

  return (
    <AppFrame
      actions={<Link className="button secondary" href="/ai-employees/conversations">Back to conversations</Link>}
      eyebrow="Conversation detail"
      subtitle={`${detail.conversation.ai_employees?.name ?? "Unknown employee"} - ${detail.conversation.mode}`}
      title={detail.conversation.visitor_name ?? "Unknown visitor"}
    >

      <div className="grid two-column-grid">
        <section className="card">
          <h2>Transcript</h2>
          <div className="chat-log">
            {detail.conversation.transcript.map((message, index) => (
              <div className={`message ${message.role === "visitor" ? "user" : "assistant"}`} key={`${message.createdAt}-${index}`}>
                <small>{message.role}</small>
                {message.content}
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <h2>Extracted lead</h2>
          <pre className="json-block">{JSON.stringify(detail.conversation.extracted_lead, null, 2)}</pre>
          <Detail label="Summary" value={detail.conversation.summary} />
          <Detail label="Linked lead" value={detail.lead ? detail.lead.name ?? detail.lead.phone ?? detail.lead.email : "None"} />
          <Detail label="Linked appointment" value={detail.appointment ? detail.appointment.requested_time : "None"} />
          <Detail label="Linked escalation" value={detail.escalation ? detail.escalation.reason : "None"} />
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
