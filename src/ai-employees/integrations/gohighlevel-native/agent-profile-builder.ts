import type { AiEmployee, GhlAiAgentProfileInput } from "@/ai-employees/types";
import { buildRoleSpecificPrompt } from "@/ai-employees/ai/prompts";
import { aiEmployeeRoleBlueprints } from "@/ai-employees/role-blueprints";
import { getRecommendedCalendarMapping } from "@/ai-employees/integrations/gohighlevel-native/calendar-mapper";
import { getRecommendedCustomFields } from "@/ai-employees/integrations/gohighlevel-native/custom-field-mapper";
import { getRecommendedPipelineMapping } from "@/ai-employees/integrations/gohighlevel-native/pipeline-mapper";
import { getRecommendedWorkflowTriggers } from "@/ai-employees/integrations/gohighlevel-native/workflow-trigger-mapper";

export function buildDefaultGhlAiAgentProfile(employee: AiEmployee): GhlAiAgentProfileInput {
  const blueprint = aiEmployeeRoleBlueprints.find((item) => item.type === employee.type);

  return {
    ai_employee_id: employee.id,
    workspace_id: null,
    profile_name: `${employee.name} - GHL Agent Profile`,
    ghl_location_id: employee.ghl_location_id || null,
    ghl_agent_id: null,
    ghl_channel: blueprint?.ghl.recommendedChannel ?? "Multi-channel",
    objective: employee.primary_goal || blueprint?.outcome || "Capture the next best step in GoHighLevel.",
    personality: employee.tone || "Helpful, concise, professional, and clear that it is an AI employee.",
    instructions: buildRoleSpecificPrompt(employee),
    knowledge_summary: [
      `Business: ${employee.business_name}`,
      `Industry: ${employee.industry}`,
      `Services: ${employee.services_offered || "Not provided"}`,
      `FAQs: ${employee.faqs || "Not provided"}`,
      `Service area: ${employee.service_area || "Not provided"}`
    ].join("\n"),
    lead_capture_fields: getRecommendedCustomFields(employee),
    qualification_rules: {
      qualifying_questions: ["What are you looking for help with?", "How soon do you need help?", "What is the best way to reach you?"],
      disqualifying_answers: employee.disqualifying_rules || "Escalate unclear, out-of-scope, or policy-sensitive requests.",
      lead_score_rules: "Hot = clear intent plus contact info. Warm = interested but missing details. Cold = low intent or not ready.",
      create_opportunity_when: "Required contact fields and service intent are captured."
    },
    escalation_rules: {
      handoff_when: blueprint?.ghl.humanHandoffRules ?? [],
      urgent_language: ["emergency", "urgent", "complaint", "angry", "manager", "human"],
      low_confidence: "Escalate when the answer is outside supplied business information."
    },
    booking_rules: {
      appointment_goal: employee.appointment_instructions || "Collect preferred time and request confirmation through GoHighLevel.",
      calendar_mapping: getRecommendedCalendarMapping(employee),
      if_user_requests_time: "Capture preferred time. Do not confirm the appointment.",
      if_user_not_ready: "Offer to answer one more question or capture follow-up details."
    },
    workflow_triggers: getRecommendedWorkflowTriggers(employee),
    pipeline_mapping: getRecommendedPipelineMapping(employee),
    calendar_mapping: getRecommendedCalendarMapping(employee),
    deployment_status: "draft"
  };
}
