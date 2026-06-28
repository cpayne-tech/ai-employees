import type {
  AiEmployee,
  AiEmployeeAppointment,
  AiEmployeeConversation,
  AiEmployeeLead
} from "@/ai-employees/types";
import type { GhlLeadSyncResult } from "@/ai-employees/integrations/gohighlevel/types";

export type N8nConnectionStatus = {
  leadSync: "not_connected" | "ready";
  leadDiscovery: "not_connected" | "ready";
  purchaseWebhook: "not_connected" | "ready";
};

export type N8nAiEmployeeEvent = {
  event: "ai_employee.lead_synced";
  employee: AiEmployee;
  lead: AiEmployeeLead;
  conversation?: AiEmployeeConversation | null;
  appointment?: AiEmployeeAppointment | null;
  ghl: GhlLeadSyncResult;
};

export function getN8nStatus(): N8nConnectionStatus {
  return {
    leadSync: process.env.N8N_WEBHOOK_URL ? "ready" : "not_connected",
    leadDiscovery: process.env.N8N_LEAD_DISCOVERY_WEBHOOK_URL ? "ready" : "not_connected",
    purchaseWebhook: process.env.N8N_PURCHASE_WEBHOOK_URL ? "ready" : "not_connected"
  };
}

export async function sendAiEmployeeEventToN8n(input: N8nAiEmployeeEvent) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    return { skipped: true, reason: "N8N_WEBHOOK_URL is not configured." };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: new Headers({
      "Content-Type": "application/json",
      ...getAuthHeader()
    }),
    body: JSON.stringify({
      ...input,
      sent_at: new Date().toISOString(),
      source_app: "OBMC AI Employees"
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
