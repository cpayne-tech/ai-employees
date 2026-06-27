import type { AiEmployee } from "@/ai-employees/types";
import { buildAppointmentRulesPrompt } from "@/ai-employees/prompts/appointment-rules";
import { baseReceptionistPrompt } from "@/ai-employees/prompts/base-receptionist";
import { buildBusinessContextPrompt } from "@/ai-employees/prompts/business-context";
import { buildEscalationRulesPrompt } from "@/ai-employees/prompts/escalation-rules";
import { buildLeadQualificationPrompt } from "@/ai-employees/prompts/lead-qualification";

export function buildReceptionistSystemPrompt(employee: AiEmployee) {
  return [
    baseReceptionistPrompt,
    buildBusinessContextPrompt(employee),
    buildLeadQualificationPrompt(employee),
    buildEscalationRulesPrompt(employee),
    buildAppointmentRulesPrompt(employee)
  ].join("\n\n");
}
