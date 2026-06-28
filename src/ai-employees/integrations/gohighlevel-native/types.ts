import type { AiEmployee, GhlAiAgentProfile, GhlAiAgentProfileInput } from "@/ai-employees/types";

export type GhlWorkflowEvent =
  | "lead_captured"
  | "lead_qualified"
  | "appointment_requested"
  | "appointment_booked"
  | "escalation_needed"
  | "follow_up_needed"
  | "conversation_inactive"
  | "no_response"
  | "human_takeover_requested";

export type GhlExportSection = {
  title: string;
  body: string;
};

export type GhlExportPackage = {
  title: string;
  sections: GhlExportSection[];
};

export type GhlProfileBuildInput = {
  employee: AiEmployee;
  profile?: GhlAiAgentProfile | GhlAiAgentProfileInput | null;
  discoveryComplete?: boolean;
};

export type GhlDeploymentChecklistItem = {
  label: string;
  ready: boolean;
};
