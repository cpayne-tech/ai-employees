import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import type {
  GhlAiAgentProfile,
  GhlAiAgentProfileInput,
  GhlDeploymentStatus
} from "@/ai-employees/types";
import { demoOwnerId } from "@/ai-employees/data/seed";
import { readDevStore, writeDevStore } from "@/ai-employees/data/dev-store";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const ownerId = () => process.env.AI_EMPLOYEES_OWNER_ID ?? demoOwnerId;

function now() {
  return new Date().toISOString();
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  return [];
}

function parseObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function normalizeProfile(row: Record<string, unknown>): GhlAiAgentProfile {
  return {
    ...(row as unknown as GhlAiAgentProfile),
    workspace_id: row.workspace_id ? String(row.workspace_id) : null,
    ghl_location_id: row.ghl_location_id ? String(row.ghl_location_id) : null,
    ghl_agent_id: row.ghl_agent_id ? String(row.ghl_agent_id) : null,
    ghl_channel: row.ghl_channel ? String(row.ghl_channel) : null,
    objective: row.objective ? String(row.objective) : null,
    personality: row.personality ? String(row.personality) : null,
    instructions: row.instructions ? String(row.instructions) : null,
    knowledge_summary: row.knowledge_summary ? String(row.knowledge_summary) : null,
    lead_capture_fields: parseStringArray(row.lead_capture_fields),
    qualification_rules: parseObject(row.qualification_rules),
    escalation_rules: parseObject(row.escalation_rules),
    booking_rules: parseObject(row.booking_rules),
    workflow_triggers: parseObject(row.workflow_triggers),
    pipeline_mapping: parseObject(row.pipeline_mapping),
    calendar_mapping: parseObject(row.calendar_mapping)
  };
}

export async function listGhlAiAgentProfiles(filters: {
  status?: string;
} = {}) {
  noStore();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    let query = supabase
      .from("ghl_ai_agent_profiles")
      .select("*")
      .eq("owner_id", ownerId())
      .order("updated_at", { ascending: false });

    if (filters.status && filters.status !== "all") {
      query = query.eq("deployment_status", filters.status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => normalizeProfile(row));
  }

  const store = await readDevStore();
  return store.ghlProfiles.filter((profile) =>
    !filters.status || filters.status === "all" || profile.deployment_status === filters.status
  );
}

export async function getGhlAiAgentProfileForEmployee(aiEmployeeId: string) {
  noStore();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("ghl_ai_agent_profiles")
      .select("*")
      .eq("ai_employee_id", aiEmployeeId)
      .eq("owner_id", ownerId())
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? normalizeProfile(data) : null;
  }

  const store = await readDevStore();
  return store.ghlProfiles.find((profile) => profile.ai_employee_id === aiEmployeeId) ?? null;
}

export async function saveGhlAiAgentProfile(input: GhlAiAgentProfileInput) {
  const supabase = getSupabaseAdminClient();
  const timestamp = now();
  const profile: GhlAiAgentProfile = {
    ...input,
    id: input.id ?? randomUUID(),
    owner_id: ownerId(),
    created_at: timestamp,
    updated_at: timestamp,
    last_exported_at: input.last_exported_at ?? null
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("ghl_ai_agent_profiles")
      .upsert(profile)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeProfile(data);
  }

  const store = await readDevStore();
  const index = store.ghlProfiles.findIndex((item) => item.id === profile.id);

  if (index >= 0) {
    profile.created_at = store.ghlProfiles[index].created_at;
    store.ghlProfiles[index] = profile;
  } else {
    store.ghlProfiles.unshift(profile);
  }

  await writeDevStore(store);
  return profile;
}

export async function markGhlAiAgentProfileExported(id: string) {
  return updateGhlAiAgentProfileStatus(id, "exported", now());
}

export async function updateGhlAiAgentProfileStatus(
  id: string,
  deploymentStatus: GhlDeploymentStatus,
  lastExportedAt: string | null = null
) {
  const supabase = getSupabaseAdminClient();
  const update = {
    deployment_status: deploymentStatus,
    last_exported_at: lastExportedAt,
    updated_at: now()
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("ghl_ai_agent_profiles")
      .update(update)
      .eq("id", id)
      .eq("owner_id", ownerId())
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeProfile(data);
  }

  const store = await readDevStore();
  const index = store.ghlProfiles.findIndex((item) => item.id === id);

  if (index === -1) {
    throw new Error("GoHighLevel AI agent profile not found.");
  }

  store.ghlProfiles[index] = { ...store.ghlProfiles[index], ...update };
  await writeDevStore(store);
  return store.ghlProfiles[index];
}
