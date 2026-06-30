import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2, ClipboardList } from "lucide-react";
import { billingPlans } from "@/ai-employees/billing";
import { submitPublicSetupRequestAction } from "@/ai-employees/public-setup-actions";

export const publicNavLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" }
];

export function PublicHeader() {
  return (
    <header className="funnel-header">
      <Link className="funnel-brand" href="/">
        <Bot size={22} />
        <span>
          <strong>OBMC AI Employees</strong>
          <small>Managed AI Workforce</small>
        </span>
      </Link>
      <nav className="funnel-nav" aria-label="Public navigation">
        {publicNavLinks.map((link) => (
          <Link href={link.href} key={link.href}>{link.label}</Link>
        ))}
      </nav>
      <Link className="button funnel-nav-cta" href="/contact">
        Start Setup
        <ArrowRight size={16} />
      </Link>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="funnel-footer">
      <div className="funnel-footer-main">
        <div>
          <Link className="funnel-brand" href="/">
            <Bot size={22} />
            <span>
              <strong>OBMC AI Employees</strong>
              <small>Managed AI Workforce</small>
            </span>
          </Link>
          <p>
            A managed AI Employee Operating System for lead capture, qualification,
            follow-up coordination, and GoHighLevel-connected customer handling.
          </p>
        </div>
        <div className="funnel-footer-links">
          <Link href="/">Home</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
        <div className="funnel-footer-cta">
          <strong>Ready to map your first AI employee?</strong>
          <Link className="button" href="/contact">
            Start Setup
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
      <div className="funnel-footer-bottom">
        <span>Copyright {new Date().getFullYear()} One Big Media Company LLC</span>
        <span>Human-controlled AI workforce setup.</span>
      </div>
    </footer>
  );
}

export function FunnelCta({
  eyebrow = "Start with a managed setup",
  title,
  text,
  secondaryHref = "/pricing",
  secondaryLabel = "View Pricing"
}: {
  eyebrow?: string;
  title: string;
  text: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <section className="funnel-cta-band">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div className="funnel-cta-actions">
        <Link className="button" href="/contact">
          Request AI Employee Setup
          <ArrowRight size={16} />
        </Link>
        <Link className="button secondary" href={secondaryHref}>{secondaryLabel}</Link>
      </div>
    </section>
  );
}

export function GHLContactFormEmbed() {
  const embedUrl = process.env.NEXT_PUBLIC_GHL_CONTACT_FORM_URL;

  if (!embedUrl) {
    return (
      <div className="ghl-form-placeholder">
        <div className="setup-request-form-heading">
          <ClipboardList size={24} />
          <div>
            <strong>Request AI Employee setup</strong>
            <p>
              Submit this form to create a setup request in the OBMC admin queue.
              OBMC can then send your private intake link.
            </p>
          </div>
        </div>
        <form action={submitPublicSetupRequestAction} className="setup-request-form">
          <input aria-hidden="true" className="hidden-honeypot" name="companyUrl" tabIndex={-1} />
          <label className="field">
            Business name
            <input name="businessName" placeholder="Your company" required />
          </label>
          <label className="field">
            Your name
            <input name="contactName" placeholder="Primary contact" required />
          </label>
          <label className="field">
            Email
            <input name="email" placeholder="you@example.com" required type="email" />
          </label>
          <label className="field">
            Phone
            <input name="phone" placeholder="Best callback number" />
          </label>
          <label className="field">
            Website
            <input name="website" placeholder="https://example.com" type="url" />
          </label>
          <label className="field">
            Package
            <select name="planId" defaultValue="growth">
              {billingPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
              <option value="manual">Not sure yet</option>
            </select>
          </label>
          <label className="field">
            Timeline
            <select name="timeline" defaultValue="soon">
              <option value="soon">As soon as possible</option>
              <option value="this_month">This month</option>
              <option value="exploring">Just exploring</option>
            </select>
          </label>
          <label className="field">
            Do you use GoHighLevel?
            <select name="currentGhl" defaultValue="not_sure">
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="not_sure">Not sure</option>
            </select>
          </label>
          <label className="field full">
            What should the AI employees help with first?
            <textarea name="primaryNeed" placeholder="Lead capture, appointment requests, support questions, follow-up, or something else..." required />
          </label>
          <label className="field full">
            Anything else OBMC should know?
            <textarea name="notes" placeholder="Optional context, current tools, launch concerns, or best time to follow up." />
          </label>
          <div className="setup-request-submit-row">
            <button className="button" type="submit">
              Submit Setup Request
              <ArrowRight size={16} />
            </button>
            <span>
              <CheckCircle2 size={15} />
              Creates a private setup record for OBMC review.
            </span>
          </div>
        </form>
      </div>
    );
  }

  return (
    <iframe
      className="ghl-form-embed"
      src={embedUrl}
      title="Request AI Employee Setup"
    />
  );
}

export function PublicPageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="funnel-shell">
      <PublicHeader />
      {children}
      <PublicFooter />
    </main>
  );
}
