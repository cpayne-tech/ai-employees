import type { Metadata } from "next";
import { BrainCircuit, ShieldCheck, Workflow } from "lucide-react";
import { FunnelCta, PublicPageShell } from "@/components/public-site/public-site";

export const metadata: Metadata = {
  title: "About | OBMC AI Employees",
  description:
    "Learn why One Big Media Company is building managed AI employees for practical customer handling, GoHighLevel-aware automation, and human-controlled deployment.",
  openGraph: {
    title: "About | OBMC AI Employees",
    description:
      "A practical, human-controlled approach to managed AI workforce setup for businesses using GoHighLevel.",
    url: "https://ai-employees-gamma.vercel.app/about",
    siteName: "OBMC AI Employees",
    type: "website"
  }
};

const values = [
  {
    icon: BrainCircuit,
    title: "Practical business automation",
    text: "AI employees should solve real operational problems: missed leads, weak follow-up, scattered notes, and slow response."
  },
  {
    icon: Workflow,
    title: "GoHighLevel-aware implementation",
    text: "The setup is built around the CRM assets businesses already rely on: contacts, calendars, pipelines, tags, notes, and workflows."
  },
  {
    icon: ShieldCheck,
    title: "Human-controlled AI",
    text: "AI should prepare, organize, and assist. Sensitive decisions, production launch, and escalations remain human controlled."
  }
];

export default function AboutPage() {
  return (
    <PublicPageShell>
      <section className="funnel-page-hero visual-page-hero">
        <div>
          <span className="eyebrow">About One Big Media Company</span>
          <h1>Building AI employees that help businesses operate with more clarity and control.</h1>
          <p>
            OBMC AI Employees exists to make practical AI automation easier to deploy.
            The goal is not hype, replacement, or a generic chatbot. The goal is a managed
            setup that helps businesses capture conversations, organize customer data,
            prepare follow-up, and connect the right work into GoHighLevel.
          </p>
        </div>
        <div
          aria-label="Business operators reviewing process improvements together"
          className="stock-visual stock-visual-team"
        />
      </section>

      <section className="funnel-section split">
        <div>
          <span className="eyebrow">Mission</span>
          <h2>Make customer handling faster without removing human judgment.</h2>
          <p>
            Businesses need better systems for the conversations they already receive.
            OBMC focuses on role-specific AI employees that can collect details, label
            intent, summarize conversations, prepare handoffs, and help teams know what
            to do next.
          </p>
          <p>
            The managed setup approach matters because every business has different services,
            rules, calendars, qualification needs, and escalation paths. AI employees should be
            configured around those realities before launch.
          </p>
        </div>
        <div className="about-principle-card">
          <strong>Human-controlled deployment philosophy</strong>
          <p>
            We design AI employees to support teams, not quietly take over production systems.
            Existing GoHighLevel assets should be discovered, reviewed, and preserved before
            activation. Launch approval stays explicit.
          </p>
        </div>
      </section>

      <section className="funnel-section">
        <div className="value-grid">
          {values.map((value) => (
            <article className="value-card" key={value.title}>
              <value.icon size={24} />
              <h2>{value.title}</h2>
              <p>{value.text}</p>
            </article>
          ))}
        </div>
      </section>

      <FunnelCta
        title="Start with one practical AI employee workflow."
        text="OBMC can help map the first role, intake fields, GoHighLevel handoff, and launch-readiness checklist."
      />
    </PublicPageShell>
  );
}
