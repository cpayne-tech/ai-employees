import { runReceptionistTestTurn, type TesterResult } from "@/ai-employees/tester-engine";
import type { AiEmployee, ExtractedLead, TranscriptMessage } from "@/ai-employees/types";
import { buildRoleSpecificPrompt } from "@/ai-employees/ai/prompts";
import { aiEmployeeTurnSchema } from "@/ai-employees/ai/schema";

const openAiUrl = "https://api.openai.com/v1/chat/completions";

export function getAiProviderStatus() {
  const configured = Boolean(process.env.OPENAI_API_KEY);

  return {
    configured,
    provider: configured ? "OpenAI-compatible" : "Safe local mock",
    model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini"
  };
}

export async function runAiEmployeeProviderTurn(input: {
  employee: AiEmployee;
  visitorMessage: string;
  priorTranscript?: TranscriptMessage[];
  priorLead?: ExtractedLead;
}): Promise<TesterResult> {
  const systemPrompt = buildRoleSpecificPrompt(input.employee);

  if (!process.env.OPENAI_API_KEY) {
    return {
      ...runReceptionistTestTurn(input),
      systemPrompt
    };
  }

  try {
    return await runOpenAiTurn(input, systemPrompt);
  } catch (error) {
    return {
      ...runReceptionistTestTurn(input),
      systemPrompt,
      providerWarning: error instanceof Error ? error.message : "AI provider call failed."
    };
  }
}

async function runOpenAiTurn(
  input: {
    employee: AiEmployee;
    visitorMessage: string;
    priorTranscript?: TranscriptMessage[];
    priorLead?: ExtractedLead;
  },
  systemPrompt: string
): Promise<TesterResult> {
  const timestamp = new Date().toISOString();
  const messages = [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Existing extracted lead JSON:\n${JSON.stringify(input.priorLead ?? {}, null, 2)}`
    },
    ...(input.priorTranscript ?? []).map((message) => ({
      role: message.role === "visitor" ? "user" : "assistant",
      content: message.content
    })),
    { role: "user", content: input.visitorMessage }
  ];

  const response = await fetch(openAiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-5.4-mini",
      messages,
      temperature: 0.2,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI provider returned ${response.status}: ${errorText.slice(0, 180)}`);
  }

  const body = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = body.choices?.[0]?.message?.content ?? "";
  const parsed = aiEmployeeTurnSchema.parse(JSON.parse(raw));
  const extractedLead = normalizeExtractedLead(parsed.extracted_lead, input.employee);
  const assistantMessage = parsed.assistant_message;

  return {
    transcript: [
      ...(input.priorTranscript ?? []),
      { role: "visitor", content: input.visitorMessage, createdAt: timestamp },
      { role: "assistant", content: assistantMessage, createdAt: timestamp }
    ],
    extractedLead,
    assistantMessage,
    status: parsed.conversation_status,
    systemPrompt
  };
}

function normalizeExtractedLead(lead: ExtractedLead, employee: AiEmployee): ExtractedLead {
  const missingFields = employee.required_lead_fields.filter((field) => {
    const value = lead[field as keyof ExtractedLead];
    return !value || (Array.isArray(value) && value.length === 0);
  });

  return {
    ...lead,
    missing_fields: missingFields,
    qualified: missingFields.length === 0 && !lead.escalation_needed,
    qualification_status: lead.escalation_needed
      ? "needs_human_review"
      : missingFields.length === 0
        ? "qualified"
        : lead.qualification_status ?? "in_progress",
    lead_score: Math.max(0, Math.min(100, Number(lead.lead_score ?? 0)))
  };
}
