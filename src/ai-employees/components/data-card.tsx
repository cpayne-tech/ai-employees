import Link from "next/link";
import type { ReactNode } from "react";

export function DataCard({
  title,
  description,
  viewAllHref,
  children
}: {
  title: string;
  description?: string;
  viewAllHref?: string;
  children: ReactNode;
}) {
  return (
    <section className="card data-card">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          {description ? <p className="muted">{description}</p> : null}
        </div>
        {viewAllHref ? (
          <Link className="text-link" href={viewAllHref}>
            View all
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
