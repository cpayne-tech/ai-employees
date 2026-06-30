import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MessageSquareText,
  ShieldCheck,
  Tags
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
  "Built for GoHighLevel",
  "Five role-based AI employees",
  "Customer intake included",
  "Human-controlled launch"
];

const quickOutcomes = [
  "Capture more website and message leads",
  "Qualify intent before your team responds",
  "Prepare appointments, notes, tags, and handoffs",
  "Keep production changes under human review"
];

const buyerSteps = [
  {
    title: "Pick your setup package",
    text: "Choose one AI employee, the five-role team, or a custom automation partner setup."
  },
  {
    title: "Pay the setup fee",
    text: "The payment creates the customer record and starts the managed implementation workflow."
  },
  {
    title: "Complete business intake",
    text: "Submit services, FAQs, lead fields, appointment rules, escalation contacts, and brand voice."
  },
  {
    title: "Review before launch",
    text: "OBMC maps the AI employees into GoHighLevel and keeps launch approval human-controlled."
  }
];

const aiEmployees = [
  {
    role: "Website Concierge",
    text: "Turns anonymous visitors into organized leads with clear next steps."
  },
  {
    role: "AI Receptionist",
    text: "Collects appointment context, preferred times, and callback details."
  },
  {
    role: "Lead Qualifier",
    text: "Labels hot, warm, and low-fit leads so the team knows who needs attention."
  },
  {
    role: "Support Agent",
    text: "Answers approved FAQs, gathers issue details, and escalates real problems."
  },
  {
    role: "Follow-up Coordinator",
    text: "Keeps incomplete, warm, and no-response leads moving after first contact."
  }
];

const ghlItems = [
  "Contacts",
  "Notes",
  "Tags",
  "Opportunities",
  "Calendars",
  "Pipelines",
  "Workflows",
  "SMS/email follow-up"
];

const faqs = [
  ["Is this just a chatbot?", "No. It is a managed setup for role-specific AI employees, customer intake, CRM mapping, and launch review."],
  ["Do I need GoHighLevel?", "GoHighLevel is the preferred execution layer for contacts, notes, calendars, pipelines, workflows, SMS, and email follow-up."],
  ["Does AI go live automatically?", "No. The build is review-first. Production CRM changes and workflow activation stay controlled until approved."]
];

export default function Home() {
  return (
    <PublicPageShell>
      <section className="funnel-hero">
        <div className="funnel-hero-copy">
          <span className="eyebrow">Managed AI Employee Setup</span>
          <h1>Install an AI team that captures, qualifies, and follows up with leads.</h1>
          <p>
            OBMC builds five practical AI employee roles for your business, connects the workflow
            to GoHighLevel, and keeps launch under human review.
          </p>
          <div className="funnel-hero-actions">
            <Link className="button" href="/pricing">
              See Packages
              <ArrowRight size={16} />
            </Link>
            <Link className="button secondary" href="/contact">Ask a Setup Question</Link>
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
        <div className="funnel-visual-panel" aria-label="AI Employee launch preview">
          <div className="visual-panel-header">
            <span>What gets installed</span>
            <strong>AI Employee Team</strong>
          </div>
          {["Lead capture", "Qualification", "Appointment handoff", "Support triage", "Follow-up coordination"].map((item, index) => (
            <div className="visual-panel-row" key={item}>
              <span>{index + 1}</span>
              <strong>{item}</strong>
              <small>{index < 2 ? "Setup" : index < 4 ? "Review" : "Launch"}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="funnel-strip">
        {quickOutcomes.map((item) => (
          <strong key={item}>{item}</strong>
        ))}
      </section>

      <section className="funnel-image-band">
        <div
          aria-label="Operations team reviewing customer conversations and follow-up work"
          className="stock-visual stock-visual-ops"
        />
        <div className="image-copy-card">
          <span className="eyebrow">Less scattered follow-up</span>
          <h2>One clear path from lead to launch.</h2>
          <p>
            The service is designed so a buyer knows what to buy, what happens after payment,
            what intake is needed, and when the AI employees are ready for approval.
          </p>
          <div className="image-proof-list">
            {["Simple buyer flow", "Private customer workspace", "Plain-language setup checklist"].map((item) => (
              <span className="image-proof-item" key={item}>
                <CheckCircle2 size={16} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="funnel-section">
        <div className="section-heading-wide">
          <span className="eyebrow">How it works</span>
          <h2>From purchase to launch-ready AI employees.</h2>
        </div>
        <div className="buyer-flow-grid">
          {buyerSteps.map((step, index) => (
            <article className="buyer-flow-card" key={step.title}>
              <span>{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="funnel-section dark">
        <div className="section-heading-wide">
          <span className="eyebrow">Included roles</span>
          <h2>The five AI employees customers understand immediately.</h2>
        </div>
        <div className="employee-card-grid compact">
          {aiEmployees.map((employee) => (
            <article className="employee-card compact" key={employee.role}>
              <span>AI employee</span>
              <h3>{employee.role}</h3>
              <p>{employee.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="funnel-section split ghl-section">
        <div>
          <span className="eyebrow">Connected to the work you already do</span>
          <h2>GoHighLevel stays the CRM. OBMC handles the AI employee setup.</h2>
          <p>
            Existing assets are discovered first. Contacts, notes, tags, opportunities,
            calendars, pipelines, workflows, SMS, and email follow-up stay review-first.
          </p>
          <div className="safety-promise">
            <ShieldCheck size={20} />
            <strong>No production automation is activated until the setup is reviewed.</strong>
          </div>
        </div>
        <div className="ghl-map-grid">
          {ghlItems.map((item) => (
            <div className="ghl-map-card" key={item}>
              <Tags size={18} />
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="funnel-section demo-section">
        <div>
          <span className="eyebrow">Customer experience</span>
          <h2>After purchase, customers should know exactly what to do next.</h2>
          <p>
            The customer workspace is built around three simple actions: complete intake,
            watch setup progress, and approve launch when the AI employees are ready.
          </p>
          <Link className="button secondary" href="/purchase-success">View Post-Purchase Step</Link>
        </div>
        <div className="demo-preview-panel">
          <ClipboardList size={22} />
          <strong>Next step: business intake</strong>
          <p>Services, FAQs, lead fields, appointment rules, and escalation contacts.</p>
        </div>
      </section>

      <FunnelCta
        eyebrow="Packages"
        title="Start with the package that matches the amount of AI help you need."
        text="The recommended package installs the full five-role AI employee team and maps it into your GoHighLevel workflow."
        secondaryHref="/contact"
        secondaryLabel="Ask a Question"
      />

      <section className="funnel-section">
        <div className="section-heading-wide">
          <span className="eyebrow">FAQ</span>
          <h2>Quick answers before setup.</h2>
        </div>
        <div className="faq-grid">
          {faqs.map(([question, answer]) => (
            <article className="faq-card" key={question}>
              <MessageSquareText size={18} />
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
