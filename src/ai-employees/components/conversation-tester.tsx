"use client";

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
        <h2>Test employee</h2>
        <p className="muted">{employee.name} is running in test mode.</p>
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
      <form ref={formRef} action={formAction} className="button-row">
        <input type="hidden" name="employeeId" value={employee.id} />
        <input name="message" placeholder="Type a simulated visitor message" />
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
            qualified: state.extractedLead.qualified ? "true" : "false",
            escalation: state.extractedLead.escalation_needed ? state.extractedLead.escalation_reason : "false"
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
