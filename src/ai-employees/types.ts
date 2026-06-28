export type AiEmployeeStatus = "draft" | "active" | "paused" | "archived";

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
