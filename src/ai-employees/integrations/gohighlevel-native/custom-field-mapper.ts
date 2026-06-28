import type { AiEmployee } from "@/ai-employees/types";
import { aiEmployeeRoleBlueprints } from "@/ai-employees/role-blueprints";

export const standardGhlCustomFields = [
  "AI Employee Name",
  "AI Employee Role",
  "Lead Intent",
  "Service Needed",
  "Urgency",
  "Qualification Status",
  "Preferred Appointment Time",
  "Escalation Needed",
  "Escalation Reason",
  "Conversation Summary",
  "Last AI Touchpoint",
  "Follow-up Status"
];

export function getRecommendedCustomFields(employee: AiEmployee) {
  const blueprint = aiEmployeeRoleBlueprints.find((item) => item.type === employee.type);
  return Array.from(new Set([
    ...standardGhlCustomFields,
    ...(blueprint?.ghl.customFields ?? []),
    ...employee.required_lead_fields.map((field) => field.replaceAll("_", " "))
  ]));
}
