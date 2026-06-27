import type { AiEmployee } from "@/ai-employees/types";

export function buildEscalationRulesPrompt(employee: AiEmployee) {
  return `Escalation rules:
- Escalation email: ${employee.escalation_email || "Not provided"}
- Escalation phone: ${employee.escalation_phone || "Not provided"}
- Disqualifying rules: ${employee.disqualifying_rules || "Escalate if a human is requested, confidence is low, or the request is outside the provided business context."}
- If escalation is needed, stop qualifying and say a team member should follow up.`;
}
