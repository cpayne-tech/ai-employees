export const leadExtractionFields = [
  "name",
  "email",
  "phone",
  "service_needed",
  "preferred_time",
  "urgency",
  "notes",
  "qualified",
  "escalation_needed",
  "escalation_reason",
  "appointment_requested"
] as const;

export type LeadExtractionField = (typeof leadExtractionFields)[number];
