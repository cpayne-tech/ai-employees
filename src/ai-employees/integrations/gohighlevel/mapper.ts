import type {
  GhlMappingInput,
  GhlPreparedAppointmentIntent,
  GhlPreparedContact,
  GhlPreparedNote,
  GhlPreparedOpportunity
} from "@/ai-employees/integrations/gohighlevel/types";

export function mapAiLeadToGhlContact(input: GhlMappingInput): GhlPreparedContact | null {
  if (!input.lead) {
    return null;
  }

  const [firstName, ...lastName] = (input.lead.name ?? "").split(" ").filter(Boolean);

  return {
    firstName,
    lastName: lastName.join(" ") || undefined,
    email: input.lead.email,
    phone: input.lead.phone,
    source: input.employee.ghl_source_name || input.lead.source || "AI Employees",
    tags: getContactTags(input)
  };
}

export function mapAiAppointmentToGhlIntent(
  input: GhlMappingInput
): GhlPreparedAppointmentIntent | null {
  if (!input.appointment) {
    return null;
  }

  return {
    calendarId: input.employee.ghl_calendar_id || undefined,
    requestedTime: input.appointment.requested_time,
    notes: input.appointment.notes
  };
}

export function mapAiConversationToGhlNote(input: GhlMappingInput): GhlPreparedNote | null {
  if (!input.conversation) {
    return null;
  }

  return {
    body: [
      `AI employee: ${input.employee.name}`,
      `Mode: ${input.conversation.mode}`,
      `Status: ${input.conversation.status}`,
      `Summary: ${input.conversation.summary ?? "No summary"}`,
      `Extracted lead: ${JSON.stringify(input.conversation.extracted_lead)}`
    ].join("\n")
  };
}

export function mapAiLeadToGhlOpportunity(input: GhlMappingInput): GhlPreparedOpportunity | null {
  if (!input.lead) {
    return null;
  }

  return {
    pipelineId: input.employee.ghl_pipeline_id || undefined,
    stageId: input.employee.ghl_opportunity_stage_id || undefined,
    status: input.lead.status,
    title: `${input.lead.name ?? "AI lead"} - ${input.lead.service_needed ?? "New inquiry"}`
  };
}

function getContactTags(input: GhlMappingInput) {
  const tags = new Set<string>(["obmc ai - employee lead"]);

  if (input.lead?.status === "qualified") {
    tags.add("obmc ai - qualified");
  }

  if (input.lead?.preferred_time || input.lead?.status === "appointment_requested") {
    tags.add("obmc ai - appointment requested");
  }

  if (input.lead?.status === "escalated") {
    tags.add("obmc ai - escalation needed");
  }

  if (input.lead?.status === "captured") {
    tags.add("obmc ai - follow-up needed");
  }

  if (input.employee.type === "AI Customer Support Agent") {
    tags.add("obmc ai - support request");
  }

  return Array.from(tags);
}
