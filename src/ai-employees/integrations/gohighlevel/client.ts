import {
  mapAiConversationToGhlNote,
  mapAiLeadToGhlContact,
  mapAiLeadToGhlOpportunity
} from "@/ai-employees/integrations/gohighlevel/mapper";
import type {
  GhlConnectionStatus,
  GhlLeadSyncResult,
  GhlMappingInput,
  GhlPreparedContact,
  GhlPreparedNote,
  GhlPreparedOpportunity
} from "@/ai-employees/integrations/gohighlevel/types";

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

export async function syncAiLeadToGoHighLevel(
  input: GhlMappingInput
): Promise<GhlLeadSyncResult> {
  if (!input.employee.ghl_enabled) {
    throw new Error("GoHighLevel mapping is not enabled for this AI employee.");
  }

  const contact = mapAiLeadToGhlContact(input);

  if (!contact) {
    throw new Error("A captured lead is required before syncing to GoHighLevel.");
  }

  const contactId = await upsertContact(contact);
  const note = mapAiConversationToGhlNote(input);

  if (contact.tags.length) {
    await addContactTags(contactId, contact.tags);
  }

  const noteId = note ? await createContactNote(contactId, note) : null;
  const opportunity = mapAiLeadToGhlOpportunity(input);
  const opportunityId = opportunity?.pipelineId && opportunity.stageId
    ? await createOrUpdateOpportunity(contactId, opportunity)
    : null;

  return {
    contactId,
    opportunityId,
    noteId
  };
}

function getGhlConfig() {
  const apiKey = process.env.GHL_API_KEY || process.env.GOHIGHLEVEL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID || process.env.GOHIGHLEVEL_LOCATION_ID;
  const baseUrl = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";

  if (!apiKey || !locationId) {
    throw new Error("GoHighLevel API key and location ID are required for live sync.");
  }

  return {
    apiKey,
    locationId,
    baseUrl: baseUrl.replace(/\/$/, "")
  };
}

async function upsertContact(contact: GhlPreparedContact) {
  const { locationId } = getGhlConfig();
  const response = await ghlRequest("/contacts/upsert", {
    method: "POST",
    body: {
      locationId,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email || undefined,
      phone: contact.phone || undefined,
      source: contact.source,
      tags: contact.tags
    }
  });
  const contactId = readId(response, ["contact.id", "contactId", "id"]);

  if (!contactId) {
    throw new Error("GoHighLevel did not return a contact ID.");
  }

  return contactId;
}

async function addContactTags(contactId: string, tags: string[]) {
  await ghlRequest(`/contacts/${contactId}/tags`, {
    method: "POST",
    body: { tags }
  });
}

async function createContactNote(contactId: string, note: GhlPreparedNote) {
  const response = await ghlRequest(`/contacts/${contactId}/notes`, {
    method: "POST",
    body: { body: note.body }
  });

  return readId(response, ["note.id", "id"]);
}

async function createOrUpdateOpportunity(
  contactId: string,
  opportunity: GhlPreparedOpportunity
) {
  const { locationId } = getGhlConfig();
  const endpoint = "/opportunities/upsert";
  const response = await ghlRequest(endpoint, {
    method: "POST",
    body: {
      locationId,
      contactId,
      pipelineId: opportunity.pipelineId,
      pipelineStageId: opportunity.stageId,
      name: opportunity.title,
      status: normalizeOpportunityStatus(opportunity.status)
    }
  });

  return readId(response, ["opportunity.id", "opportunityId", "id"]);
}

async function ghlRequest(
  path: string,
  options: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: Record<string, unknown> } = {}
) {
  const { apiKey, baseUrl } = getGhlConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: "2021-07-28",
      Accept: "application/json",
      "Content-Type": "application/json"
    },
    body: options.body ? JSON.stringify(stripUndefined(options.body)) : undefined,
    cache: "no-store"
  });

  const text = await response.text();
  const data = text ? parseJson(text) : null;

  if (!response.ok) {
    const message = readString(data, ["message", "error", "msg"]) ?? response.statusText;
    throw new Error(`GoHighLevel API ${response.status}: ${message}`);
  }

  return data;
}

function stripUndefined(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => entry !== undefined && entry !== "")
  );
}

function parseJson(text: string) {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return { raw: text };
  }
}

function readId(value: unknown, paths: string[]) {
  return readString(value, paths);
}

function readString(value: unknown, paths: string[]) {
  for (const path of paths) {
    const found = readPath(value, path);
    if (typeof found === "string" && found.trim()) {
      return found;
    }
  }

  return null;
}

function readPath(value: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (!current || typeof current !== "object" || !(key in current)) {
      return undefined;
    }

    return (current as Record<string, unknown>)[key];
  }, value);
}

function normalizeOpportunityStatus(status?: string) {
  if (status === "qualified" || status === "appointment_requested") {
    return "open";
  }

  if (status === "unqualified") {
    return "lost";
  }

  return "open";
}
