import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public-site/public-site";

export const metadata: Metadata = {
  title: "Privacy | OBMC AI Employees",
  description:
    "Plain-language privacy overview for OBMC AI Employees, including contact forms, business intake, AI conversation data, CRM integrations, and third-party platforms.",
  openGraph: {
    title: "Privacy | OBMC AI Employees",
    description: "Privacy overview for OBMC AI Employees.",
    url: "https://ai-employees-gamma.vercel.app/privacy",
    siteName: "OBMC AI Employees",
    type: "website"
  }
};

const sections = [
  ["Information collected", "We may collect business contact details, setup requests, intake information, website details, services, support rules, escalation contacts, and operational preferences."],
  ["Contact form submissions", "Information submitted through contact forms may be used to respond to setup requests, partnership inquiries, or support questions."],
  ["Business intake data", "Customer intake may include services offered, business hours, lead fields, appointment rules, qualification rules, FAQs, tone preferences, and GoHighLevel notes."],
  ["AI conversation and test data", "Internal simulations or AI conversation records may include transcripts, extracted lead details, summaries, appointment requests, and escalation notes."],
  ["CRM and integration data", "When integrations are configured, records may include GoHighLevel contact IDs, notes, opportunity references, calendar mapping, tags, workflow status, and sync results."],
  ["Cookies and analytics placeholder", "The site may use cookies or analytics tools in the future to understand traffic and improve user experience. Specific tools should be documented when enabled."],
  ["Third-party platforms", "Data may be processed through third-party services used to operate the app, including GoHighLevel, Supabase, Stripe, Vercel, n8n, and AI providers when configured."],
  ["Data retention placeholder", "Data retention periods should be defined in the final customer agreement or internal data policy. Records may be kept as needed for setup, support, legal, or operational purposes."],
  ["User rights and contact", "Questions about data access, correction, or deletion can be submitted through the contact page."],
  ["Security statement", "Reasonable safeguards are used to protect operational data, but no system can be guaranteed completely secure. Secret values are not intentionally exposed in the public website."]
];

export default function PrivacyPage() {
  return (
    <PublicPageShell>
      <section className="legal-page">
        <span className="eyebrow">Privacy</span>
        <h1>Privacy Overview</h1>
        <p className="legal-disclaimer">
          This page is a general template and should be reviewed by a qualified attorney.
          It does not claim specific compliance certifications.
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
