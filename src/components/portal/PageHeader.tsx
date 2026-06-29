import type { ReactNode } from "react";

export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-textPrimary sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm font-light text-textMuted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
