import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Database,
  Headphones,
  MessageSquareText,
  Route,
  ShieldCheck,
  Sparkles,
  Tags,
  UsersRound,
  Workflow
} from "lucide-react";
import { FunnelCta, PublicPageShell } from "@/components/public-site/public-site";

export const metadata: Metadata = {
  title: "OBMC AI Employees | Managed AI Workforce Setup",
  description:
    "Create role-specific AI employees for lead capture, qualification, appointment handoff, support triage, and GoHighLevel-connected follow-up.",
  openGraph: {
    title: "OBMC AI Employees | Managed AI Workforce Setup",
    description:
      "Install a managed AI workforce that captures leads, qualifies conversations, organizes follow-up, and connects into GoHighLevel with human-controlled launch.",
    url: "https://ai-employees-gamma.vercel.app",
    siteName: "OBMC AI Employees",
    type: "website"
  }
};

const trustBullets = [
  "Built for GoHighLevel workflows",
  "Managed setup",
  "Human-controlled launch",
  "Five role-based AI employees"
];

const pains = [
  "Leads come in after hours and wait too long.",
  "Staff forgets to follow up when work gets busy.",
  "Contacts and notes live in scattered conversations.",
  "Appointment requests arrive without enough context.",
  "CRM records are incomplete or updated manually.",
  "Owners cannot quickly see which leads are hot."
];

const systemLayers = [
  {
    icon: BrainCircuit,
    title: "AI Employee OS",
    text: "The control center for roles, instructions, setup status, intake, and launch readiness."
  },
  {
    icon: Database,
    title: "Supabase Records",
    text: "Stores customer setup, conversations, leads, appointments, escalations, and workflow history."
  },
  {
    icon: Sparkles,
    title: "AI Gateway",
    text: "Adds conversation intelligence for qualification, summaries, routing, and test simulations."
  },
  {
    icon: Workflow,
    title: "GoHighLevel Execution",
    text: "Handles CRM contacts, notes, calendars, opportunities, SMS, email, pipelines, and workflows."
  },
  {
    icon: ShieldCheck,
    title: "Human Review",
    text: "Keeps launch, CRM writes, and workflow changes controlled until approved."
  }
];

const aiEmployees = [
  {
    role: "AI Website Concierge",
    promise: "Turn anonymous website traffic into organized leads.",
    does: "Welcomes visitors, answers approved questions, identifies intent, and routes people to contact, booking, or support.",
    captures: "Name, phone, email, interest, page intent, and next-step request.",
    sends: "Lead record, intent label, conversation notes, and recommended follow-up path.",
    useCases: "Website inquiries, after-hours visitors, service questions, and quote requests."
  },
  {
    role: "AI Receptionist / Appointment Setter",
    promise: "Convert inbound conversations into appointment-ready handoffs.",
    does: "Collects contact details, asks the reason for appointment, requests preferred times, and prepares booking notes.",
    captures: "Name, phone, email, appointment reason, preferred time, urgency, and callback details.",
    sends: "Contact update, appointment request, CRM note, and escalation flag when needed.",
    useCases: "Missed calls, contact forms, booking requests, and new customer intake."
  },
  {
    role: "AI Lead Qualifier",
    promise: "Separate serious opportunities from casual inquiries.",
    does: "Asks qualification questions, detects urgency, identifies service need, and labels hot, warm, or cold intent.",
    captures: "Need, urgency, fit, missing information, budget context when appropriate, and qualification status.",
    sends: "Opportunity preparation, pipeline recommendation, tags, and human review notes.",
    useCases: "Sales teams, service businesses, agencies, and appointment-driven offers."
  },
  {
    role: "AI Customer Support Agent",
    promise: "Reduce repetitive support replies and surface real issues faster.",
    does: "Answers approved FAQs, collects issue details, summarizes the problem, and escalates complex requests.",
    captures: "Customer details, support category, problem summary, urgency, and escalation reason.",
    sends: "Support note, escalation queue item, and follow-up recommendation.",
    useCases: "Common questions, service-status updates, issue triage, and customer routing."
  },
  {
    role: "AI Follow-up Coordinator",
    promise: "Keep leads moving after the first conversation.",
    does: "Identifies missing information, prepares follow-up messages, tracks response status, and reminds the human team.",
    captures: "Follow-up need, response status, next action, missing fields, and timing preference.",
    sends: "Follow-up prompt, CRM note, pipeline update recommendation, and human reminder.",
    useCases: "Long sales cycles, no-shows, incomplete forms, and warm leads that need a nudge."
  }
];

const agentDetails = [
  ["Website Concierge", "Route visitors to the right next step.", "Name, phone, email, intent.", "Create/update contact and add source note.", "Website lead captured.", "Unclear request or sensitive topic.", "Fewer anonymous visitors leave without a path."],
  ["AI Receptionist", "Turn missed inquiries into appointment requests.", "Name, phone, email, reason, preferred time.", "Create/update contact, add note, prepare opportunity.", "Appointment requested follow-up.", "Urgent request, upset customer, or pricing uncertainty.", "Fewer missed appointments and better booking context."],
  ["Lead Qualifier", "Identify which leads deserve immediate attention.", "Need, urgency, fit, lead score, missing info.", "Tag hot/warm/cold and prepare pipeline stage.", "Qualified lead follow-up.", "Low confidence or high-value opportunity.", "Sales time goes to the right conversations."],
  ["Support Agent", "Triage common questions and issues.", "Issue type, summary, urgency, customer info.", "Add support note and escalation item.", "Support triage or ticket handoff.", "Complex issue, complaint, or account-specific need.", "Repetitive questions stop slowing the team down."],
  ["Follow-up Coordinator", "Keep every lead moving after first contact.", "Missing fields, response status, next step.", "Prepare follow-up note and reminder.", "No-response or incomplete-lead sequence.", "Lead asks for human callback or special case.", "Follow-up becomes structured instead of improvised."]
];

const processSteps = [
  "Purchase setup",
  "Complete business intake",
  "OBMC reviews business goals",
  "AI employee roles are configured",
  "Lead fields and qualification rules are mapped",
  "GoHighLevel calendars, pipelines, tags, and workflows are reviewed",
  "Internal simulation is tested",
  "Human handoff rules are confirmed",
  "Client approves launch",
  "AI employees go live"
];

const deliverables = [
  "AI Employee workspace",
  "Five role blueprints",
  "Business intake setup",
  "Prompt and instruction configuration",
  "Lead capture field mapping",
  "Qualification rules",
  "Escalation rules",
  "GoHighLevel mapping plan",
  "Workflow trigger plan",
  "Internal simulation review",
  "Launch readiness checklist",
  "Human handoff setup",
  "Post-launch optimization option"
];

const useCases = [
  "Home services",
  "Real estate",
  "Med spas",
  "Agencies",
  "Coaches and consultants",
  "Legal intake",
  "Dental and medical admin support",
  "Financial services intake",
  "Local service businesses",
  "Online education and course businesses"
];

const faqs = [
  ["Is this just a chatbot?", "No. The offer is a managed AI Employee Operating System with roles, setup, intake, records, GoHighLevel mapping, and human review."],
  ["Do I need GoHighLevel?", "GoHighLevel is the preferred CRM execution layer for this build. OBMC maps into existing calendars, pipelines, contacts, notes, tags, and workflows carefully."],
  ["Will it replace my staff?", "It is designed to help staff respond faster, collect better information, and organize follow-up. Human approval remains part of launch and escalation."],
  ["Can I approve before launch?", "Yes. Internal simulation, handoff rules, and launch readiness are reviewed before production activation."],
  ["Does it change my existing GoHighLevel account?", "Existing assets should be discovered first and preserved. Production changes are not made without approval."],
  ["Can it work for regulated industries?", "AI employees can capture information, route conversations, and escalate to humans. They do not provide legal, medical, or financial advice."]
];

export default function Home() {
  return (
    <PublicPageShell>
      <section className="funnel-hero">
        <div className="funnel-hero-copy">
          <span className="eyebrow">Managed AI Employee Operating System</span>
          <h1>Deploy an AI Workforce That Captures, Qualifies, and Follows Up With Leads</h1>
          <p>
            Install a managed AI workforce that captures leads, qualifies conversations,
            organizes follow-up, and prepares your business for automated customer handling
            without losing human control.
          </p>
          <div className="funnel-hero-actions">
            <Link className="button" href="/contact">
              Start Setup
              <ArrowRight size={16} />
            </Link>
            <Link className="button secondary" href="/pricing">View Pricing</Link>
          </div>
          <div className="funnel-trust-list">
            {trustBullets.map((bullet) => (
              <span key={bullet}>
                <CheckCircle2 size={15} />
                {bullet}
              </span>
            ))}
          </div>
        </div>
        <div className="funnel-visual-panel" aria-label="AI Employee OS launch preview">
          <div className="visual-panel-header">
            <span>Launch readiness</span>
            <strong>AI Workforce Setup</strong>
          </div>
          {["5 AI Employees", "Business intake", "GoHighLevel mapping", "Human approval", "Launch checklist"].map((item, index) => (
            <div className="visual-panel-row" key={item}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
              <small>{index < 2 ? "Configured" : index < 4 ? "Review" : "Ready"}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="funnel-strip">
        <strong>Not a generic chatbot.</strong>
        <strong>Not a disconnected automation.</strong>
        <strong>A managed AI workforce setup for real business operations.</strong>
      </section>

      <section className="funnel-section split">
        <div>
          <span className="eyebrow">The problem</span>
          <h2>Most businesses do not lose leads because demand is missing. They lose leads because the handoff breaks.</h2>
          <p>
            Messages arrive outside work hours, staff gets busy, CRM records fall behind,
            and owners cannot tell which conversations deserve immediate attention.
          </p>
          <Link className="button" href="/contact">Map your first AI employee</Link>
        </div>
        <div className="problem-grid">
          {pains.map((pain) => (
            <div className="problem-card" key={pain}>
              <Route size={18} />
              <span>{pain}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="funnel-section">
        <div className="section-heading-wide">
          <span className="eyebrow">What it is</span>
          <h2>OBMC AI Employees is a managed AI Employee Operating System.</h2>
          <p>
            It helps businesses create role-specific AI workers for lead handling, customer intake,
            qualification, appointment routing, support triage, and follow-up coordination.
          </p>
        </div>
        <div className="system-layer-grid">
          {systemLayers.map((layer) => (
            <article className="system-layer-card" key={layer.title}>
              <layer.icon size={24} />
              <h3>{layer.title}</h3>
              <p>{layer.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="funnel-section dark">
        <div className="section-heading-wide">
          <span className="eyebrow">Five core AI employees</span>
          <h2>Each employee has a specific job, data model, handoff condition, and business outcome.</h2>
        </div>
        <div className="employee-card-grid">
          {aiEmployees.map((employee) => (
            <article className="employee-card" key={employee.role}>
              <span>Included in setup</span>
              <h3>{employee.role}</h3>
              <strong>{employee.promise}</strong>
              <p>{employee.does}</p>
              <dl>
                <div><dt>Captures</dt><dd>{employee.captures}</dd></div>
                <div><dt>Sends</dt><dd>{employee.sends}</dd></div>
                <div><dt>Best for</dt><dd>{employee.useCases}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <FunnelCta
        title="See what each AI employee should do before anything goes live."
        text="Start with a managed setup that defines roles, lead fields, handoff rules, and launch readiness."
        secondaryHref="#agent-details"
        secondaryLabel="See Each Role"
      />

      <section className="funnel-section" id="agent-details">
        <div className="section-heading-wide">
          <span className="eyebrow">Role logic</span>
          <h2>What each agent can do</h2>
        </div>
        <div className="agent-detail-grid">
          {agentDetails.map(([role, goal, captures, crm, workflow, handoff, outcome]) => (
            <article className="agent-detail-card" key={role}>
              <h3>{role}</h3>
              <Detail label="Conversation goal" value={goal} />
              <Detail label="Lead data captured" value={captures} />
              <Detail label="CRM action prepared" value={crm} />
              <Detail label="GoHighLevel workflow" value={workflow} />
              <Detail label="Human handoff" value={handoff} />
              <Detail label="Business outcome" value={outcome} />
            </article>
          ))}
        </div>
      </section>

      <section className="funnel-section split ghl-section">
        <div>
          <span className="eyebrow">Built to work with GoHighLevel</span>
          <h2>GoHighLevel handles CRM execution. OBMC AI Employees manages setup, roles, and controlled handoff.</h2>
          <p>
            We map into contacts, notes, tags, opportunities, calendars, pipelines,
            workflows, SMS, and email follow-up. Existing GoHighLevel assets are
            discovered first and preserved.
          </p>
          <div className="safety-promise">
            <ShieldCheck size={20} />
            <strong>We map into your existing GoHighLevel account carefully. Existing workflows, pipelines, calendars, and client data are preserved.</strong>
          </div>
        </div>
        <div className="ghl-map-grid">
          {["Contacts", "Notes", "Tags", "Opportunities", "Calendars", "Pipelines", "Workflows", "SMS/email follow-up"].map((item) => (
            <div className="ghl-map-card" key={item}>
              <Tags size={18} />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="funnel-section">
        <div className="section-heading-wide">
          <span className="eyebrow">Managed setup process</span>
          <h2>How it works from purchase to launch-ready AI employees</h2>
        </div>
        <div className="process-grid">
          {processSteps.map((step, index) => (
            <div className="process-step" key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="funnel-section split">
        <div>
          <span className="eyebrow">Deliverables</span>
          <h2>What you get in the setup</h2>
          <p>
            The setup gives your business an implementation-ready workspace,
            role blueprints, intake structure, GoHighLevel mapping plan, and a
            review-first launch process.
          </p>
        </div>
        <div className="deliverable-grid">
          {deliverables.map((item) => (
            <div className="deliverable-item" key={item}>
              <CheckCircle2 size={16} />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="funnel-section">
        <div className="section-heading-wide">
          <span className="eyebrow">Use cases</span>
          <h2>Useful anywhere customer conversations need structure before follow-up.</h2>
          <p>
            For regulated industries, AI employees do not provide legal, medical, or financial advice.
            They capture information, route conversations, and escalate to humans.
          </p>
        </div>
        <div className="use-case-grid">
          {useCases.map((item) => (
            <div className="use-case-card" key={item}>{item}</div>
          ))}
        </div>
      </section>

      <section className="funnel-section comparison-section">
        <div className="comparison-card before">
          <span>Before</span>
          {["Missed messages", "Slow response", "Incomplete lead info", "No consistent follow-up", "Scattered notes", "Manual CRM updates", "No clear handoff"].map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
        <div className="comparison-card after">
          <span>After</span>
          {["Faster responses", "Structured intake", "Qualified leads", "Organized CRM notes", "Appointment requests prepared", "Follow-up prompts", "Human review where needed"].map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </section>

      <section className="funnel-section demo-section">
        <div>
          <span className="eyebrow">Demo preview</span>
          <h2>A customer workspace, setup queue, and launch checklist are part of the operating system.</h2>
          <p>
            Buyers can complete intake and track setup. Admins can review purchase records,
            setup tasks, intake details, and launch readiness.
          </p>
          <Link className="button secondary" href="/ai-employees/customer-preview">View Workspace Preview</Link>
        </div>
        <div className="demo-preview-panel">
          <MessageSquareText size={22} />
          <strong>Lead captured</strong>
          <p>Intent: appointment request</p>
          <p>Qualification: warm</p>
          <p>Handoff: human approval before launch</p>
        </div>
      </section>

      <FunnelCta
        eyebrow="Pricing"
        title="Start with setup, then launch with the right operating package."
        text="Compare the existing setup packages and choose the level of AI employee coverage your business needs."
      />

      <section className="funnel-section">
        <div className="section-heading-wide">
          <span className="eyebrow">FAQ</span>
          <h2>Questions before setup</h2>
        </div>
        <div className="faq-grid">
          {faqs.map(([question, answer]) => (
            <article className="faq-card" key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <FunnelCta
        eyebrow="Final step"
        title="Prepare your business for AI-powered follow-up without losing control."
        text="Request setup and OBMC will map the first AI employee workflow around your business intake, qualification rules, and GoHighLevel environment."
      />
    </PublicPageShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="agent-detail-row">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}
