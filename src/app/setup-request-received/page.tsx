import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ClipboardList, MailCheck, ShieldCheck } from "lucide-react";
import { PublicPageShell } from "@/components/public-site/public-site";

export const metadata: Metadata = {
  title: "Setup Request Received | OBMC AI Employees",
  description: "Confirmation page after requesting OBMC AI Employee setup.",
  robots: {
    index: false,
    follow: false
  }
};

const nextSteps = [
  {
    icon: CheckCircle2,
    title: "Request saved",
    text: "Your setup request was added to the OBMC admin queue."
  },
  {
    icon: MailCheck,
    title: "OBMC reviews it",
    text: "The team reviews your package interest, timeline, and first workflow priority."
  },
  {
    icon: ClipboardList,
    title: "Private intake follows",
    text: "You will receive or be assigned a private intake link for the details needed to build."
  },
  {
    icon: ShieldCheck,
    title: "Launch stays reviewed",
    text: "Production CRM changes and automations stay controlled until the setup is approved."
  }
];

export default function SetupRequestReceivedPage() {
  return (
    <PublicPageShell>
      <section className="funnel-page-hero purchase-success-hero">
        <div>
          <span className="eyebrow">Request received</span>
          <h1>Your setup request is in the OBMC queue.</h1>
          <p>
            Thanks for requesting AI Employee setup. OBMC has the basics needed
            to review your request and prepare the next intake step.
          </p>
          <div className="funnel-hero-actions">
            <Link className="button" href="/pricing">
              Review Packages
              <ArrowRight size={16} />
            </Link>
            <Link className="button secondary" href="/">Back Home</Link>
          </div>
        </div>
        <div className="purchase-success-panel">
          <CheckCircle2 size={28} />
          <strong>What happens next?</strong>
          <p>
            OBMC reviews the request, confirms the right package path, and sends
            the private intake link when it is time to collect launch details.
          </p>
        </div>
      </section>

      <section className="funnel-section">
        <div className="section-heading-wide">
          <span className="eyebrow">Next steps</span>
          <h2>A cleaner path from request to setup.</h2>
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
