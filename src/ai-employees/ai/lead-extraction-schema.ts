export const leadExtractionFields = [
  "name",
  "email",
  "phone",
  "service_needed",
  "preferred_time",
  "urgency",
  "intent",
  "notes",
  "qualified",
  "qualification_status",
  "missing_fields",
  "lead_score",
  "escalation_needed",
  "escalation_reason",
  "appointment_requested",
  "follow_up_needed",
  "follow_up_status"
] as const;

export type LeadExtractionField = (typeof leadExtractionFields)[number];
