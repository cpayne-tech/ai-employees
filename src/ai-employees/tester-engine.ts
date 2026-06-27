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
  age_range: "What age range should the team include with the appointment request?",
  state: "What state are you located in?",
  coverage_goal: "What goal should the team understand before the appointment?",
  preferred_time: "What day and time would you prefer for the consultation?"
};

const escalationPatterns = [
  {
    pattern: /\b(human|agent|person|representative|manager|call me)\b/i,
    reason: "Visitor requested a human."
  },
  {
    pattern: /\b(price|quote|premium|how much|cost)\b/i,
    reason: "Visitor asked for pricing or quote information."
  },
  {
    pattern: /\b(underwriting|medical condition|diabetes|cancer|diagnosis)\b/i,
    reason: "Visitor asked about medical underwriting or licensed guidance."
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
  const state = message.match(/\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|IA|ID|IL|IN|KS|KY|LA|MA|MD|ME|MI|MN|MO|MS|MT|NC|ND|NE|NH|NJ|NM|NV|NY|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VA|VT|WA|WI|WV|WY)\b/i)?.[0];
  const ageRange = message.match(/\b(?:18-24|25-34|35-44|45-54|55-64|65\+|\d{2}\s?(?:to|-)\s?\d{2})\b/i)?.[0];
  const preferredTime = message.match(
    /\b(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week|morning|afternoon|evening|at\s+\d{1,2}(?::\d{2})?\s?(?:am|pm)?)\b.*$/i
  )?.[0];
  const coverageGoal = message.match(
    /\b(?:need|want|looking for|interested in|help with|service for|appointment for)\s+([^.?!]+)/i
  )?.[0];
  const name = message.match(/\b(?:my name is|i am|i'm|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\b/)?.[1];

  if (email) {
    lead.email = email;
  }
  if (phone) {
    lead.phone = phone;
  }
  if (state) {
    lead.state = state.toUpperCase();
  }
  if (ageRange) {
    lead.age_range = ageRange;
  }
  if (preferredTime) {
    lead.preferred_time = preferredTime.trim();
  }
  if (coverageGoal) {
    lead.coverage_goal = coverageGoal.trim();
    lead.service_needed = coverageGoal.trim();
  }
  if (name) {
    lead.name = name;
  }

  lead.notes = [lead.notes, message].filter(Boolean).join("\n").slice(-1200);
  lead.qualified = Boolean(
    lead.name && lead.email && lead.phone && !lead.escalation_needed
  );
  lead.escalation_needed = lead.escalation_needed ?? false;

  return lead;
}
