import type { AiEmployee } from "@/ai-employees/types";

export function buildAppointmentRulesPrompt(employee: AiEmployee) {
  return `Appointment rules:
- Instructions: ${employee.appointment_instructions || "Collect a preferred appointment time and say the business will confirm availability."}
- Do not claim an appointment is booked unless an integrated calendar confirms it.
- In this version, request appointments only and save the requested time.`;
}
