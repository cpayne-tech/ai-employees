import type { Metadata } from "next";
import { Headphones, Handshake, Settings } from "lucide-react";
import { GHLContactFormEmbed, PublicPageShell } from "@/components/public-site/public-site";

export const metadata: Metadata = {
  title: "Contact | Request AI Employee Setup",
  description:
    "Request OBMC AI Employee setup, partnership information, or admin support for managed AI workforce implementation.",
  openGraph: {
    title: "Contact | Request AI Employee Setup",
    description:
      "Contact One Big Media Company to request managed AI Employee setup and GoHighLevel-aware implementation.",
    url: "https://ai-employees-gamma.vercel.app/contact",
    siteName: "OBMC AI Employees",
    type: "website"
  }
};

const contactBlocks = [
  {
    icon: Settings,
    title: "Setup request",
    text: "Tell us about the first AI employee workflow you want mapped."
  },
  {
    icon: Handshake,
    title: "Partnership inquiry",
    text: "Discuss agency, implementation, or GoHighLevel-aligned collaboration."
  },
  {
    icon: Headphones,
    title: "Support/admin inquiry",
    text: "Ask about existing setup, customer portal access, or launch readiness."
  }
];

export default function ContactPage() {
  return (
    <PublicPageShell>
      <section className="funnel-page-hero">
        <div>
          <span className="eyebrow">Request AI Employee Setup</span>
          <h1>Map your first AI employee workflow with OBMC.</h1>
          <p>
            Share what your business needs to capture, qualify, route, or follow up on.
            OBMC will use that context to plan the right AI employee setup and GoHighLevel handoff.
          </p>
        </div>
      </section>

      <section className="contact-layout">
        <div className="contact-form-card">
          <GHLContactFormEmbed />
        </div>
        <div className="contact-side">
          {contactBlocks.map((block) => (
            <article className="contact-block" key={block.title}>
              <block.icon size={22} />
              <h2>{block.title}</h2>
              <p>{block.text}</p>
            </article>
          ))}
        </div>
      </section>
    </PublicPageShell>
  );
}
