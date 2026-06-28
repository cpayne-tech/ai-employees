import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public-site/public-site";

export const metadata: Metadata = {
  title: "Terms | OBMC AI Employees",
  description:
    "General website terms for OBMC AI Employees, including AI output, third-party platform, setup, and acceptable-use disclaimers.",
  openGraph: {
    title: "Terms | OBMC AI Employees",
    description: "General website terms for OBMC AI Employees.",
    url: "https://ai-employees-gamma.vercel.app/terms",
    siteName: "OBMC AI Employees",
    type: "website"
  }
};

const sections = [
  ["General website use", "This website provides information about OBMC AI Employees and managed AI workforce setup. By using the site, you agree to use it lawfully and responsibly."],
  ["No guarantee of results", "AI Employee setup may help organize conversations, lead capture, and follow-up, but no revenue, lead volume, appointment volume, or business result is guaranteed."],
  ["AI output disclaimer", "AI-generated responses can be incomplete, incorrect, or require human review. Clients are responsible for reviewing AI behavior before production use."],
  ["Client responsibility", "Clients are responsible for the accuracy of business information, approved FAQs, offers, policies, handoff rules, and compliance requirements supplied during setup."],
  ["Third-party platforms", "The service may rely on platforms such as GoHighLevel, Supabase, Stripe, Vercel, n8n, and AI providers. Their availability, pricing, policies, and features are outside OBMC's control."],
  ["GoHighLevel dependency", "GoHighLevel-connected features depend on account permissions, API access, calendars, pipelines, workflows, and existing CRM configuration."],
  ["Payment and setup terms", "Payment, refund, cancellation, and implementation terms should be documented in the final customer agreement or checkout terms for the selected package."],
  ["Acceptable use", "Do not use AI Employees for unlawful activity, deceptive messaging, unauthorized data collection, spam, harassment, or regulated advice outside approved human review processes."],
  ["Limitation of liability placeholder", "To the maximum extent allowed by law, liability should be limited as described in the final signed agreement between the parties."],
  ["Contact", "Questions about these terms can be routed through the contact page."]
];

export default function TermsPage() {
  return (
    <PublicPageShell>
      <section className="legal-page">
        <span className="eyebrow">Terms</span>
        <h1>Website Terms</h1>
        <p className="legal-disclaimer">
          This page is a general template and should be reviewed by a qualified attorney.
          It is not legal advice.
        </p>
        <div className="legal-section-list">
          {sections.map(([title, text]) => (
            <section className="legal-section" key={title}>
              <h2>{title}</h2>
              <p>{text}</p>
            </section>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
