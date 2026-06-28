import type { AiEmployee, GhlAiAgentProfile } from "@/ai-employees/types";
import type { GhlExportPackage } from "@/ai-employees/integrations/gohighlevel-native/types";
import { aiEmployeeRoleBlueprints } from "@/ai-employees/role-blueprints";
import { buildDefaultGhlAiAgentProfile } from "@/ai-employees/integrations/gohighlevel-native/agent-profile-builder";

export function buildGhlPromptExportPackage(
  employee: AiEmployee,
  savedProfile?: GhlAiAgentProfile | null
): GhlExportPackage {
  const profile = savedProfile ?? buildDefaultGhlAiAgentProfile(employee);
  const blueprint = aiEmployeeRoleBlueprints.find((item) => item.type === employee.type);

  return {
    title: `${profile.profile_name} Export Package`,
    sections: [
      { title: "Agent Name", body: profile.profile_name },
      { title: "Agent Objective", body: profile.objective ?? "" },
      { title: "Personality / Tone", body: profile.personality ?? "" },
      { title: "Full Instructions", body: profile.instructions ?? "" },
      { title: "Business Context", body: profile.knowledge_summary ?? "" },
      { title: "Lead Capture Fields", body: toBlock(profile.lead_capture_fields) },
      { title: "Qualification Rules", body: toBlock(profile.qualification_rules) },
      { title: "Booking Rules", body: toBlock(profile.booking_rules) },
      { title: "Escalation Rules", body: toBlock(profile.escalation_rules) },
      { title: "Workflow Trigger Notes", body: toBlock(profile.workflow_triggers) },
      { title: "Pipeline Mapping Notes", body: toBlock(profile.pipeline_mapping) },
      { title: "Calendar Mapping Notes", body: toBlock(profile.calendar_mapping) },
      {
        title: "Human Handoff Rules",
        body: toBlock(blueprint?.ghl.humanHandoffRules ?? [])
      },
      {
        title: "Compliance / Safety Rules",
        body: [
          "Never claim to be human.",
          "Do not invent company policies, pricing, guarantees, availability, or credentials.",
          "Do not answer outside supplied business information.",
          "Ask one question at a time.",
          "Escalate low-confidence, legal, medical, financial, emergency, angry, or unclear-pricing requests."
        ].join("\n")
      },
      {
        title: "Testing Script",
        body: [
          "1. Send a greeting from the selected GHL channel.",
          "2. Ask about a service or next step.",
          "3. Provide name, phone, and email.",
          "4. Ask for appointment availability.",
          "5. Ask an out-of-scope or human-needed question.",
          "6. Confirm tags, fields, opportunity stage, workflow trigger, and handoff behavior."
        ].join("\n")
      }
    ]
  };
}

function toBlock(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => `- ${String(item)}`).join("\n");
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value, null, 2);
  }

  return String(value ?? "");
}
