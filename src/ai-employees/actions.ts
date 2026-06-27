"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createAiEmployee,
  createAppointmentRequest,
  createEscalation,
  getAiEmployeeDetail,
  saveExtractedLead,
  saveTestConversation,
  updateAiEmployee,
  type AiEmployeeInput
} from "@/ai-employees/data/repository";
import { runReceptionistTestTurn } from "@/ai-employees/tester-engine";
import type { ExtractedLead, TranscriptMessage } from "@/ai-employees/types";

const employeeSchema = z.object({
  name: z.string().min(1),
  type: z.literal("AI Receptionist / Appointment Setter"),
  status: z.enum(["draft", "active", "paused"]),
  business_name: z.string().min(1),
  industry: z.string().min(1),
  business_phone: z.string().optional().default(""),
  business_email: z.string().optional().default(""),
  website: z.string().optional().default(""),
  services_offered: z.string().optional().default(""),
  service_area: z.string().optional().default(""),
  business_hours: z.string().optional().default(""),
  appointment_instructions: z.string().optional().default(""),
  escalation_email: z.string().optional().default(""),
  escalation_phone: z.string().optional().default(""),
  tone: z.string().optional().default(""),
  faqs: z.string().optional().default(""),
  disqualifying_rules: z.string().optional().default(""),
  required_lead_fields: z.string().min(1),
  primary_goal: z.string().optional().default("")
});

export type TesterActionState = {
  conversationId?: string;
  transcript: TranscriptMessage[];
  extractedLead: ExtractedLead;
  status: "idle" | "in_progress" | "qualified" | "appointment_requested" | "escalated";
  error?: string;
};

export async function createAiEmployeeAction(formData: FormData) {
  const employee = await createAiEmployee(parseEmployeeForm(formData));
  revalidatePath("/ai-employees");
  redirect(`/ai-employees/${employee.id}`);
}

export async function updateAiEmployeeAction(id: string, formData: FormData) {
  const employee = await updateAiEmployee(id, parseEmployeeForm(formData));
  revalidatePath("/ai-employees");
  revalidatePath(`/ai-employees/${id}`);
  redirect(`/ai-employees/${employee.id}`);
}

export async function sendTestMessageAction(
  previousState: TesterActionState,
  formData: FormData
): Promise<TesterActionState> {
  const employeeId = String(formData.get("employeeId") ?? "");
  const visitorMessage = String(formData.get("message") ?? "").trim();

  if (!visitorMessage) {
    return {
      ...previousState,
      error: "Enter a test visitor message."
    };
  }

  const detail = await getAiEmployeeDetail(employeeId);

  if (!detail) {
    return {
      ...previousState,
      error: "AI employee not found."
    };
  }

  const result = runReceptionistTestTurn({
    employee: detail.employee,
    visitorMessage,
    priorTranscript: previousState.transcript,
    priorLead: previousState.extractedLead
  });

  const conversation = await saveTestConversation({
    employee: detail.employee,
    conversationId: previousState.conversationId,
    transcript: result.transcript,
    extractedLead: result.extractedLead,
    status: result.status
  });

  const lead = await saveExtractedLead({
    employee: detail.employee,
    conversationId: conversation.id,
    lead: result.extractedLead
  });

  if (result.status === "appointment_requested" && result.extractedLead.preferred_time) {
    await createAppointmentRequest({
      employee: detail.employee,
      conversationId: conversation.id,
      leadId: lead?.id,
      requestedTime: result.extractedLead.preferred_time,
      notes: result.extractedLead.notes
    });
  }

  if (result.status === "escalated") {
    await createEscalation({
      employee: detail.employee,
      conversationId: conversation.id,
      leadId: lead?.id,
      reason: result.extractedLead.escalation_reason ?? "Escalation required.",
      message: visitorMessage
    });
  }

  revalidatePath(`/ai-employees/${employeeId}`);

  return {
    conversationId: conversation.id,
    transcript: result.transcript,
    extractedLead: result.extractedLead,
    status: result.status
  };
}

function parseEmployeeForm(formData: FormData): AiEmployeeInput {
  const parsed = employeeSchema.parse(Object.fromEntries(formData));

  return {
    ...parsed,
    required_lead_fields: parsed.required_lead_fields
      .split(/[,\n]/)
      .map((item) => item.trim())
      .filter(Boolean)
  };
}
