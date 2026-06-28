import type { AiEmployee } from "@/ai-employees/types";
import { aiEmployeeRoleBlueprints } from "@/ai-employees/role-blueprints";

export function getRecommendedCalendarMapping(employee: AiEmployee) {
  const blueprint = aiEmployeeRoleBlueprints.find((item) => item.type === employee.type);

  return {
    calendar_id: employee.ghl_calendar_id,
    behavior: blueprint?.ghl.calendarBehavior ?? "Collect preferred appointment time and let GoHighLevel confirm availability.",
    booking_language: "I can request that time for you. A team member or the calendar workflow will confirm availability.",
    not_ready_language: "No problem. I can answer a quick question or capture the best way to follow up."
  };
}
