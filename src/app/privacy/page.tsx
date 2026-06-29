import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public-site/public-site";

export const metadata: Metadata = {
  title: "Privacy | OBMC AI Employees",
  description:
    "Privacy Policy for OBMC AI Employees by One Big Media Company LLC, including personal information, AI conversation data, CRM integrations, payments, cookies, rights requests, and third-party platforms.",
  openGraph: {
    title: "Privacy | OBMC AI Employees",
    description: "Privacy overview for OBMC AI Employees.",
    url: "https://ai-employees-gamma.vercel.app/privacy",
    siteName: "OBMC AI Employees",
    type: "website"
  }
};

const sections = [
  ["Owner and scope", "OBMC AI Employees is owned and operated by One Big Media Company LLC. This Privacy Policy explains how we collect, use, disclose, retain, and protect information through this website, the AI Employees app, setup intake, billing workflows, customer portal, and related managed implementation services."],
  ["Information we collect", "We may collect identifiers and contact details such as name, business name, email address, phone number, billing contact details, login/session information, and support contact information. We may also collect commercial information such as selected package, purchase status, setup fee, subscription plan, Stripe event records, and implementation history."],
  ["Business and setup intake", "During setup we may collect business services, hours, locations, website details, FAQs, offer details, qualification rules, appointment rules, calendar preferences, lead fields, escalation contacts, tone preferences, approved responses, GoHighLevel configuration notes, and other operational details needed to configure AI employee workflows."],
  ["AI conversation and CRM data", "AI simulations, tests, and connected workflows may process transcripts, message summaries, extracted lead details, appointment requests, support issues, tags, notes, pipeline status, calendar mapping, workflow status, and sync results. AI-generated output may be stored so humans can review, audit, improve, and support the setup."],
  ["How we collect information", "We collect information directly from forms, checkout flows, customer intake, admin entries, messages, support requests, and connected systems. We may also receive information from service providers and integrations such as GoHighLevel, Stripe, Supabase, Vercel, n8n, and AI or messaging providers when configured."],
  ["How we use information", "We use information to respond to inquiries, process purchases, create customer records, provide setup and support, configure AI employees, map GoHighLevel workflows, run internal simulations, maintain security, troubleshoot integrations, improve the service, send service communications, and comply with legal, tax, accounting, fraud-prevention, and operational obligations."],
  ["Legal bases and business purposes", "Where applicable privacy law requires a legal basis, we process information to perform requested services, take steps before entering a service relationship, operate and secure the platform, comply with legal obligations, protect rights and prevent misuse, and pursue legitimate business purposes such as customer support, service improvement, billing, and implementation management."],
  ["Third-party processors and disclosures", "We may disclose information to service providers that help operate the website and service, including hosting, database, CRM, billing, automation, analytics, communications, AI, and security providers. We may also disclose information when required by law, to protect rights or safety, to prevent fraud or abuse, or as part of a merger, acquisition, financing, reorganization, or sale of business assets."],
  ["Payments", "Payments are processed by Stripe or connected payment providers. We do not intentionally store full payment card numbers in the app. Payment processors may collect and process payment details under their own privacy and security terms."],
  ["Cookies and analytics", "The website and app may use cookies, local storage, session cookies, analytics, logging, and similar technologies to operate login sessions, secure the service, understand traffic, improve performance, and remember preferences. Browser settings may allow visitors to block or delete cookies, but some features may not work without necessary cookies."],
  ["Marketing communications", "If we send marketing emails, we will use accurate sender information, avoid deceptive subject lines, identify promotional content where required, include an unsubscribe method where required, and honor opt-out requests as required by applicable email marketing laws. Service, billing, setup, security, and transactional messages may still be sent when needed to provide the service."],
  ["No sale of personal information", "We do not sell personal information for money. We do not knowingly share personal information for cross-context behavioral advertising unless a future feature clearly states otherwise and provides any opt-out required by applicable law."],
  ["Sensitive information", "The service is not designed to collect highly sensitive personal information unless a customer intentionally provides it for an approved business purpose. Do not submit Social Security numbers, bank account credentials, protected health information, legal case details, financial account credentials, or other sensitive data unless a written agreement specifically authorizes that collection and handling."],
  ["Data retention", "We retain information for as long as reasonably needed to provide the service, complete setup, maintain customer records, support billing and accounting, comply with legal obligations, resolve disputes, enforce agreements, prevent fraud or abuse, and maintain security logs. Retention periods may vary based on record type, customer relationship, legal requirements, and operational need."],
  ["Security", "We use reasonable administrative, technical, and organizational safeguards designed to protect information, including restricted secret handling, server-side environment variables, access controls, hosted infrastructure protections, and review of operational workflows. No website, app, database, network, or transmission method can be guaranteed to be completely secure."],
  ["Children's privacy", "The service is intended for businesses and is not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe a child provided information, contact us through the Contact page so we can review and delete it where required."],
  ["Privacy rights", "Depending on where you live, you may have rights to request access, correction, deletion, portability, restriction, opt-out of certain processing, or information about categories of data collected, sources, purposes, disclosures, and third parties. You may also have the right not to be discriminated against for exercising privacy rights."],
  ["California, Colorado, and other state rights", "If a state privacy law applies to your information, you may submit a request through the Contact page. We may need to verify your identity or authority before responding. Authorized agents may submit requests where allowed by law. If an appeal process is required by applicable law, you may appeal a denied request by replying to the decision or submitting a follow-up request through the Contact page."],
  ["International visitors", "The service is operated from the United States. If you access it from outside the United States, your information may be processed in the United States or other locations where service providers operate, and those locations may have data protection laws different from your location."],
  ["Changes to this policy", "We may update this Privacy Policy when the service, integrations, legal requirements, or business practices change. The updated version will be posted on this page with a new effective date when appropriate."],
  ["Contact", "Privacy requests, access requests, deletion requests, correction requests, opt-out requests, and questions about this Privacy Policy can be submitted through the Contact page on this website."]
];

export default function PrivacyPage() {
  return (
    <PublicPageShell>
      <section className="legal-page">
        <span className="eyebrow">Privacy</span>
        <h1>Privacy Policy</h1>
        <p className="legal-meta">Effective date: June 29, 2026. Owner: One Big Media Company LLC.</p>
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
