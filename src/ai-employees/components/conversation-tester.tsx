"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import { useFormStatus } from "react-dom";
import {
  sendTestMessageAction,
  type TesterActionState
} from "@/ai-employees/actions";
import type { AiEmployee } from "@/ai-employees/types";

const initialState: TesterActionState = {
  transcript: [],
  extractedLead: {},
  status: "idle"
};

export function ConversationTester({ employee }: { employee: AiEmployee }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(async (previous: TesterActionState, formData: FormData) => {
    const next = await sendTestMessageAction(previous, formData);
    formRef.current?.reset();
    return next;
  }, initialState);

  return (
    <section className="card tester">
      <div>
        <h2>Test Conversation</h2>
        <p className="muted">{employee.name} is running a safe test conversation before GoHighLevel configuration.</p>
      </div>
      <div className="button-row">
        <span className="setup-badge needs-setup">Mode: simulation</span>
        <span className={`setup-badge ${state.status === "escalated" ? "not-connected" : state.status === "qualified" || state.status === "appointment_requested" ? "ready" : "needs-setup"}`}>
          {state.status}
        </span>
        <Link className="button secondary" href={`/ai-employees/${employee.id}/test`}>
          New simulation
        </Link>
        <Link className="button secondary" href={`/ai-employees/${employee.id}`}>
          Back to details
        </Link>
      </div>
      <div className="chat-log" aria-live="polite">
        {state.transcript.length === 0 ? (
          <div className="message assistant">
            <small>assistant</small>
            Hi, I am {employee.name}, the AI receptionist for {employee.business_name}. What can I help you with today?
          </div>
        ) : (
          state.transcript.map((message, index) => (
            <div
              className={`message ${message.role === "visitor" ? "user" : "assistant"}`}
              key={`${message.createdAt}-${index}`}
            >
              <small>{message.role === "visitor" ? "visitor" : "assistant"}</small>
              {message.content}
            </div>
          ))
        )}
      </div>
      {state.error ? <div className="error-box">{state.error}</div> : null}
      {state.providerWarning ? <div className="setup-note">{state.providerWarning}</div> : null}
      <form ref={formRef} action={formAction} className="button-row">
        <input type="hidden" name="employeeId" value={employee.id} />
        <input name="message" placeholder="Type a simulated GHL conversation message" />
        <SendButton />
      </form>
      <div>
        <h3>Extracted lead data</h3>
        <div className="extracted-grid">
          {Object.entries({
            name: state.extractedLead.name,
            phone: state.extractedLead.phone,
            email: state.extractedLead.email,
            service: state.extractedLead.service_needed,
            preferred_time: state.extractedLead.preferred_time,
            urgency: state.extractedLead.urgency,
            intent: state.extractedLead.intent,
            qualified: state.extractedLead.qualified ? "true" : "false",
            qualification_status: state.extractedLead.qualification_status,
            missing_fields: state.extractedLead.missing_fields?.join(", "),
            lead_score: typeof state.extractedLead.lead_score === "number" ? String(state.extractedLead.lead_score) : "",
            appointment_requested: state.extractedLead.appointment_requested ? "true" : "false",
            escalation: state.extractedLead.escalation_needed ? state.extractedLead.escalation_reason : "false",
            follow_up_needed: state.extractedLead.follow_up_needed ? "true" : "false",
            follow_up_status: state.extractedLead.follow_up_status
          }).map(([label, value]) => (
            <div className="extract-row" key={label}>
              <span>{label.replaceAll("_", " ")}</span>
              <strong>{value || "Not captured"}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SendButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" type="submit" disabled={pending}>
      {pending ? "Sending..." : "Send"}
    </button>
  );
}
