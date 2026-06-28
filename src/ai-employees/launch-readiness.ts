import type { AiEmployeeDetail } from "@/ai-employees/types";

export type ReadinessState = "ready" | "needs-setup" | "not-connected";

export type LaunchChecklistItem = {
  label: string;
  state: ReadinessState;
};

export function getEmployeeLaunchReadiness(
  detail: AiEmployeeDetail,
  aiProviderConfigured: boolean
) {
  const { employee } = detail;
  const profileComplete = Boolean(
    employee.name &&
      employee.type &&
      employee.business_name &&
      employee.industry &&
      employee.primary_goal
  );
  const hasBusinessInfo = Boolean(employee.services_offered || employee.faqs);
  const hasEscalation = Boolean(employee.escalation_email || employee.escalation_phone);
  const testConversation = detail.conversations.some((item) => item.mode === "test");
  const leadExtractionVerified = detail.conversations.some((item) => {
    const lead = item.extracted_lead;
    return Boolean(lead.name || lead.email || lead.phone || lead.service_needed);
  });

  const checklist: LaunchChecklistItem[] = [
    { label: "Employee profile complete", state: profileComplete ? "ready" : "needs-setup" },
    {
      label: "Required lead fields configured",
      state: employee.required_lead_fields.length ? "ready" : "needs-setup"
    },
    { label: "FAQs or business info added", state: hasBusinessInfo ? "ready" : "needs-setup" },
    { label: "Escalation contact added", state: hasEscalation ? "ready" : "needs-setup" },
    { label: "AI provider configured", state: aiProviderConfigured ? "ready" : "needs-setup" },
    { label: "Test conversation completed", state: testConversation ? "ready" : "needs-setup" },
    { label: "Lead extraction verified", state: leadExtractionVerified ? "ready" : "needs-setup" },
    { label: "Public capture", state: "not-connected" },
    {
      label: "GoHighLevel",
      state: employee.ghl_enabled ? "needs-setup" : "not-connected"
    }
  ];
  const readyCount = checklist.filter((item) => item.state === "ready").length;
  const score = Math.round((readyCount / checklist.length) * 100);

  return {
    checklist,
    score,
    label: readinessLabel({
      aiProviderConfigured,
      employeeGhlEnabled: employee.ghl_enabled,
      hasBusinessInfo,
      hasEscalation,
      leadExtractionVerified,
      profileComplete,
      testConversation
    })
  };
}

function readinessLabel(input: {
  aiProviderConfigured: boolean;
  employeeGhlEnabled: boolean;
  hasBusinessInfo: boolean;
  hasEscalation: boolean;
  leadExtractionVerified: boolean;
  profileComplete: boolean;
  testConversation: boolean;
}) {
  if (!input.profileComplete || !input.hasBusinessInfo || !input.hasEscalation) {
    return "Not ready";
  }
  if (!input.testConversation || !input.leadExtractionVerified) {
    return "Needs testing";
  }
  if (!input.aiProviderConfigured) {
    return "Ready for internal testing";
  }
  if (!input.employeeGhlEnabled) {
    return "Ready for public capture";
  }
  return "Ready for GoHighLevel integration";
}
