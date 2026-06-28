import type { GhlConnectionStatus } from "@/ai-employees/integrations/gohighlevel/types";

export function getGoHighLevelStatus(): GhlConnectionStatus {
  const hasApiKey = Boolean(process.env.GHL_API_KEY || process.env.GOHIGHLEVEL_API_KEY);
  const hasLocation = Boolean(process.env.GHL_LOCATION_ID || process.env.GOHIGHLEVEL_LOCATION_ID);

  if (hasApiKey && hasLocation) {
    return "ready_for_test";
  }

  if (hasApiKey || hasLocation) {
    return "credentials_present";
  }

  return "not_connected";
}

export function assertGoHighLevelSendingDisabled() {
  throw new Error("GoHighLevel live sending is intentionally disabled until explicitly activated.");
}
