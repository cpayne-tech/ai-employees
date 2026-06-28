import type { AiEmployee } from "@/ai-employees/types";
import { buildReceptionistSystemPrompt } from "@/ai-employees/prompts";
import { aiEmployeeSafetyRules } from "@/ai-employees/ai/receptionist-rules";
import { leadExtractionFields } from "@/ai-employees/ai/lead-extraction-schema";

export function buildAiEmployeePrompt(employee: AiEmployee) {
  return [
    buildReceptionistSystemPrompt(employee),
    "",
    "Universal AI employee rules:",
    ...aiEmployeeSafetyRules.map((rule) => `- ${rule}`),
    "",
    `Lead extraction fields: ${leadExtractionFields.join(", ")}`
  ].join("\n");
}
