import type { AiEmployeeType } from "@/ai-employees/types";

export type RoleBlueprint = {
  type: AiEmployeeType;
  label: string;
  job: string;
  outcome: string;
  setupFocus: string[];
};

export const aiEmployeeRoleBlueprints: RoleBlueprint[] = [
  {
    type: "AI Website Concierge",
    label: "Website Concierge",
    job: "Greets site visitors, answers business questions, and routes visitors toward the right next step.",
    outcome: "Convert anonymous traffic into qualified conversations.",
    setupFocus: ["Website context", "FAQs", "Service menu", "Lead fields"]
  },
  {
    type: "AI Receptionist / Appointment Setter",
    label: "Receptionist",
    job: "Collects contact details, asks appointment-fit questions, and requests preferred booking windows.",
    outcome: "Turn qualified interest into appointment requests.",
    setupFocus: ["Business hours", "Appointment rules", "Escalation contact", "Calendar mapping"]
  },
  {
    type: "AI Lead Qualifier",
    label: "Lead Qualifier",
    job: "Separates ready buyers from low-fit inquiries with focused qualification questions.",
    outcome: "Give the team clean lead status and priority context.",
    setupFocus: ["Qualification rules", "Disqualifiers", "Urgency signals", "Pipeline stage"]
  },
  {
    type: "AI Customer Support Agent",
    label: "Support Agent",
    job: "Answers repeat questions, captures support context, and escalates issues that need a human.",
    outcome: "Reduce repetitive admin work while protecting service quality.",
    setupFocus: ["Support FAQs", "Policy boundaries", "Escalation reasons", "Resolution notes"]
  },
  {
    type: "AI Follow-up Coordinator",
    label: "Follow-up Coordinator",
    job: "Keeps track of next steps, follow-up timing, and warm lead handoff details.",
    outcome: "Prevent qualified leads from going cold after the first conversation.",
    setupFocus: ["Follow-up cadence", "Source tracking", "Message rules", "CRM handoff"]
  }
];
