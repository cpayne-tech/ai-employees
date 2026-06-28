"use server";

import { revalidatePath } from "next/cache";
import { assertAiEmployeesAccess } from "@/ai-employees/auth";
import {
  createManualCustomer,
  updateCustomerSetupTaskStatus,
  updateCustomerStatus
} from "@/ai-employees/data/repository";
import { redirect } from "next/navigation";
import { z } from "zod";
import type {
  AiEmployeeCustomerLifecycleStatus,
  AiEmployeeCustomerOnboardingStatus,
  AiEmployeeCustomerSetupTaskStatus
} from "@/ai-employees/types";

const lifecycleStatuses = [
  "new",
  "paid_setup",
  "intake_needed",
  "in_setup",
  "ready_for_review",
  "live",
  "paused",
  "canceled"
] satisfies AiEmployeeCustomerLifecycleStatus[];

const onboardingStatuses = [
  "not_started",
  "intake_sent",
  "intake_received",
  "drafting",
  "review_ready",
  "approved",
  "live"
] satisfies AiEmployeeCustomerOnboardingStatus[];

const taskStatuses = [
  "not_started",
  "in_progress",
  "waiting_on_customer",
  "waiting_on_obmc",
  "done",
  "skipped"
] satisfies AiEmployeeCustomerSetupTaskStatus[];

const manualCustomerSchema = z.object({
  businessName: z.string().optional().default(""),
  contactName: z.string().optional().default(""),
  email: z.string().email(),
  phone: z.string().optional().default(""),
  website: z.string().optional().default(""),
  planId: z.enum(["starter", "growth", "scale", "manual"]),
  planName: z.string().optional().default(""),
  notes: z.string().optional().default("")
});

export async function createManualCustomerAction(formData: FormData) {
  await assertAiEmployeesAccess();
  const parsed = manualCustomerSchema.parse(Object.fromEntries(formData));
  const customer = await createManualCustomer({
    businessName: parsed.businessName,
    contactName: parsed.contactName,
    email: parsed.email,
    phone: parsed.phone,
    website: parsed.website,
    planId: parsed.planId,
    planName: parsed.planName,
    notes: parsed.notes
  });

  revalidatePath("/ai-employees/customers");
  redirect(`/ai-employees/customers/${customer.id}`);
}

export async function updateCustomerLifecycleAction(
  customerId: string,
  formData: FormData
) {
  await assertAiEmployeesAccess();
  const lifecycleStatus = parseOption(
    formData.get("lifecycle_status"),
    lifecycleStatuses
  );
  const onboardingStatus = parseOption(
    formData.get("onboarding_status"),
    onboardingStatuses
  );

  await updateCustomerStatus({
    customerId,
    lifecycleStatus,
    onboardingStatus
  });

  revalidatePath("/ai-employees/customers");
  revalidatePath(`/ai-employees/customers/${customerId}`);
}

export async function updateCustomerSetupTaskAction(
  customerId: string,
  taskId: string,
  formData: FormData
) {
  await assertAiEmployeesAccess();
  const taskStatus = parseOption(formData.get("task_status"), taskStatuses);
  await updateCustomerSetupTaskStatus(taskId, taskStatus);

  revalidatePath("/ai-employees/customers");
  revalidatePath(`/ai-employees/customers/${customerId}`);
}

function parseOption<T extends string>(
  value: FormDataEntryValue | null,
  options: readonly T[]
) {
  const text = String(value ?? "");
  if (!options.includes(text as T)) {
    throw new Error("Unsupported status value.");
  }

  return text as T;
}
