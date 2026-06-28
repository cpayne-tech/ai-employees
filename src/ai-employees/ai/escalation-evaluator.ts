import type { ExtractedLead } from "@/ai-employees/types";

export function shouldEscalateLead(lead: ExtractedLead) {
  return Boolean(lead.escalation_needed || lead.escalation_reason);
}
