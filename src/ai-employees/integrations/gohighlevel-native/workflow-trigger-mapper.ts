import type { AiEmployee } from "@/ai-employees/types";
import type { GhlWorkflowEvent } from "@/ai-employees/integrations/gohighlevel-native/types";
import { aiEmployeeRoleBlueprints } from "@/ai-employees/role-blueprints";

export const ghlWorkflowEvents: Record<GhlWorkflowEvent, string> = {
  lead_captured: "Lead captured",
  lead_qualified: "Lead qualified",
  appointment_requested: "Appointment requested",
  appointment_booked: "Appointment booked",
  escalation_needed: "Escalation needed",
  follow_up_needed: "Follow-up needed",
  conversation_inactive: "Conversation inactive",
  no_response: "No response",
  human_takeover_requested: "Human takeover requested"
};

export function getRecommendedWorkflowTriggers(employee: AiEmployee) {
  const blueprint = aiEmployeeRoleBlueprints.find((item) => item.type === employee.type);

  return {
    events: ghlWorkflowEvents,
    suggestedWorkflowNames: Array.from(new Set([
      "AI Employee - New Lead Captured",
      "AI Employee - Qualified Lead",
      "AI Employee - Appointment Requested",
      "AI Employee - Escalation Needed",
      "AI Employee - No Response Follow-up",
      "AI Employee - Human Takeover",
      ...(blueprint?.ghl.workflows ?? [])
    ]))
  };
}
