import Link from 'next/link';
import type { ReactNode } from 'react';

type DesktopSummaryStat = {
  label: string;
  value: string;
  tone?: 'default' | 'danger' | 'accent';
};

type DesktopSummary = {
  title?: string;
  stats?: DesktopSummaryStat[];
  note?: string;
};

type AppShellProps = {
  activeTab: 'home' | 'quincena' | 'agregar' | 'recurrentes' | 'cuentas' | 'metas';
  title: string;
  subtitle: string;
  desktopSummary?: DesktopSummary;
  children: ReactNode;
};

const tabs = [
  { key: 'home', label: 'Inicio', href: '/' },
  { key: 'quincena', label: 'Quincena', href: '/quincena' },
  { key: 'recurrentes', label: 'Recurrentes', href: '/recurrentes' },
  { key: 'cuentas', label: 'Cuentas', href: '/cuentas' },
  { key: 'metas', label: 'Metas', href: '/metas' },
] as const;

function toneClasses(tone: DesktopSummaryStat['tone']) {
  if (tone === 'danger') {
    return 'text-danger-500';
  }

  if (tone === 'accent') {
    return 'text-olive-600';
  }

  return 'text-foreground';
}

export function AppShell({
  activeTab,
  title,
  subtitle,
  desktopSummary,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col px-5 pb-28 pt-6 md:px-8 md:pb-12 md:pt-8">
        <header className="mb-6 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface px-3 py-2 text-sm font-medium text-text-body transition-colors hover:bg-soft"
            >
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-olive-500" />
              Fincam
            </Link>

            <Link
              href="/agregar"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-olive-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-olive-600"
            >
              Nuevo movimiento
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-[1.75rem] font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-text-muted">{subtitle}</p>
          </div>

          <nav className="hidden md:block">
            <ul className="flex flex-wrap gap-2 rounded-[24px] border border-border-soft bg-surface p-2 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]">
              {tabs.map((tab) => {
                const isActive = tab.key === activeTab;

                return (
                  <li key={tab.key}>
                    <Link
                      href={tab.href}
                      className={`flex min-h-11 items-center justify-center rounded-2xl px-4 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-olive-500 text-white'
                          : 'text-text-muted hover:bg-soft hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </header>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px] md:items-start">
          <section className="space-y-4">{children}</section>

          <aside className="hidden rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)] md:sticky md:top-8 md:block">
            <p className="text-sm font-medium text-text-muted">
              {desktopSummary?.title ?? 'Vista rápida'}
            </p>
            <div className="mt-4 space-y-4">
              {(desktopSummary?.stats ?? []).map((stat) => (
                <div key={`${stat.label}-${stat.value}`}>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
                    {stat.label}
                  </p>
                  <p className={`mt-1 text-2xl font-semibold ${toneClasses(stat.tone)}`}>
                    {stat.value}
                  </p>
                </div>
              ))}

              <div className="rounded-2xl bg-olive-100 px-4 py-3 text-sm leading-6 text-olive-600">
                {desktopSummary?.note ??
                  'Base visual lista para conectar con datos reales de InsForge.'}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 border-t border-border-soft bg-surface/95 px-3 py-3 backdrop-blur md:hidden">
        <ul className="mx-auto grid max-w-md grid-cols-5 gap-2">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;

            return (
              <li key={tab.key}>
                <Link
                  href={tab.href}
                  className={`flex min-h-12 items-center justify-center rounded-2xl px-2 text-center text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-olive-500 text-white shadow-[0_10px_20px_rgba(111,124,79,0.18)]'
                      : 'bg-background text-text-muted hover:bg-soft hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
