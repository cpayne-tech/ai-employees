import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OBMC AI Employees",
  description: "AI employee management for One Big Media Company."
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
