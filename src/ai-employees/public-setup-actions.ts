"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { billingPlans } from "@/ai-employees/billing";
import { createManualCustomer } from "@/ai-employees/data/repository";
import { sendSetupRequestToN8n } from "@/ai-employees/integrations/n8n/client";

const setupRequestSchema = z.object({
  businessName: z.string().trim().min(1, "Business name is required."),
  contactName: z.string().trim().min(1, "Your name is required."),
  email: z.string().trim().email("A valid email is required."),
  phone: z.string().trim().optional().default(""),
  website: z.string().trim().optional().default(""),
  planId: z.enum(["starter", "growth", "scale", "manual"]).default("growth"),
  timeline: z.enum(["soon", "this_month", "exploring"]).default("soon"),
  currentGhl: z.enum(["yes", "no", "not_sure"]).default("not_sure"),
  primaryNeed: z.string().trim().min(1, "Tell us what you want the AI employees to handle."),
  notes: z.string().trim().optional().default(""),
  companyUrl: z.string().trim().optional().default("")
});

export async function submitPublicSetupRequestAction(formData: FormData) {
  const parsed = setupRequestSchema.parse(Object.fromEntries(formData));

  // Honeypot: real visitors never see this field.
  if (parsed.companyUrl) {
    redirect("/setup-request-received");
  }

  const plan = billingPlans.find((item) => item.id === parsed.planId);
  const noteLines = [
    "Public setup request",
    `Timeline: ${formatOption(parsed.timeline)}`,
    `Uses GoHighLevel: ${formatOption(parsed.currentGhl)}`,
    `Primary need: ${parsed.primaryNeed}`,
    parsed.notes ? `Additional notes: ${parsed.notes}` : null
  ].filter(Boolean);

  const customer = await createManualCustomer({
    businessName: parsed.businessName,
    contactName: parsed.contactName,
    email: parsed.email,
    phone: parsed.phone || null,
    website: parsed.website || null,
    planId: parsed.planId,
    planName: plan?.name ?? "Manual review",
    notes: noteLines.join("\n")
  });

  try {
    await sendSetupRequestToN8n({
      event: "ai_employee.setup_request_created",
      customer,
      request: {
        timeline: parsed.timeline,
        currentGhl: parsed.currentGhl,
        primaryNeed: parsed.primaryNeed,
        notes: parsed.notes || null
      }
    });
  } catch (error) {
    console.error("n8n setup request notification failed", error);
  }

  revalidatePath("/ai-employees");
  revalidatePath("/ai-employees/customers");
  redirect("/setup-request-received");
}

function formatOption(value: string) {
  return value.replaceAll("_", " ");
}
