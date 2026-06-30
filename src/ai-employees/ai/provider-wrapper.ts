import { runReceptionistTestTurn, type TesterResult } from "@/ai-employees/tester-engine";
import type { AiEmployee, ExtractedLead, TranscriptMessage } from "@/ai-employees/types";
import { buildAiEmployeePrompt } from "@/ai-employees/ai/prompt-builder";

export function getAiProviderStatus() {
  return {
    configured: Boolean(process.env.OPENAI_API_KEY),
    provider: process.env.OPENAI_API_KEY ? "Enhanced test provider" : "Safe local mock"
  };
}

export async function runAiEmployeeProviderTurn(input: {
  employee: AiEmployee;
  visitorMessage: string;
  priorTranscript?: TranscriptMessage[];
  priorLead?: ExtractedLead;
}): Promise<TesterResult> {
  const result = runReceptionistTestTurn(input);

  return {
    ...result,
    systemPrompt: buildAiEmployeePrompt(input.employee)
  };
}
