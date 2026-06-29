import type { Metadata } from "next";
import { PublicPageShell } from "@/components/public-site/public-site";

export const metadata: Metadata = {
  title: "Terms | OBMC AI Employees",
  description:
    "Website Terms for OBMC AI Employees by One Big Media Company LLC, including service use, AI output, payments, third-party platforms, acceptable use, privacy, and liability terms.",
  openGraph: {
    title: "Terms | OBMC AI Employees",
    description: "General website terms for OBMC AI Employees.",
    url: "https://ai-employees-gamma.vercel.app/terms",
    siteName: "OBMC AI Employees",
    type: "website"
  }
};

const sections = [
  ["Owner and acceptance", "This website and the OBMC AI Employees service are owned and operated by One Big Media Company LLC. By accessing the website, submitting a form, purchasing a package, using the app, or participating in setup, you agree to these Website Terms and any additional written order form, checkout terms, service agreement, or platform terms that apply to your purchase."],
  ["Service overview", "OBMC AI Employees provides managed AI workforce setup, customer intake, AI employee configuration, GoHighLevel-aware implementation planning, internal simulation, launch-readiness review, customer records, and related operational support. The exact deliverables, timelines, fees, and ongoing services depend on the selected package and any written agreement."],
  ["Business use", "The service is intended for business users. You represent that you have authority to submit business information, purchase services, connect third-party platforms, and approve workflows on behalf of the business or organization you identify."],
  ["Account and access security", "You are responsible for keeping account access, admin credentials, API keys, CRM credentials, payment account access, and integration permissions secure. You must promptly notify One Big Media Company LLC if you believe credentials or connected systems have been compromised."],
  ["Client responsibilities", "Clients are responsible for providing accurate business information, offers, services, FAQs, policies, approved responses, escalation contacts, compliance requirements, calendars, CRM details, and launch approval decisions. Clients are responsible for reviewing AI behavior before production use and for supervising workflows after launch."],
  ["AI output and human review", "AI-generated responses, summaries, lead classifications, workflow suggestions, and setup recommendations may be incomplete, inaccurate, delayed, or inappropriate for a specific situation. AI output must be reviewed by humans before use in sensitive, regulated, high-risk, or production contexts. The service does not provide legal, medical, financial, tax, insurance, employment, or other regulated professional advice."],
  ["No guarantee of results", "AI Employee setup may help organize conversations, lead capture, qualification, intake, follow-up, and handoff, but One Big Media Company LLC does not guarantee revenue, profit, lead volume, appointment volume, conversion rate, ranking, deliverability, platform approval, customer response, or any specific business outcome."],
  ["Payments, setup fees, and subscriptions", "Fees, setup charges, recurring subscriptions, payment timing, cancellation rules, refund rules, and included services are controlled by the selected checkout, Stripe payment link, GoHighLevel SaaS plan, invoice, order form, or written agreement. Unless a written agreement says otherwise, setup fees pay for implementation work and may be non-refundable once work begins."],
  ["Third-party platforms", "The service may rely on third-party platforms such as GoHighLevel, Stripe, Supabase, Vercel, n8n, AI model providers, messaging tools, analytics tools, domain providers, and email/SMS providers. Those platforms are controlled by third parties, and their availability, pricing, approvals, outages, data practices, rate limits, terms, and feature changes are outside One Big Media Company LLC's control."],
  ["GoHighLevel dependency", "GoHighLevel-connected features depend on the customer's account permissions, location settings, API access, calendars, pipelines, workflows, custom fields, phone numbers, email configuration, A2P/SMS status, and existing CRM setup. Existing assets should be discovered and reviewed before production changes are made."],
  ["Acceptable use", "You may not use the website or service for unlawful activity, deceptive messaging, spam, harassment, unauthorized scraping, unauthorized data collection, malware, credential theft, infringement, impersonation, evasion of platform rules, discrimination, sensitive profiling, regulated advice without qualified human oversight, or activity that could harm One Big Media Company LLC, its customers, service providers, or the public."],
  ["Marketing and messaging compliance", "You are responsible for ensuring that any SMS, email, phone, chat, social, or CRM outreach complies with applicable consent, opt-out, telemarketing, email marketing, privacy, industry, and platform rules. You must provide accurate sender information, honor unsubscribe and opt-out requests where required, and avoid deceptive or misleading messages."],
  ["Data, privacy, and customer content", "Our Privacy Policy explains how information may be collected, used, disclosed, retained, and protected. You retain responsibility for customer content and business data you submit or connect. You grant One Big Media Company LLC the limited right to use submitted and connected data as needed to provide, secure, support, troubleshoot, and improve the service."],
  ["Intellectual property", "The website, app design, workflows, templates, setup structures, copy, documentation, code, and OBMC AI Employees materials are owned by One Big Media Company LLC or its licensors unless stated otherwise. You may not copy, resell, reverse engineer, or create competing services from these materials without written permission."],
  ["Customer materials", "You represent that you have the right to provide logos, business information, content, customer data, CRM data, prompts, documents, and other materials submitted during setup. You remain responsible for the legality, accuracy, and permissions associated with those materials."],
  ["Confidentiality", "Non-public business, customer, workflow, credential, pricing, and implementation information should be treated as confidential. Each party should use reasonable care to protect confidential information and only use it for the service relationship unless disclosure is required by law or authorized in writing."],
  ["Availability and changes", "The website, app, integrations, and third-party services may be updated, limited, paused, or unavailable from time to time. One Big Media Company LLC may modify features, pages, packages, workflows, and service processes as business, security, legal, or technical needs change."],
  ["Termination or suspension", "One Big Media Company LLC may suspend or terminate access to the website, app, setup process, or services if there is nonpayment, misuse, security risk, unlawful activity, platform abuse, breach of these Terms, or risk to customers, providers, or systems."],
  ["Disclaimers", "To the maximum extent permitted by law, the website and service are provided as available and without warranties of any kind, whether express, implied, statutory, or otherwise, including implied warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, uninterrupted operation, or error-free performance."],
  ["Limitation of liability", "To the maximum extent permitted by law, One Big Media Company LLC will not be liable for indirect, incidental, special, consequential, exemplary, punitive, or lost-profit damages, or for damages caused by third-party platform failures, customer-supplied information, unauthorized access caused by customer credentials, AI output, messaging compliance failures, or business decisions made from the service."],
  ["Indemnity", "You agree to defend, indemnify, and hold harmless One Big Media Company LLC from claims, losses, liabilities, damages, costs, and expenses arising from your misuse of the service, unlawful messaging, inaccurate customer content, unauthorized platform access, breach of these Terms, violation of law, or infringement of third-party rights."],
  ["Governing law", "These Terms are governed by applicable United States law and the state law identified in any signed order form, checkout terms, or written agreement. If no state is identified, the governing law will be the law of the state where One Big Media Company LLC is organized, without regard to conflict-of-law rules."],
  ["Changes to these Terms", "One Big Media Company LLC may update these Terms when the service, integrations, pricing, legal requirements, or business practices change. The updated version will be posted on this page with a new effective date when appropriate."],
  ["Contact", "Questions about these Terms, billing, privacy, setup, or service use can be submitted through the Contact page on this website."]
];

export default function TermsPage() {
  return (
    <PublicPageShell>
      <section className="legal-page">
        <span className="eyebrow">Terms</span>
        <h1>Website Terms</h1>
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
