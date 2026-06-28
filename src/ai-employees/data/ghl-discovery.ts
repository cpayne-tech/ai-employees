import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import type {
  GhlDiscoveredResource,
  GhlDiscoveryReport,
  GhlDiscoveryStatus,
  GhlGapAnalysisItem
} from "@/ai-employees/types";
import { demoOwnerId } from "@/ai-employees/data/seed";
import { readDevStore, writeDevStore } from "@/ai-employees/data/dev-store";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

const ownerId = () => process.env.AI_EMPLOYEES_OWNER_ID ?? demoOwnerId;

type GhlDiscoveryReportInput = {
  id?: string;
  location_id?: string | null;
  account_name?: string | null;
  source?: GhlDiscoveryReport["source"];
  status: GhlDiscoveryStatus;
  inventory: GhlDiscoveredResource[];
  gap_analysis: GhlGapAnalysisItem[];
  blocked_reason?: string | null;
  notes?: string | null;
  discovered_at?: string | null;
};

function now() {
  return new Date().toISOString();
}

function normalizeInventory(value: unknown): GhlDiscoveredResource[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      name: String(item.name ?? ""),
      type: String(item.type ?? "unknown") as GhlDiscoveredResource["type"],
      resource_id: item.resource_id ? String(item.resource_id) : null,
      status: item.status ? String(item.status) : null,
      purpose: item.purpose ? String(item.purpose) : null,
      used_by: item.used_by ? String(item.used_by) : null,
      notes: item.notes ? String(item.notes) : null
    }));
}

function normalizeGapAnalysis(value: unknown): GhlGapAnalysisItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === "object"))
    .map((item) => ({
      requirement: String(item.requirement ?? ""),
      resource_type: String(item.resource_type ?? "unknown") as GhlGapAnalysisItem["resource_type"],
      status: String(item.status ?? "unknown") as GhlGapAnalysisItem["status"],
      existing_resource_id: item.existing_resource_id ? String(item.existing_resource_id) : null,
      reusable_resource_name: item.reusable_resource_name ? String(item.reusable_resource_name) : null,
      recommended_action: String(item.recommended_action ?? "Discovery required before action."),
      notes: item.notes ? String(item.notes) : null
    }));
}

function normalizeReport(row: Record<string, unknown>): GhlDiscoveryReport {
  return {
    ...(row as unknown as GhlDiscoveryReport),
    location_id: row.location_id ? String(row.location_id) : null,
    account_name: row.account_name ? String(row.account_name) : null,
    source: String(row.source ?? "manual") as GhlDiscoveryReport["source"],
    status: String(row.status ?? "in_progress") as GhlDiscoveryStatus,
    inventory: normalizeInventory(row.inventory),
    gap_analysis: normalizeGapAnalysis(row.gap_analysis),
    blocked_reason: row.blocked_reason ? String(row.blocked_reason) : null,
    notes: row.notes ? String(row.notes) : null,
    discovered_at: row.discovered_at ? String(row.discovered_at) : null
  };
}

export async function listGhlDiscoveryReports() {
  noStore();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("ghl_discovery_reports")
      .select("*")
      .eq("owner_id", ownerId())
      .order("updated_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => normalizeReport(row));
  }

  const store = await readDevStore();
  return store.ghlDiscoveryReports;
}

export async function getLatestGhlDiscoveryReport() {
  const reports = await listGhlDiscoveryReports();
  return reports[0] ?? null;
}

export async function saveGhlDiscoveryReport(input: GhlDiscoveryReportInput) {
  const supabase = getSupabaseAdminClient();
  const timestamp = now();
  const report: GhlDiscoveryReport = {
    id: input.id ?? randomUUID(),
    owner_id: ownerId(),
    location_id: input.location_id ?? null,
    account_name: input.account_name ?? null,
    source: input.source ?? "manual",
    status: input.status,
    inventory: input.inventory,
    gap_analysis: input.gap_analysis,
    blocked_reason: input.blocked_reason ?? null,
    notes: input.notes ?? null,
    discovered_at: input.discovered_at ?? (input.status === "discovered" ? timestamp : null),
    created_at: timestamp,
    updated_at: timestamp
  };

  if (supabase) {
    const { data, error } = await supabase
      .from("ghl_discovery_reports")
      .upsert(report)
      .select("*")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return normalizeReport(data);
  }

  const store = await readDevStore();
  const index = store.ghlDiscoveryReports.findIndex((item) => item.id === report.id);

  if (index >= 0) {
    report.created_at = store.ghlDiscoveryReports[index].created_at;
    store.ghlDiscoveryReports[index] = report;
  } else {
    store.ghlDiscoveryReports.unshift(report);
  }

  await writeDevStore(store);
  return report;
}
