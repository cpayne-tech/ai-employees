import type { AiEmployee } from "@/ai-employees/types";
import { buildRoleSpecificPrompt } from "@/ai-employees/ai/prompts";

export function buildAiEmployeePrompt(employee: AiEmployee) {
  return buildRoleSpecificPrompt(employee);
}
