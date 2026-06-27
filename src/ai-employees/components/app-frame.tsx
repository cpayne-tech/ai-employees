import Link from "next/link";
import type { ReactNode } from "react";

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link href="/ai-employees" className="brand-lockup">
          <strong>One Big Media Company</strong>
          <span>AI Employees</span>
        </Link>
        <nav className="button-row" aria-label="Primary">
          <Link href="/ai-employees" className="button ghost">
            Dashboard
          </Link>
          <Link href="/ai-employees/new" className="button">
            New AI Employee
          </Link>
        </nav>
      </header>
      <main className="page">{children}</main>
    </div>
  );
}
