import Link from "next/link";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel
}: {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="empty-state">
      <h2>{title}</h2>
      {description ? <p className="muted">{description}</p> : null}
      {actionHref && actionLabel ? (
        <Link className="button" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
