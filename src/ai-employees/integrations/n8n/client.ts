import type {
  AiEmployee,
  AiEmployeeAppointment,
  AiEmployeeConversation,
  AiEmployeeCustomer,
  AiEmployeeCustomerIntake,
  AiEmployeeLead
} from "@/ai-employees/types";
import type { GhlLeadSyncResult } from "@/ai-employees/integrations/gohighlevel/types";

export type N8nConnectionStatus = {
  leadSync: "not_connected" | "ready";
  leadDiscovery: "not_connected" | "ready";
  setupRequest: "not_connected" | "ready";
  intakeLink: "not_connected" | "ready";
  intakeSubmitted: "not_connected" | "ready";
  purchaseWebhook: "not_connected" | "ready";
};

function getPublicBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_AI_EMPLOYEES_BASE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    "https://ai-employees-gamma.vercel.app"
  ).replace(/\/$/, "");
}

function getGhlLocationId() {
  return process.env.GHL_LOCATION_ID || process.env.GOHIGHLEVEL_LOCATION_ID || null;
}

export type N8nAiEmployeeEvent = {
  event: "ai_employee.lead_synced";
  employee: AiEmployee;
  lead: AiEmployeeLead;
  conversation?: AiEmployeeConversation | null;
  appointment?: AiEmployeeAppointment | null;
  ghl: GhlLeadSyncResult;
};

export type N8nSetupRequestEvent = {
  event: "ai_employee.setup_request_created";
  customer: AiEmployeeCustomer;
  request: {
    timeline: string;
    currentGhl: string;
    primaryNeed: string;
    notes?: string | null;
  };
};

export type N8nIntakeSubmittedEvent = {
  event: "ai_employee.customer_intake_submitted";
  intake: AiEmployeeCustomerIntake;
  portalPath: string;
};

export type N8nIntakeLinkEvent = {
  event: "ai_employee.send_intake_link";
  customer: AiEmployeeCustomer;
  portalPath: string;
};

export function getN8nStatus(): N8nConnectionStatus {
  return {
    leadSync: process.env.N8N_WEBHOOK_URL ? "ready" : "not_connected",
    leadDiscovery: process.env.N8N_LEAD_DISCOVERY_WEBHOOK_URL ? "ready" : "not_connected",
    setupRequest: process.env.N8N_SETUP_REQUEST_WEBHOOK_URL ? "ready" : "not_connected",
    intakeLink: process.env.N8N_INTAKE_LINK_WEBHOOK_URL ? "ready" : "not_connected",
    intakeSubmitted: process.env.N8N_INTAKE_SUBMITTED_WEBHOOK_URL ? "ready" : "not_connected",
    purchaseWebhook: process.env.N8N_PURCHASE_WEBHOOK_URL ? "ready" : "not_connected"
  };
}

export async function sendAiEmployeeEventToN8n(input: N8nAiEmployeeEvent) {
  return sendN8nWebhook(process.env.N8N_WEBHOOK_URL, "N8N_WEBHOOK_URL", input);
}

export async function sendSetupRequestToN8n(input: N8nSetupRequestEvent) {
  return sendN8nWebhook(
    process.env.N8N_SETUP_REQUEST_WEBHOOK_URL,
    "N8N_SETUP_REQUEST_WEBHOOK_URL",
    {
      ...input,
      portal_path: `/ai-employees/portal/${input.customer.portal_token}`
    }
  );
}

export async function sendCustomerIntakeToN8n(input: N8nIntakeSubmittedEvent) {
  return sendN8nWebhook(
    process.env.N8N_INTAKE_SUBMITTED_WEBHOOK_URL,
    "N8N_INTAKE_SUBMITTED_WEBHOOK_URL",
    input
  );
}

export async function sendIntakeLinkRequestToN8n(input: N8nIntakeLinkEvent) {
  return sendN8nWebhook(
    process.env.N8N_INTAKE_LINK_WEBHOOK_URL,
    "N8N_INTAKE_LINK_WEBHOOK_URL",
    input
  );
}

async function sendN8nWebhook(
  webhookUrl: string | undefined,
  envName: string,
  payload: object
) {
  if (!webhookUrl) {
    return { skipped: true, reason: `${envName} is not configured.` };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      ...getAuthHeader()
    }),
    body: JSON.stringify({
      ...payload,
      sent_at: new Date().toISOString(),
      source_app: "OBMC AI Employees",
      public_base_url: getPublicBaseUrl(),
      ghl_location_id: getGhlLocationId()
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`n8n webhook returned ${response.status}: ${text.slice(0, 180)}`);
  }

  return { skipped: false };
}

function getAuthHeader(): Record<string, string> {
  const secret = process.env.N8N_WEBHOOK_SECRET;

  if (!secret) {
    return {};
  }

  return {
    Authorization: `Bearer ${secret}`
  };
}
