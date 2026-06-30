import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, MailCheck, ShieldCheck } from "lucide-react";
import { PublicPageShell } from "@/components/public-site/public-site";

export const metadata: Metadata = {
  title: "Purchase Received | OBMC AI Employees",
  description:
    "Post-purchase next steps for OBMC AI Employees setup, including customer intake, workspace creation, and launch review.",
  robots: {
    index: false,
    follow: false
  }
};

const nextSteps = [
  {
    icon: MailCheck,
    title: "Payment is recorded",
    text: "The purchase webhook creates or updates the customer setup record when the payment provider sends the event."
  },
  {
    icon: ClipboardList,
    title: "Complete business intake",
    text: "The next required step is services, FAQs, lead fields, appointment rules, escalation contacts, and GoHighLevel notes."
  },
  {
    icon: ShieldCheck,
    title: "Review before launch",
    text: "OBMC maps the AI employees and keeps production CRM changes under human approval."
  }
];

export default function PurchaseSuccessPage() {
  return (
    <PublicPageShell>
      <section className="funnel-page-hero purchase-success-hero">
        <div>
          <span className="eyebrow">Purchase received</span>
          <h1>Your AI Employee setup is ready for intake.</h1>
          <p>
            Thank you for starting setup with One Big Media Company LLC. The next
            step is to complete the business intake so the AI employee workflow
            can be configured correctly.
          </p>
          <div className="funnel-hero-actions">
            <Link className="button" href="/contact">
              Request or Confirm Intake Link
              <ArrowRight size={16} />
            </Link>
            <Link className="button secondary" href="/pricing">Back to Packages</Link>
          </div>
        </div>
        <div className="purchase-success-panel">
          <CheckCircle2 size={28} />
          <strong>What happens now?</strong>
          <p>
            If your portal link was not sent automatically, OBMC can create or resend
            it from the admin customer screen. The setup request form also creates
            the admin-visible record OBMC needs for follow-up.
          </p>
        </div>
      </section>

      <section className="funnel-section">
        <div className="section-heading-wide">
          <span className="eyebrow">Next steps</span>
          <h2>The setup path after payment.</h2>
        </div>
        <div className="buyer-flow-grid">
          {nextSteps.map((step, index) => (
            <article className="buyer-flow-card" key={step.title}>
              <span>{index + 1}</span>
              <step.icon size={22} />
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
