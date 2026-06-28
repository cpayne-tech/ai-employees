import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { billingPlans, getSetupPaymentLinkUrl } from "@/ai-employees/billing";
import { FunnelCta, PublicPageShell } from "@/components/public-site/public-site";

export const metadata: Metadata = {
  title: "Pricing | OBMC AI Employees",
  description:
    "Compare managed AI Employee setup packages for role-specific lead capture, qualification, GoHighLevel mapping, and human-controlled launch.",
  openGraph: {
    title: "Pricing | OBMC AI Employees",
    description:
      "Setup packages for one AI employee, AI employee teams, and full managed AI workforce implementation.",
    url: "https://ai-employees-gamma.vercel.app/pricing",
    siteName: "OBMC AI Employees",
    type: "website"
  }
};

const packageNotes: Record<string, string[]> = {
  starter: [
    "One AI employee role",
    "Business intake",
    "Prompt and instruction setup",
    "Basic lead capture",
    "Internal simulation",
    "Launch checklist"
  ],
  growth: [
    "Up to the full five-role AI employee team",
    "GoHighLevel mapping",
    "Qualification rules",
    "Escalation rules",
    "Pipeline and calendar mapping plan",
    "Workflow trigger plan"
  ],
  scale: [
    "All AI employee roles",
    "Complete intake and configuration",
    "Full GoHighLevel mapping plan",
    "Internal simulation review",
    "Launch readiness checklist",
    "Premium setup support"
  ]
};

const pricingFaqs = [
  ["Is this a chatbot?", "No. It is a managed AI workforce setup with role design, intake, CRM mapping, records, and launch review."],
  ["Do I need GoHighLevel?", "GoHighLevel is the preferred execution layer. The system is designed around GHL contacts, notes, tags, calendars, pipelines, and workflows."],
  ["Will it replace my staff?", "No. It helps your staff respond faster, collect better information, and organize follow-up. Human review stays part of the process."],
  ["Can I approve before launch?", "Yes. The setup includes internal simulation and human-controlled launch review."],
  ["Does it change my existing GHL account?", "Existing GoHighLevel assets should be discovered and preserved. Production changes require approval."],
  ["Can it work for regulated industries?", "It can capture information and route conversations, but it does not provide legal, medical, or financial advice."]
];

export default function PricingPage() {
  const recommendedPlan = billingPlans.find((plan) => plan.recommended) ?? billingPlans[0];

  return (
    <PublicPageShell>
      <section className="funnel-page-hero pricing-page-hero">
        <div>
          <span className="eyebrow">Pricing</span>
          <h1>Choose the managed AI Employee setup that fits your business.</h1>
          <p>
            Setup pricing is already connected through GHL and Stripe. Start with the setup level
            you need, then activate the matching SaaS plan during onboarding.
          </p>
          <div className="funnel-hero-actions">
            <Link className="button" href={getSetupPaymentLinkUrl(recommendedPlan)} target="_blank">
              Start with {recommendedPlan.name}
              <ArrowRight size={16} />
            </Link>
            <Link className="button secondary" href="/contact">Ask a Setup Question</Link>
          </div>
        </div>
        <div className="pricing-summary-panel pricing-photo-panel">
          <div
            aria-label="Team planning automation packages and implementation steps"
            className="stock-visual stock-visual-pricing compact"
          />
          <ShieldCheck size={24} />
          <strong>Human-controlled launch is included.</strong>
          <p>No production CRM workflow goes live until setup, mapping, and handoff rules are reviewed.</p>
        </div>
      </section>

      <section className="funnel-section">
        <div className="pricing-offer-grid">
          {billingPlans.map((plan) => (
            <article className={plan.recommended ? "pricing-offer-card featured" : "pricing-offer-card"} key={plan.id}>
              <span>{plan.recommended ? "Recommended" : "Package"}</span>
              <h2>{plan.name}</h2>
              <p>{plan.audience}</p>
              <div className="price-lockup">
                <strong>{plan.setupFee}</strong>
                <small>{plan.monthlyFee} after setup</small>
              </div>
              <p>{plan.summary}</p>
              <ul>
                {(packageNotes[plan.id] ?? plan.includes).map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={16} />
                    {item}
                  </li>
                ))}
              </ul>
              <Link className={plan.recommended ? "button" : "button secondary"} href={getSetupPaymentLinkUrl(plan)} target="_blank">
                Pay setup fee
                <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <FunnelCta
        title="Not sure which setup level fits?"
        text="Request a setup conversation and OBMC can help map the first AI employee workflow before you choose the full package."
      />

      <section className="funnel-section">
        <div className="section-heading-wide">
          <span className="eyebrow">Pricing FAQ</span>
          <h2>Common questions before purchase</h2>
        </div>
        <div className="faq-grid">
          {pricingFaqs.map(([question, answer]) => (
            <article className="faq-card" key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
