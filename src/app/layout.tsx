import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "OBMC AI Employees | Managed AI Workforce Setup",
    template: "%s | OBMC AI Employees"
  },
  description:
    "Create role-specific AI employees for lead capture, qualification, appointment handoff, support triage, and GoHighLevel-connected follow-up.",
  openGraph: {
    title: "OBMC AI Employees | Managed AI Workforce Setup",
    description:
      "A managed AI Employee Operating System for businesses that need customer conversations captured, qualified, organized, followed up, and connected into GoHighLevel.",
    siteName: "OBMC AI Employees",
    type: "website",
    url: "https://ai-employees-gamma.vercel.app"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
