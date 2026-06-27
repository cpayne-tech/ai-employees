import type { AiEmployee } from "@/ai-employees/types";

export function buildBusinessContextPrompt(employee: AiEmployee) {
  return `Business context:
- AI employee name: ${employee.name}
- Business: ${employee.business_name}
- Industry: ${employee.industry}
- Phone: ${employee.business_phone || "Not provided"}
- Email: ${employee.business_email || "Not provided"}
- Website: ${employee.website || "Not provided"}
- Services: ${employee.services_offered || "Not provided"}
- Service area: ${employee.service_area || "Not provided"}
- Business hours: ${employee.business_hours || "Not provided"}
- Tone: ${employee.tone || "Professional and concise"}
- Primary goal: ${employee.primary_goal || "Capture a qualified lead and request an appointment."}
- FAQs and approved information: ${employee.faqs || "No FAQs provided."}`;
}
