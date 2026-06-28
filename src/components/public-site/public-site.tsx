import Link from "next/link";
import { ArrowRight, Bot, CheckCircle2 } from "lucide-react";

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
        <span>Copyright {new Date().getFullYear()} One Big Media Company</span>
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
        <CheckCircle2 size={24} />
        <strong>Contact form is being connected.</strong>
        <p>
          Please check back soon or contact One Big Media Company directly for
          AI Employee setup requests.
        </p>
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
