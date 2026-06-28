export type BillingPlan = {
  id: string;
  name: string;
  audience: string;
  setupFee: string;
  setupProductId: string;
  setupPaymentLinkPath: string;
  monthlyFee: string;
  recommended: boolean;
  summary: string;
  includes: string[];
  currentBuildStatus: "ready" | "manual" | "future";
};

export type PurchaseWorkflowStep = {
  step: string;
  owner: "Customer" | "OBMC Admin" | "System" | "GoHighLevel";
  status: "ready" | "manual" | "future";
  detail: string;
};

export const billingPlans: BillingPlan[] = [
  {
    id: "starter",
    name: "Starter AI Employee",
    audience: "Small business that needs one focused intake or support agent.",
    setupFee: "$497 setup",
    setupProductId: "6a40b2fe6ad3431dd323219a",
    setupPaymentLinkPath: "/6a40b35c390a6e280643b034",
    monthlyFee: "$297/mo",
    recommended: false,
    summary: "One configured AI employee, basic lead capture, and manual CRM sync.",
    includes: [
      "One AI employee role",
      "Internal simulation and prompt package",
      "Lead capture dashboard",
      "Manual GoHighLevel sync",
      "Basic support and update queue"
    ],
    currentBuildStatus: "ready"
  },
  {
    id: "growth",
    name: "AI Employee Team",
    audience: "Core offer for businesses that want the full five-role operating team.",
    setupFee: "$1,500 setup",
    setupProductId: "6a40b3076ad3432e7d232228",
    setupPaymentLinkPath: "/6a40b3ec9b12592b36824e77",
    monthlyFee: "$997/mo",
    recommended: true,
    summary: "Five AI employees mapped to GHL calendars, pipeline stages, tags, and workflows.",
    includes: [
      "Five-role AI employee roster",
      "Website concierge, receptionist, qualifier, support, and follow-up roles",
      "GoHighLevel profile exports",
      "Lead, conversation, appointment, and escalation dashboards",
      "Manual production-safe sync until automations are approved"
    ],
    currentBuildStatus: "ready"
  },
  {
    id: "scale",
    name: "Automation Partner",
    audience: "Companies that need ongoing workflow buildout and integrations.",
    setupFee: "$3,000 setup",
    setupProductId: "6a40b3136ad34355f6232403",
    setupPaymentLinkPath: "/6a40b42a9b12592b36824e78",
    monthlyFee: "$1,997/mo",
    recommended: false,
    summary: "Full AI team plus custom workflows, reporting, and integration support.",
    includes: [
      "Everything in AI Employee Team",
      "Custom GHL workflows after approval",
      "n8n purchase and operations orchestration",
      "Monthly optimization review",
      "Priority support and expansion planning"
    ],
    currentBuildStatus: "manual"
  }
];

export const purchaseWorkflow: PurchaseWorkflowStep[] = [
  {
    step: "Setup fee and plan payment captured",
    owner: "Customer",
    status: "manual",
    detail: "Collect the one-time GHL setup fee link first, then send the matching GHL SaaS subscription link."
  },
  {
    step: "Client workspace created",
    owner: "System",
    status: "ready",
    detail: "Signed Stripe purchase events create customer records, setup tasks, and token-based customer portals."
  },
  {
    step: "Business intake completed",
    owner: "Customer",
    status: "ready",
    detail: "Use the onboarding flow to capture services, FAQs, lead fields, appointment rules, and escalation contacts."
  },
  {
    step: "AI employee roster configured",
    owner: "OBMC Admin",
    status: "ready",
    detail: "Create the five role-specific employees, run local simulation, then generate GHL profile packages."
  },
  {
    step: "GoHighLevel resources mapped",
    owner: "OBMC Admin",
    status: "ready",
    detail: "Use read-only discovery and existing OBMC-safe resources before adding namespaced workflows."
  },
  {
    step: "Production activation approved",
    owner: "GoHighLevel",
    status: "manual",
    detail: "Manual approval keeps contacts, opportunities, notes, tags, and workflow changes controlled."
  },
  {
    step: "Post-purchase workflow notification",
    owner: "System",
    status: "ready",
    detail: "Stripe is stored first; n8n is notified only when a purchase webhook URL is configured."
  }
];

export const billingReadiness = [
  {
    label: "Pricing structure",
    status: "ready",
    detail: "Recommended starter, team, and automation partner packages are defined."
  },
  {
    label: "Customer preview",
    status: "ready",
    detail: "Admin can view what a client-facing workspace should become."
  },
  {
    label: "GHL setup fee links",
    status: "ready",
    detail: "One-time setup products and active payment links exist for all three packages."
  },
  {
    label: "Stripe webhook purchase capture",
    status: "ready",
    detail: "Signed Stripe events create customer records, purchase rows, setup tasks, and portal access."
  },
  {
    label: "Post-purchase n8n automation",
    status: "manual",
    detail: "Optional downstream notification is supported when N8N_PURCHASE_WEBHOOK_URL is configured."
  }
] as const;

const defaultGhlPaymentLinkBaseUrl = "https://link.fastpaydirect.com/payment-link";

export function getSetupPaymentLinkUrl(plan: BillingPlan) {
  const baseUrl = (process.env.GHL_PAYMENT_LINK_BASE_URL ?? defaultGhlPaymentLinkBaseUrl).replace(/\/$/, "");
  const paymentLinkId = plan.setupPaymentLinkPath.replace(/^\//, "");

  return `${baseUrl}/${paymentLinkId}`;
}
