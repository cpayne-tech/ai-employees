import type {
  GhlDiscoveredResource,
  GhlDiscoveryReport,
  GhlGapAnalysisItem,
  GhlResourceType
} from "@/ai-employees/types";
import { aiEmployeeRoleBlueprints } from "@/ai-employees/role-blueprints";
import { standardGhlCustomFields } from "@/ai-employees/integrations/gohighlevel-native/custom-field-mapper";

export const ghlSafeIntegrationRules = [
  "Treat GoHighLevel as live production data.",
  "Discovery is read-only and must happen before creation or deployment.",
  "Never delete, rename, disable, archive, move, merge, replace, or edit existing GoHighLevel resources without explicit approval.",
  "Search first, reuse equivalent resources, and create only missing namespaced assets after approval.",
  "Use clear namespaces such as AI Employee -, OBMC -, OBMC AI -, or AIOS - for anything new."
];

export const ghlDiscoveryCategories = [
  {
    title: "Account Information",
    resources: ["Agency", "Sub-accounts/locations", "Location IDs", "Connected phone numbers", "Connected email providers"]
  },
  {
    title: "Calendars",
    resources: ["All calendars", "Calendar IDs", "Calendar groups", "Booking settings"]
  },
  {
    title: "Pipelines",
    resources: ["All pipelines", "Pipeline IDs", "Every stage", "Stage IDs"]
  },
  {
    title: "Contacts",
    resources: ["Custom fields", "Tags", "Smart Lists when available"]
  },
  {
    title: "Workflows",
    resources: ["Workflow names", "Trigger types", "Actions used", "Current status", "Folder organization"]
  },
  {
    title: "Forms",
    resources: ["Existing forms", "Embedded forms", "Surveys", "Custom fields used"]
  },
  {
    title: "AI Features",
    resources: ["AI Agents", "Conversation AI", "Voice AI", "Conversation channels", "Prompt configuration", "AI settings"]
  }
];

type RequiredResource = {
  requirement: string;
  resource_type: GhlResourceType;
  keywords: string[];
  recommended_action: string;
};

export function buildAiEmployeeOsRequirements(): RequiredResource[] {
  const roleTags = aiEmployeeRoleBlueprints.flatMap((blueprint) => blueprint.ghl.tags);
  const roleWorkflows = aiEmployeeRoleBlueprints.flatMap((blueprint) => blueprint.ghl.workflows);
  const roleStages = aiEmployeeRoleBlueprints.flatMap((blueprint) => blueprint.ghl.pipelineStages);

  return [
    {
      requirement: "GoHighLevel sub-account/location selected",
      resource_type: "location",
      keywords: ["location", "sub-account", "sub account", "obmc"],
      recommended_action: "Reuse the correct production location after confirming the location ID."
    },
    {
      requirement: "Conversation channel available",
      resource_type: "conversation_channel",
      keywords: ["sms", "email", "web chat", "messenger", "instagram"],
      recommended_action: "Reuse existing channels; do not change phone numbers or email providers."
    },
    {
      requirement: "Native AI Agent capability available",
      resource_type: "ai_agent",
      keywords: ["ai agent", "conversation ai", "voice ai"],
      recommended_action: "Use native GHL AI features when available; record permission or plan blockers."
    },
    {
      requirement: "Calendar for appointment routing",
      resource_type: "calendar",
      keywords: ["calendar", "booking", "appointment"],
      recommended_action: "Reuse an appropriate calendar; create a namespaced one only if none exists."
    },
    {
      requirement: "Pipeline for AI Employee opportunities",
      resource_type: "pipeline",
      keywords: ["pipeline", "opportunity", "lead"],
      recommended_action: "Reuse an existing relevant pipeline or create a namespaced pipeline after approval."
    },
    ...unique(roleStages).map((stage) => ({
      requirement: `Pipeline stage: ${stage}`,
      resource_type: "pipeline_stage" as const,
      keywords: [stage],
      recommended_action: "Reuse matching stage names; never rename or reorder production stages without approval."
    })),
    ...unique(standardGhlCustomFields).map((field) => ({
      requirement: `Custom field: ${field}`,
      resource_type: "custom_field" as const,
      keywords: [field],
      recommended_action: "Reuse an equivalent custom field; create a namespaced field only if missing."
    })),
    ...unique(roleTags).map((tag) => ({
      requirement: `Tag: ${tag}`,
      resource_type: "tag" as const,
      keywords: [tag],
      recommended_action: "Reuse equivalent tags; create namespaced tags only if missing."
    })),
    ...unique(roleWorkflows).map((workflow) => ({
      requirement: `Workflow: ${workflow}`,
      resource_type: "workflow" as const,
      keywords: [workflow],
      recommended_action: "Create new workflow drafts only after discovery confirms no equivalent workflow exists."
    }))
  ];
}

export function buildGapAnalysisFromInventory(report: GhlDiscoveryReport | null): GhlGapAnalysisItem[] {
  const requirements = buildAiEmployeeOsRequirements();

  if (!report || report.status !== "discovered") {
    return requirements.map((requirement) => ({
      requirement: requirement.requirement,
      resource_type: requirement.resource_type,
      status: "unknown",
      existing_resource_id: null,
      reusable_resource_name: null,
      recommended_action: "Complete read-only discovery before deciding whether this exists or is missing.",
      notes: "No production GoHighLevel resource should be created from an unknown state."
    }));
  }

  return requirements.map((requirement) => {
    const match = findMatchingResource(report.inventory, requirement.resource_type, requirement.keywords);

    if (!match) {
      return {
        requirement: requirement.requirement,
        resource_type: requirement.resource_type,
        status: "missing",
        existing_resource_id: null,
        reusable_resource_name: null,
        recommended_action: requirement.recommended_action,
        notes: "Missing means no equivalent was found in the completed inventory; creation still requires search and verification at action time."
      };
    }

    return {
      requirement: requirement.requirement,
      resource_type: requirement.resource_type,
      status: "existing",
      existing_resource_id: match.resource_id,
      reusable_resource_name: match.name,
      recommended_action: "Reuse this existing resource without modification.",
      notes: match.notes
    };
  });
}

export function buildDiscoveryInventoryTemplate(): GhlDiscoveredResource[] {
  return [
    "agency",
    "location",
    "phone_number",
    "email_provider",
    "calendar",
    "calendar_group",
    "pipeline",
    "pipeline_stage",
    "custom_field",
    "tag",
    "smart_list",
    "workflow",
    "workflow_folder",
    "form",
    "survey",
    "ai_agent",
    "conversation_ai",
    "voice_ai",
    "conversation_channel",
    "ai_setting"
  ].map((type) => ({
    name: "",
    type: type as GhlResourceType,
    resource_id: null,
    status: null,
    purpose: null,
    used_by: null,
    notes: null
  }));
}

export function summarizeDiscovery(report: GhlDiscoveryReport | null) {
  const gapAnalysis = buildGapAnalysisFromInventory(report);

  return {
    status: report?.status ?? "not_started",
    inventoryCount: report?.inventory.length ?? 0,
    existingCount: gapAnalysis.filter((item) => item.status === "existing").length,
    missingCount: gapAnalysis.filter((item) => item.status === "missing").length,
    unknownCount: gapAnalysis.filter((item) => item.status === "unknown").length,
    conflictCount: gapAnalysis.filter((item) => item.status === "conflict").length,
    gapAnalysis
  };
}

function findMatchingResource(
  inventory: GhlDiscoveredResource[],
  resourceType: GhlResourceType,
  keywords: string[]
) {
  return inventory.find((resource) => {
    const haystack = `${resource.name} ${resource.type} ${resource.purpose ?? ""} ${resource.notes ?? ""}`.toLowerCase();
    return resource.type === resourceType && keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
  });
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
