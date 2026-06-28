import type {
  AiEmployee,
  AiEmployeeAppointment,
  AiEmployeeConversation,
  AiEmployeeLead
} from "@/ai-employees/types";

export type GhlConnectionStatus = "not_connected" | "credentials_present" | "ready_for_test";

export type GhlMappingInput = {
  employee: AiEmployee;
  lead?: AiEmployeeLead | null;
  appointment?: AiEmployeeAppointment | null;
  conversation?: AiEmployeeConversation | null;
};

export type GhlPreparedContact = {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
  source: string;
  tags: string[];
};

export type GhlPreparedAppointmentIntent = {
  calendarId?: string;
  requestedTime?: string;
  notes?: string | null;
};

export type GhlPreparedNote = {
  body: string;
};

export type GhlPreparedOpportunity = {
  pipelineId?: string;
  stageId?: string;
  status?: string;
  title: string;
};
