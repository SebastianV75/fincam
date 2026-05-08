import Link from 'next/link';
import type { ReactNode } from 'react';

type SectionRow = {
  label: string;
  meta?: string;
  value: string;
  tone?: 'default' | 'danger';
};

type SectionCardProps = {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  rows?: SectionRow[];
  children?: ReactNode;
};

export function SectionCard({
  title,
  actionLabel,
  actionHref,
  rows = [],
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {actionLabel ? (
          actionHref ? (
            <Link
              href={actionHref}
              className="text-sm font-medium text-olive-600 transition-colors hover:text-olive-500"
            >
              {actionLabel}
            </Link>
          ) : (
            <span className="text-sm font-medium text-olive-600">{actionLabel}</span>
          )
        ) : null}
      </div>

      {children}

      {rows.length > 0 ? (
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div
              key={`${row.label}-${row.meta ?? 'none'}-${row.value}`}
              className={`flex items-center justify-between gap-4 ${
                index > 0 ? 'border-t border-border-soft/70 pt-3' : ''
              }`}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-body">{row.label}</p>
                {row.meta ? (
                  <p className="mt-1 text-xs text-text-muted">{row.meta}</p>
                ) : null}
              </div>
              <p
                className={`shrink-0 text-sm font-semibold ${
                  row.tone === 'danger' ? 'text-danger-500' : 'text-foreground'
                }`}
              >
                {row.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
