import type { AiEmployee } from "@/ai-employees/types";
import { aiEmployeeRoleBlueprints } from "@/ai-employees/role-blueprints";

export function getRecommendedPipelineMapping(employee: AiEmployee) {
  const blueprint = aiEmployeeRoleBlueprints.find((item) => item.type === employee.type);

  return {
    pipeline_id: employee.ghl_pipeline_id,
    stage_new_lead: "New Lead",
    stage_qualified_lead: "Qualified Lead",
    stage_appointment_requested: "Appointment Requested",
    stage_appointment_booked: "Appointment Booked",
    stage_closed_lost: "Closed/Lost",
    recommended_stages: blueprint?.ghl.pipelineStages ?? []
  };
}
