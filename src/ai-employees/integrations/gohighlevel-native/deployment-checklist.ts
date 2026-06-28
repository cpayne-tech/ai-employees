import type { GhlProfileBuildInput, GhlDeploymentChecklistItem } from "@/ai-employees/integrations/gohighlevel-native/types";

export function buildGhlDeploymentChecklist(input: GhlProfileBuildInput): GhlDeploymentChecklistItem[] {
  const profile = input.profile;

  return [
    { label: "Read-only GoHighLevel discovery complete", ready: Boolean(input.discoveryComplete) },
    { label: "Profile complete", ready: Boolean(profile?.profile_name && profile.objective && profile.personality) },
    { label: "Instructions complete", ready: Boolean(profile?.instructions && profile.instructions.length > 80) },
    { label: "Lead fields configured", ready: Boolean(profile?.lead_capture_fields?.length) },
    { label: "Escalation rules configured", ready: hasObjectValues(profile?.escalation_rules) },
    { label: "Workflow triggers mapped", ready: hasObjectValues(profile?.workflow_triggers) },
    { label: "Pipeline mapping ready", ready: hasObjectValues(profile?.pipeline_mapping) },
    { label: "Calendar mapping ready", ready: hasObjectValues(profile?.calendar_mapping) },
    { label: "GHL location connected", ready: Boolean(profile?.ghl_location_id || input.employee.ghl_location_id) },
    {
      label: "Ready for safe GoHighLevel configuration plan",
      ready: Boolean(input.discoveryComplete) && profile?.deployment_status !== "draft" && Boolean(profile?.instructions)
    }
  ];
}

function hasObjectValues(value: unknown) {
  return Boolean(value && typeof value === "object" && Object.keys(value).length > 0);
}
