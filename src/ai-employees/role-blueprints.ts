import type { AiEmployeeType } from "@/ai-employees/types";

export type RoleBlueprint = {
  type: AiEmployeeType;
  label: string;
  job: string;
  outcome: string;
  setupFocus: string[];
  ghl: {
    recommendedChannel: string;
    customFields: string[];
    tags: string[];
    workflows: string[];
    pipelineStages: string[];
    calendarBehavior: string;
    humanHandoffRules: string[];
    promptStructure: string[];
  };
};

export const aiEmployeeRoleBlueprints: RoleBlueprint[] = [
  {
    type: "AI Website Concierge",
    label: "Website Concierge",
    job: "Greets site visitors, answers business questions, and routes visitors toward the right next step.",
    outcome: "Convert anonymous traffic into qualified conversations.",
    setupFocus: ["Website context", "FAQs", "Service menu", "Lead fields"],
    ghl: {
      recommendedChannel: "Web Chat",
      customFields: ["Lead Intent", "Service Needed", "Conversation Summary", "Follow-up Status"],
      tags: ["AI Employee Lead", "AI Follow-up Needed"],
      workflows: ["AI Employee - New Lead Captured", "AI Employee - No Response Follow-up"],
      pipelineStages: ["New Lead", "Qualified Lead", "Follow-up Needed"],
      calendarBehavior: "Route booking interest to the receptionist or appointment workflow.",
      humanHandoffRules: ["Visitor asks for human", "Pricing is unclear", "Question is outside supplied business info"],
      promptStructure: ["Welcome", "Understand need", "Answer from knowledge", "Capture lead fields", "Route next step"]
    }
  },
  {
    type: "AI Receptionist / Appointment Setter",
    label: "Receptionist",
    job: "Collects contact details, asks appointment-fit questions, and requests preferred booking windows.",
    outcome: "Turn qualified interest into appointment requests.",
    setupFocus: ["Business hours", "Appointment rules", "Escalation contact", "Calendar mapping"],
    ghl: {
      recommendedChannel: "Multi-channel",
      customFields: ["Preferred Appointment Time", "Service Needed", "Urgency", "Qualification Status"],
      tags: ["AI Appointment Requested", "AI Qualified"],
      workflows: ["AI Employee - Appointment Requested", "AI Employee - Human Takeover"],
      pipelineStages: ["Qualified Lead", "Appointment Requested", "Appointment Booked"],
      calendarBehavior: "Collect preferred times and let GoHighLevel calendar/workflows confirm availability.",
      humanHandoffRules: ["Visitor needs rescheduling", "Visitor asks to speak with staff", "Calendar rules are unclear"],
      promptStructure: ["Collect contact info", "Ask reason", "Request preferred time", "Confirm request", "Escalate if needed"]
    }
  },
  {
    type: "AI Lead Qualifier",
    label: "Lead Qualifier",
    job: "Separates ready buyers from low-fit inquiries with focused qualification questions.",
    outcome: "Give the team clean lead status and priority context.",
    setupFocus: ["Qualification rules", "Disqualifiers", "Urgency signals", "Pipeline stage"],
    ghl: {
      recommendedChannel: "SMS",
      customFields: ["Lead Intent", "Urgency", "Qualification Status", "Service Needed"],
      tags: ["AI Qualified", "AI Employee Lead"],
      workflows: ["AI Employee - Qualified Lead", "AI Employee - Escalation Needed"],
      pipelineStages: ["New Lead", "Qualified Lead", "Closed/Lost"],
      calendarBehavior: "Offer booking only after qualification criteria are met.",
      humanHandoffRules: ["Lead is high-value", "Lead is disqualified but needs explanation", "Lead score conflicts with answers"],
      promptStructure: ["Clarify intent", "Ask qualifying question", "Score fit", "Label status", "Route opportunity"]
    }
  },
  {
    type: "AI Customer Support Agent",
    label: "Support Agent",
    job: "Answers repeat questions, captures support context, and escalates issues that need a human.",
    outcome: "Reduce repetitive admin work while protecting service quality.",
    setupFocus: ["Support FAQs", "Policy boundaries", "Escalation reasons", "Resolution notes"],
    ghl: {
      recommendedChannel: "Email",
      customFields: ["Conversation Summary", "Escalation Needed", "Escalation Reason", "Last AI Touchpoint"],
      tags: ["AI Escalation Needed", "Human Takeover Requested"],
      workflows: ["AI Employee - Escalation Needed", "AI Employee - Human Takeover"],
      pipelineStages: ["Support Request", "Human Review", "Resolved"],
      calendarBehavior: "Do not book unless the support path explicitly requires a scheduled follow-up.",
      humanHandoffRules: ["Customer is angry", "Issue is unresolved", "Policy is unclear", "Legal/medical/financial advice requested"],
      promptStructure: ["Acknowledge issue", "Check known info", "Collect details", "Summarize", "Escalate unresolved items"]
    }
  },
  {
    type: "AI Follow-up Coordinator",
    label: "Follow-up Coordinator",
    job: "Keeps track of next steps, follow-up timing, and warm lead handoff details.",
    outcome: "Prevent qualified leads from going cold after the first conversation.",
    setupFocus: ["Follow-up cadence", "Source tracking", "Message rules", "CRM handoff"],
    ghl: {
      recommendedChannel: "SMS",
      customFields: ["Follow-up Status", "Last AI Touchpoint", "Lead Intent", "Qualification Status"],
      tags: ["AI Follow-up Needed", "AI Employee Lead"],
      workflows: ["AI Employee - No Response Follow-up", "AI Employee - Qualified Lead"],
      pipelineStages: ["Follow-up Needed", "Qualified Lead", "Closed/Lost"],
      calendarBehavior: "Nudge toward booking only when intent remains active.",
      humanHandoffRules: ["Follow-up receives objection", "Visitor asks for staff", "Repeated no response after configured cadence"],
      promptStructure: ["Reference last context", "Check intent", "Ask one next-step question", "Update follow-up status", "Escalate if needed"]
    }
  }
];
