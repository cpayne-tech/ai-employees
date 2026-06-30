import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, ShieldCheck } from "lucide-react";
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
    "One focused AI employee",
    "Business intake and workflow setup",
    "Lead capture dashboard",
    "Built-in testing before launch"
  ],
  growth: [
    "Full five-role AI employee team",
    "GoHighLevel contact, tag, calendar, and pipeline mapping",
    "Customer intake and private workspace",
    "Recommended for most businesses"
  ],
  scale: [
    "Everything in AI Employee Team",
    "Custom workflow planning",
    "n8n-ready orchestration support",
    "Monthly optimization review"
  ]
};

const purchaseSteps = [
  "Choose package",
  "Pay setup fee",
  "Complete intake",
  "Review launch"
];

const pricingFaqs = [
  ["Which plan should I pick?", "Most businesses should start with AI Employee Team because it includes all five core roles."],
  ["What happens after I pay?", "Your customer record is created, setup tasks begin, and you complete business intake before launch review."],
  ["Does this activate AI automatically?", "No. Setup, GoHighLevel mapping, and production activation stay review-first."]
];

export default function PricingPage() {
  const recommendedPlan = billingPlans.find((plan) => plan.recommended) ?? billingPlans[0];

  return (
    <PublicPageShell>
      <section className="funnel-page-hero pricing-page-hero">
        <div>
          <span className="eyebrow">Pricing</span>
          <h1>Pick the setup level. Then complete intake.</h1>
          <p>
            Start with the setup package. After payment, the next job is simple:
            submit business details so OBMC can build and review your AI employees.
          </p>
          <div className="funnel-hero-actions">
            <Link className="button" href={getSetupPaymentLinkUrl(recommendedPlan)} target="_blank">
              Start with {recommendedPlan.name}
              <ArrowRight size={16} />
            </Link>
            <Link className="button secondary" href="/purchase-success">See What Happens Next</Link>
          </div>
        </div>
        <div className="pricing-summary-panel pricing-photo-panel">
          <div
            aria-label="Team planning automation packages and implementation steps"
            className="stock-visual stock-visual-pricing compact"
          />
          <ShieldCheck size={24} />
          <strong>Recommended: {recommendedPlan.name}</strong>
          <p>{recommendedPlan.summary}</p>
        </div>
      </section>

      <section className="funnel-section pricing-flow-section">
        <div className="section-heading-wide">
          <span className="eyebrow">Purchase flow</span>
          <h2>Four steps, no guessing.</h2>
        </div>
        <div className="purchase-flow-grid">
          {purchaseSteps.map((step, index) => (
            <div className="purchase-flow-step" key={step}>
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="funnel-section">
        <div className="pricing-offer-grid simplified">
          {billingPlans.map((plan) => (
            <article className={plan.recommended ? "pricing-offer-card featured simplified" : "pricing-offer-card simplified"} key={plan.id}>
              <span>{plan.recommended ? "Best fit" : "Package"}</span>
              <h2>{plan.name}</h2>
              <p>{plan.audience}</p>
              <div className="price-lockup">
                <strong>{plan.setupFee}</strong>
                <small>{plan.monthlyFee} after setup</small>
              </div>
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

      <section className="funnel-section split">
        <div>
          <span className="eyebrow">After checkout</span>
          <h2>Payment is only the first step. Intake starts the actual build.</h2>
          <p>
            The system is designed to create a customer setup record after purchase.
            The customer then completes intake so OBMC can configure roles, rules,
            GoHighLevel mapping, and launch approval.
          </p>
        </div>
        <div className="after-purchase-card">
          <ClipboardList size={24} />
          <strong>Post-purchase page ready</strong>
          <p>Use this page as the success redirect for GHL/Stripe payment links:</p>
          <Link className="text-link" href="/purchase-success">/purchase-success</Link>
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
