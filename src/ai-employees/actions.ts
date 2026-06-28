"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertAiEmployeesAccess } from "@/ai-employees/auth";
import {
  createAiEmployee,
  createAppointmentRequest,
  createEscalation,
  getAiEmployeeDetail,
  saveExtractedLead,
  saveTestConversation,
  updateAiEmployee,
  updateAiEmployeeLeadStatus,
  updateAiEmployeeStatus,
  type AiEmployeeInput
} from "@/ai-employees/data/repository";
import { runAiEmployeeTestTurn } from "@/ai-employees/ai";
import type { ExtractedLead, TranscriptMessage } from "@/ai-employees/types";

const employeeSchema = z.object({
  name: z.string().min(1),
  type: z.enum([
    "AI Receptionist / Appointment Setter",
    "AI Website Concierge",
    "AI Lead Qualifier",
    "AI Customer Support Agent",
    "AI Follow-up Coordinator"
  ]),
  status: z.enum(["draft", "active", "paused", "archived"]),
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
  primary_goal: z.string().optional().default(""),
  ghl_location_id: z.string().optional().default(""),
  ghl_calendar_id: z.string().optional().default(""),
  ghl_pipeline_id: z.string().optional().default(""),
  ghl_opportunity_stage_id: z.string().optional().default(""),
  ghl_source_name: z.string().optional().default(""),
  ghl_enabled: z
    .union([z.literal("on"), z.literal("true"), z.literal("1")])
    .optional()
    .transform(Boolean)
});

export type TesterActionState = {
  conversationId?: string;
  transcript: TranscriptMessage[];
  extractedLead: ExtractedLead;
  status: "idle" | "in_progress" | "qualified" | "appointment_requested" | "escalated";
  error?: string;
  providerWarning?: string;
};

export async function createAiEmployeeAction(formData: FormData) {
  await assertAiEmployeesAccess();
  const employee = await createAiEmployee(parseEmployeeForm(formData));
  revalidatePath("/ai-employees");
  redirect(`/ai-employees/${employee.id}`);
}

export async function createOnboardingAiEmployeeAction(formData: FormData) {
  await assertAiEmployeesAccess();
  const employee = await createAiEmployee(parseEmployeeForm(formData));
  revalidatePath("/ai-employees");
  redirect(`/ai-employees/${employee.id}`);
}

export async function updateAiEmployeeAction(id: string, formData: FormData) {
  await assertAiEmployeesAccess();
  const employee = await updateAiEmployee(id, parseEmployeeForm(formData));
  revalidatePath("/ai-employees");
  revalidatePath(`/ai-employees/${id}`);
  redirect(`/ai-employees/${employee.id}`);
}

export async function pauseAiEmployeeAction(id: string) {
  await assertAiEmployeesAccess();
  await updateAiEmployeeStatus(id, "paused");
  revalidatePath("/ai-employees");
  revalidatePath(`/ai-employees/${id}`);
}

export async function activateAiEmployeeAction(id: string) {
  await assertAiEmployeesAccess();
  await updateAiEmployeeStatus(id, "active");
  revalidatePath("/ai-employees");
  revalidatePath(`/ai-employees/${id}`);
}

export async function archiveAiEmployeeAction(id: string) {
  await assertAiEmployeesAccess();
  await updateAiEmployeeStatus(id, "archived");
  revalidatePath("/ai-employees");
  revalidatePath(`/ai-employees/${id}`);
}

export async function archiveLeadAction(id: string) {
  await assertAiEmployeesAccess();
  await updateAiEmployeeLeadStatus(id, "archived");
  revalidatePath("/ai-employees");
  revalidatePath("/ai-employees/leads");
  revalidatePath(`/ai-employees/leads/${id}`);
}

export async function sendTestMessageAction(
  previousState: TesterActionState,
  formData: FormData
): Promise<TesterActionState> {
  await assertAiEmployeesAccess();
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

  const result = await runAiEmployeeTestTurn({
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
    status: result.status,
    providerWarning: result.providerWarning
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
