"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { saveCustomerIntakeByPortalToken } from "@/ai-employees/data/repository";
import { sendCustomerIntakeToN8n } from "@/ai-employees/integrations/n8n/client";

const intakeSchema = z.object({
  business_name: z.string().min(1),
  contact_name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  website: z.string().optional().default(""),
  industry: z.string().min(1),
  service_area: z.string().optional().default(""),
  services_offered: z.string().min(1),
  business_hours: z.string().optional().default(""),
  ideal_customer: z.string().optional().default(""),
  common_questions: z.string().optional().default(""),
  appointment_rules: z.string().optional().default(""),
  escalation_contacts: z.string().optional().default(""),
  tone_preferences: z.string().optional().default(""),
  disqualifying_rules: z.string().optional().default(""),
  ghl_notes: z.string().optional().default(""),
  launch_priority: z.enum(["standard", "soon", "urgent"])
});

export async function submitCustomerIntakeAction(
  portalToken: string,
  formData: FormData
) {
  const parsed = intakeSchema.parse(Object.fromEntries(formData));
  const requiredLeadFields = formData
    .getAll("required_lead_fields")
    .map(String)
    .map((field) => field.trim())
    .filter(Boolean);

  const intake = await saveCustomerIntakeByPortalToken(portalToken, {
    ...parsed,
    email: parsed.email.toLowerCase(),
    phone: parsed.phone || null,
    website: parsed.website || null,
    service_area: parsed.service_area || null,
    business_hours: parsed.business_hours || null,
    ideal_customer: parsed.ideal_customer || null,
    common_questions: parsed.common_questions || null,
    appointment_rules: parsed.appointment_rules || null,
    escalation_contacts: parsed.escalation_contacts || null,
    tone_preferences: parsed.tone_preferences || null,
    required_lead_fields: requiredLeadFields.length
      ? requiredLeadFields
      : ["name", "phone", "email"],
    disqualifying_rules: parsed.disqualifying_rules || null,
    ghl_notes: parsed.ghl_notes || null
  });

  try {
    await sendCustomerIntakeToN8n({
      event: "ai_employee.customer_intake_submitted",
      intake,
      portalPath: `/ai-employees/portal/${portalToken}`
    });
  } catch (error) {
    console.error("n8n intake notification failed", error);
  }

  revalidatePath(`/ai-employees/portal/${portalToken}`);
  revalidatePath(`/ai-employees/portal/${portalToken}/intake`);
  redirect(`/ai-employees/portal/${portalToken}?intake=submitted`);
}
