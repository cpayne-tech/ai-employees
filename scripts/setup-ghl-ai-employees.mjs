#!/usr/bin/env node

const locationId = process.env.GHL_LOCATION_ID || process.env.GOHIGHLEVEL_LOCATION_ID;
const apiKey = process.env.GHL_API_KEY || process.env.GOHIGHLEVEL_API_KEY;
const baseUrl = process.env.GHL_API_BASE_URL || "https://services.leadconnectorhq.com";

const requiredTags = [
  "OBMC AI - Employee Lead",
  "OBMC AI - Follow-up Needed",
  "OBMC AI - Appointment Requested",
  "OBMC AI - Qualified",
  "OBMC AI - Escalation Needed",
  "OBMC AI - Human Takeover Requested",
  "OBMC AI - Support Request"
];

const requiredCustomFields = [
  { name: "OBMC AI - Lead Intent", fieldKey: "obmc_ai_lead_intent" },
  { name: "OBMC AI - Service Needed", fieldKey: "obmc_ai_service_needed" },
  { name: "OBMC AI - Conversation Summary", fieldKey: "obmc_ai_conversation_summary" },
  { name: "OBMC AI - Follow-up Status", fieldKey: "obmc_ai_follow_up_status" },
  { name: "OBMC AI - Preferred Appointment Time", fieldKey: "obmc_ai_preferred_appointment_time" },
  { name: "OBMC AI - Urgency", fieldKey: "obmc_ai_urgency" },
  { name: "OBMC AI - Qualification Status", fieldKey: "obmc_ai_qualification_status" },
  { name: "OBMC AI - Escalation Needed", fieldKey: "obmc_ai_escalation_needed" },
  { name: "OBMC AI - Escalation Reason", fieldKey: "obmc_ai_escalation_reason" },
  { name: "OBMC AI - Last AI Touchpoint", fieldKey: "obmc_ai_last_ai_touchpoint" }
];

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

async function main() {
  if (!locationId) {
    throw new Error("Missing GHL_LOCATION_ID or GOHIGHLEVEL_LOCATION_ID.");
  }

  if (!apiKey) {
    throw new Error("Missing GHL_API_KEY or GOHIGHLEVEL_API_KEY.");
  }

  const tagResults = await ensureTags();
  const customFieldResults = await ensureCustomFields();

  console.log(JSON.stringify({
    locationId,
    tags: tagResults,
    customFields: customFieldResults
  }, null, 2));
}

async function ensureTags() {
  const existing = await request(`/locations/${locationId}/tags`);
  const existingTags = normalizeArray(existing.tags ?? existing);
  const existingNames = new Set(existingTags.map((tag) => String(tag.name ?? "").toLowerCase()));
  const results = [];

  for (const name of requiredTags) {
    if (existingNames.has(name.toLowerCase())) {
      results.push({ name, status: "existing" });
      continue;
    }

    const created = await request(`/locations/${locationId}/tags`, {
      method: "POST",
      body: { name }
    });

    results.push({
      name,
      status: "created",
      id: created.id ?? created.tag?.id ?? null
    });
  }

  return results;
}

async function ensureCustomFields() {
  const existing = await request(`/locations/${locationId}/customFields`);
  const existingFields = normalizeArray(existing.customFields ?? existing.fields ?? existing);
  const existingNames = new Set(existingFields.map((field) => String(field.name ?? "").toLowerCase()));
  const results = [];

  for (const field of requiredCustomFields) {
    if (existingNames.has(field.name.toLowerCase())) {
      results.push({ name: field.name, status: "existing" });
      continue;
    }

    const created = await request(`/locations/${locationId}/customFields`, {
      method: "POST",
      body: {
        name: field.name,
        dataType: "TEXT",
        placeholder: field.name,
        fieldKey: field.fieldKey
      }
    });

    results.push({
      name: field.name,
      status: "created",
      id: created.id ?? created.customField?.id ?? null
    });
  }

  return results;
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: "2021-07-28",
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const text = await response.text();
  const payload = text ? safeJson(text) : {};

  if (!response.ok) {
    throw new Error(`${options.method ?? "GET"} ${path} failed (${response.status}): ${text}`);
  }

  return payload;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
