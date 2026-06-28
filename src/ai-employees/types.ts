export type AiEmployeeStatus = "draft" | "active" | "paused" | "archived";
export type GhlDeploymentStatus =
  | "draft"
  | "ready_for_review"
  | "exported"
  | "connected"
  | "needs_update";

export type GhlDiscoveryStatus =
  | "not_started"
  | "in_progress"
  | "discovered"
  | "blocked"
  | "needs_review";

export type GhlResourceType =
  | "agency"
  | "location"
  | "phone_number"
  | "email_provider"
  | "calendar"
  | "calendar_group"
  | "pipeline"
  | "pipeline_stage"
  | "custom_field"
  | "tag"
  | "smart_list"
  | "workflow"
  | "workflow_folder"
  | "form"
  | "survey"
  | "ai_agent"
  | "conversation_ai"
  | "voice_ai"
  | "conversation_channel"
  | "ai_setting"
  | "unknown";

export type GhlDiscoveredResource = {
  name: string;
  type: GhlResourceType;
  resource_id: string | null;
  status: string | null;
  purpose: string | null;
  used_by: string | null;
  notes: string | null;
};

export type GhlGapStatus = "existing" | "missing" | "unknown" | "conflict" | "skipped";

export type GhlGapAnalysisItem = {
  requirement: string;
  resource_type: GhlResourceType;
  status: GhlGapStatus;
  existing_resource_id: string | null;
  reusable_resource_name: string | null;
  recommended_action: string;
  notes: string | null;
};

export type AiEmployeeType =
  | "AI Receptionist / Appointment Setter"
  | "AI Website Concierge"
  | "AI Lead Qualifier"
  | "AI Customer Support Agent"
  | "AI Follow-up Coordinator";

export type TranscriptMessage = {
  role: "visitor" | "assistant" | "system";
  content: string;
  createdAt: string;
};

export type ExtractedLead = {
  name?: string;
  email?: string;
  phone?: string;
  service_needed?: string;
  preferred_time?: string;
  urgency?: string;
  intent?: string;
  notes?: string;
  qualified?: boolean;
  qualification_status?: string;
  missing_fields?: string[];
  lead_score?: number;
  escalation_needed?: boolean;
  escalation_reason?: string;
  appointment_requested?: boolean;
  follow_up_needed?: boolean;
  follow_up_status?: string;
};

export type AiEmployee = {
  id: string;
  owner_id: string;
  name: string;
  type: AiEmployeeType;
  status: AiEmployeeStatus;
  business_name: string;
  industry: string;
  business_phone: string;
  business_email: string;
  website: string;
  services_offered: string;
  service_area: string;
  business_hours: string;
  appointment_instructions: string;
  escalation_email: string;
  escalation_phone: string;
  tone: string;
  faqs: string;
  disqualifying_rules: string;
  required_lead_fields: string[];
  primary_goal: string;
  ghl_location_id: string;
  ghl_calendar_id: string;
  ghl_pipeline_id: string;
  ghl_opportunity_stage_id: string;
  ghl_source_name: string;
  ghl_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type GhlAiAgentProfile = {
  id: string;
  owner_id: string;
  workspace_id: string | null;
  ai_employee_id: string;
  profile_name: string;
  ghl_location_id: string | null;
  ghl_agent_id: string | null;
  ghl_channel: string | null;
  objective: string | null;
  personality: string | null;
  instructions: string | null;
  knowledge_summary: string | null;
  lead_capture_fields: string[];
  qualification_rules: Record<string, unknown>;
  escalation_rules: Record<string, unknown>;
  booking_rules: Record<string, unknown>;
  workflow_triggers: Record<string, unknown>;
  pipeline_mapping: Record<string, unknown>;
  calendar_mapping: Record<string, unknown>;
  deployment_status: GhlDeploymentStatus;
  last_exported_at: string | null;
  created_at: string;
  updated_at: string;
};

export type GhlAiAgentProfileInput = Omit<
  GhlAiAgentProfile,
  "id" | "owner_id" | "created_at" | "updated_at" | "last_exported_at"
> & {
  id?: string;
  last_exported_at?: string | null;
};

export type GhlDiscoveryReport = {
  id: string;
  owner_id: string;
  location_id: string | null;
  account_name: string | null;
  source: "browser" | "api" | "manual" | "import";
  status: GhlDiscoveryStatus;
  inventory: GhlDiscoveredResource[];
  gap_analysis: GhlGapAnalysisItem[];
  blocked_reason: string | null;
  notes: string | null;
  discovered_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AiEmployeeSummary = AiEmployee & {
  total_leads: number;
  total_conversations: number;
  total_appointments: number;
  total_escalations: number;
  last_active_at: string | null;
};

export type AiEmployeeConversation = {
  id: string;
  ai_employee_id: string;
  owner_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_phone: string | null;
  status: string;
  mode: "test" | "live";
  transcript: TranscriptMessage[];
  extracted_lead: ExtractedLead;
  summary: string | null;
  created_at: string;
  updated_at: string;
};

export type AiEmployeeLead = {
  id: string;
  ai_employee_id: string;
  conversation_id: string;
  owner_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  service_needed: string | null;
  preferred_time: string | null;
  status: string;
  source: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AiEmployeeAppointment = {
  id: string;
  ai_employee_id: string;
  conversation_id: string;
  lead_id: string | null;
  owner_id: string;
  requested_time: string;
  appointment_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AiEmployeeEscalation = {
  id: string;
  ai_employee_id: string;
  conversation_id: string;
  lead_id: string | null;
  owner_id: string;
  reason: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type AiEmployeeDetail = {
  employee: AiEmployeeSummary;
  conversations: AiEmployeeConversation[];
  leads: AiEmployeeLead[];
  appointments: AiEmployeeAppointment[];
  escalations: AiEmployeeEscalation[];
};
