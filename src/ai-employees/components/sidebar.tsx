"use client";

import clsx from "clsx";
import {
  BarChart3,
  Bot,
  CalendarClock,
  CreditCard,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  MonitorSmartphone,
  Plus,
  ReceiptText,
  Settings,
  Siren,
  UsersRound,
  Workflow
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAiEmployeesAction } from "@/ai-employees/auth-actions";

const mainNav = [
  {
    href: "/ai-employees",
    icon: LayoutDashboard,
    label: "Dashboard",
    match: (pathname: string) => pathname === "/ai-employees"
  },
  {
    href: "/ai-employees/employees",
    icon: Bot,
    label: "AI Employees",
    match: (pathname: string) =>
      pathname === "/ai-employees/employees" ||
      pathname === "/ai-employees/new" ||
      pathname === "/ai-employees/onboarding" ||
      /^\/ai-employees\/[0-9a-f-]{36}(?:\/(?:edit|test|ghl-profile|ghl-export))?$/.test(pathname)
  },
  {
    href: "/ai-employees/leads",
    icon: Inbox,
    label: "Leads",
    match: (pathname: string) => pathname.startsWith("/ai-employees/leads")
  },
  {
    href: "/ai-employees/conversations",
    icon: MessageSquareText,
    label: "Conversations",
    match: (pathname: string) => pathname.startsWith("/ai-employees/conversations")
  },
  {
    href: "/ai-employees/appointments",
    icon: CalendarClock,
    label: "Appointments",
    match: (pathname: string) => pathname.startsWith("/ai-employees/appointments")
  },
  {
    href: "/ai-employees/escalations",
    icon: Siren,
    label: "Escalations",
    match: (pathname: string) => pathname.startsWith("/ai-employees/escalations")
  },
  {
    href: "/ai-employees/gohighlevel",
    icon: Workflow,
    label: "GoHighLevel",
    match: (pathname: string) => pathname.startsWith("/ai-employees/gohighlevel")
  },
  {
    href: "/ai-employees/customers",
    icon: UsersRound,
    label: "Customers",
    match: (pathname: string) => pathname.startsWith("/ai-employees/customers")
  },
  {
    href: "/ai-employees/customer-preview",
    icon: MonitorSmartphone,
    label: "Customer View",
    match: (pathname: string) => pathname.startsWith("/ai-employees/customer-preview")
  },
  {
    href: "/ai-employees/pricing",
    icon: ReceiptText,
    label: "Pricing Page",
    match: (pathname: string) => pathname.startsWith("/ai-employees/pricing")
  }
];

const adminNav = [
  {
    href: "/ai-employees/billing",
    icon: CreditCard,
    label: "Billing",
    match: (pathname: string) => pathname.startsWith("/ai-employees/billing")
  },
  {
    href: "/ai-employees/settings",
    icon: Settings,
    label: "Settings",
    match: (pathname: string) => pathname.startsWith("/ai-employees/settings")
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Link href="/ai-employees" className="brand-lockup">
          <strong>One Big Media Company</strong>
          <span>AI Employees</span>
        </Link>
        <span className="sidebar-badge">Admin</span>
      </div>

      <Link className="sidebar-cta" href="/ai-employees/new">
        <Plus size={16} />
        New AI Employee
      </Link>

      <nav className="sidebar-nav" aria-label="Main navigation">
        <span className="nav-section-label">Main</span>
        {mainNav.map((item) => (
          <SidebarLink
            active={item.match(pathname)}
            href={item.href}
            icon={item.icon}
            key={item.href}
            label={item.label}
          />
        ))}
      </nav>

      <nav className="sidebar-nav" aria-label="Admin navigation">
        <span className="nav-section-label">Admin</span>
        {adminNav.map((item) => (
          <SidebarLink
            active={item.match(pathname)}
            href={item.href}
            icon={item.icon}
            key={item.href}
            label={item.label}
          />
        ))}
      </nav>

      <div className="sidebar-spacer" />

      <div className="sidebar-footer">
        <div className="signed-in-card">
          <BarChart3 size={16} />
          <div>
            <span>Signed in as</span>
            <strong>Admin</strong>
          </div>
        </div>
        <form action={logoutAiEmployeesAction}>
          <button className="sidebar-link sign-out" type="submit">
            <LogOut size={16} />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}

function SidebarLink({
  active,
  href,
  icon: Icon,
  label
}: {
  active: boolean;
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
}) {
  return (
    <Link className={clsx("sidebar-link", active && "active")} href={href}>
      <Icon size={16} />
      {label}
    </Link>
  );
}
