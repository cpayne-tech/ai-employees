import { runReceptionistTestTurn, type TesterResult } from "@/ai-employees/tester-engine";
import type { AiEmployee, ExtractedLead, TranscriptMessage } from "@/ai-employees/types";
import { buildRoleSpecificPrompt } from "@/ai-employees/ai/prompts";
import { aiEmployeeTurnSchema } from "@/ai-employees/ai/schema";

const openAiUrl = "https://api.openai.com/v1/responses";
const defaultOpenAiModel = "gpt-5.5";

export function getAiProviderStatus() {
  const configured = Boolean(process.env.OPENAI_API_KEY);

  return {
    configured,
    provider: configured ? "OpenAI-compatible" : "Safe local mock",
    model: process.env.OPENAI_MODEL ?? defaultOpenAiModel
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
      providerWarning: error instanceof Error ? error.message : "Simulation provider call failed."
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
      model: process.env.OPENAI_MODEL ?? defaultOpenAiModel,
      input: messages,
      text: {
        format: {
          type: "json_schema",
          name: "ai_employee_turn",
          strict: true,
          schema: aiEmployeeTurnJsonSchema
        }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI simulation provider returned ${response.status}: ${errorText.slice(0, 180)}`);
  }

  const body = await response.json() as OpenAiResponseBody;
  const raw = extractResponseText(body);
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

type OpenAiResponseBody = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
      type?: string;
    }>;
  }>;
};

const aiEmployeeTurnJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["assistant_message", "conversation_status", "extracted_lead"],
  properties: {
    assistant_message: { type: "string" },
    conversation_status: {
      type: "string",
      enum: ["in_progress", "qualified", "appointment_requested", "escalated"]
    },
    extracted_lead: {
      type: "object",
      additionalProperties: false,
      required: [
        "name",
        "email",
        "phone",
        "service_needed",
        "preferred_time",
        "urgency",
        "intent",
        "notes",
        "qualified",
        "qualification_status",
        "missing_fields",
        "lead_score",
        "escalation_needed",
        "escalation_reason",
        "appointment_requested",
        "follow_up_needed",
        "follow_up_status"
      ],
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        service_needed: { type: "string" },
        preferred_time: { type: "string" },
        urgency: { type: "string" },
        intent: { type: "string" },
        notes: { type: "string" },
        qualified: { type: "boolean" },
        qualification_status: { type: "string" },
        missing_fields: { type: "array", items: { type: "string" } },
        lead_score: { type: "number" },
        escalation_needed: { type: "boolean" },
        escalation_reason: { type: "string" },
        appointment_requested: { type: "boolean" },
        follow_up_needed: { type: "boolean" },
        follow_up_status: { type: "string" }
      }
    }
  }
} as const;

function extractResponseText(body: OpenAiResponseBody) {
  if (body.output_text) {
    return body.output_text;
  }

  const text = body.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .find((value): value is string => Boolean(value));

  if (!text) {
    throw new Error("OpenAI simulation provider did not return text output.");
  }

  return text;
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
