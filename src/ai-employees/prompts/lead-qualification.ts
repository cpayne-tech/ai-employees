import type { AiEmployee } from "@/ai-employees/types";

export function buildLeadQualificationPrompt(employee: AiEmployee) {
  return `Lead qualification:
- Required fields: ${employee.required_lead_fields.join(", ")}
- Ask for missing fields one at a time.
- Confirm the visitor's service need before requesting an appointment time.
- Store extracted fields as structured JSON after every message.
- Mark qualified only when the core requested fields are present and no disqualifying rule applies.`;
}
