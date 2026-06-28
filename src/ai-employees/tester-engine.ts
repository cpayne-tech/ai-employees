import type {
  AiEmployee,
  ExtractedLead,
  TranscriptMessage
} from "@/ai-employees/types";
import { buildReceptionistSystemPrompt } from "@/ai-employees/prompts";

const fieldQuestions: Record<string, string> = {
  name: "What is your name?",
  phone: "What is the best phone number for the team to reach you?",
  email: "What email should we use for the appointment request?",
  service_needed: "What service are you interested in?",
  urgency: "How soon are you hoping to get help?",
  preferred_time: "What day and time would you prefer for the consultation?"
};

const escalationPatterns = [
  {
    pattern: /\b(human|agent|person|representative|manager|call me)\b/i,
    reason: "Visitor requested a human."
  },
  {
    pattern: /\b(price|quote|how much|cost)\b/i,
    reason: "Visitor asked for pricing that may need human confirmation."
  },
  {
    pattern: /\b(contract|legal|medical|licensed advice|guarantee)\b/i,
    reason: "Visitor may need advice outside the AI employee scope."
  },
  {
    pattern: /\b(emergency|urgent crisis|lawsuit|complaint)\b/i,
    reason: "Visitor used emergency or complaint language."
  }
];

export type TesterResult = {
  transcript: TranscriptMessage[];
  extractedLead: ExtractedLead;
  assistantMessage: string;
  status: "in_progress" | "qualified" | "appointment_requested" | "escalated";
  systemPrompt: string;
  providerWarning?: string;
};

export function runReceptionistTestTurn(input: {
  employee: AiEmployee;
  visitorMessage: string;
  priorTranscript?: TranscriptMessage[];
  priorLead?: ExtractedLead;
}): TesterResult {
  const systemPrompt = buildReceptionistSystemPrompt(input.employee);
  const extractedLead = extractLead(input.visitorMessage, input.priorLead ?? {});
  const escalation = detectEscalation(input.visitorMessage, input.employee);
  const timestamp = new Date().toISOString();
  let status: TesterResult["status"] = "in_progress";
  let assistantMessage: string;

  if (escalation) {
    extractedLead.escalation_needed = true;
    extractedLead.escalation_reason = escalation;
    status = "escalated";
    assistantMessage = `Thanks for explaining that. I am an AI assistant, so I should have a team member follow up on this. I will mark this for escalation: ${escalation}`;
  } else {
    const missingField = findMissingRequiredField(
      input.employee.required_lead_fields,
      extractedLead
    );

    if (missingField) {
      assistantMessage =
        fieldQuestions[missingField] ??
        `What should I capture for ${missingField.replaceAll("_", " ")}?`;
    } else {
      extractedLead.qualified = true;
      extractedLead.qualification_status = "qualified";
      extractedLead.appointment_requested = Boolean(extractedLead.preferred_time);
      status = extractedLead.preferred_time
        ? "appointment_requested"
        : "qualified";
      assistantMessage = extractedLead.preferred_time
        ? `Thank you. I have the details needed to request a consultation for ${extractedLead.preferred_time}. A team member will confirm availability before anything is booked.`
        : "Thank you. I have the core lead details and can pass this to the team for the next step.";
    }
  }

  const transcript: TranscriptMessage[] = [
    ...(input.priorTranscript ?? []),
    {
      role: "visitor",
      content: input.visitorMessage,
      createdAt: timestamp
    },
    {
      role: "assistant",
      content: assistantMessage,
      createdAt: timestamp
    }
  ];

  return {
    transcript,
    extractedLead,
    assistantMessage,
    status,
    systemPrompt
  };
}

function findMissingRequiredField(
  requiredFields: string[],
  lead: ExtractedLead
) {
  return requiredFields.find((field) => {
    const key = field as keyof ExtractedLead;
    return !lead[key];
  });
}

function detectEscalation(message: string, employee: AiEmployee) {
  const explicit = escalationPatterns.find((item) => item.pattern.test(message));
  if (explicit) {
    return explicit.reason;
  }

  const customRules = employee.disqualifying_rules.toLowerCase();
  if (customRules.includes("licensed advice") && /\badvice\b/i.test(message)) {
    return "Visitor asked for licensed advice.";
  }

  return null;
}

function extractLead(message: string, priorLead: ExtractedLead): ExtractedLead {
  const lead: ExtractedLead = { ...priorLead };
  const email = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
  const phone = message.match(
    /(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/
  )?.[0];
  const urgency = message.match(/\b(?:asap|urgent|today|tomorrow|this week|next week|soon|no rush)\b/i)?.[0];
  const preferredTime = message.match(
    /\b(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|morning|afternoon|evening|at\s+\d{1,2}(?::\d{2})?\s?(?:am|pm)?)\b.*$/i
  )?.[0];
  const serviceNeeded = message.match(
    /\b(?:need|want|looking for|interested in|help with|service for|appointment for)\s+([^.?!]+)/i
  )?.[0];
  const name = message.match(/\b(?:my name is|i am|i'm|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/)?.[1];

  if (email) {
    lead.email = email;
  }
  if (phone) {
    lead.phone = phone;
  }
  if (urgency) {
    lead.urgency = urgency;
  }
  if (preferredTime) {
    lead.preferred_time = preferredTime.trim();
  }
  if (serviceNeeded) {
    lead.service_needed = serviceNeeded.trim();
  }
  if (name) {
    lead.name = name;
  }

  lead.notes = [lead.notes, message].filter(Boolean).join("\n").slice(-1200);
  lead.qualified = Boolean(
    lead.name && lead.email && lead.phone && !lead.escalation_needed
  );
  lead.qualification_status = lead.qualified ? "qualified" : "in_progress";
  lead.escalation_needed = lead.escalation_needed ?? false;
  lead.missing_fields = ["name", "phone", "email"].filter(
    (field) => !lead[field as keyof ExtractedLead]
  );
  lead.intent = lead.intent ?? "test inquiry";
  lead.lead_score = lead.qualified ? 80 : 35;
  lead.follow_up_needed = !lead.qualified && !lead.escalation_needed;

  return lead;
}
