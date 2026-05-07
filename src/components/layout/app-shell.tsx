import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = {
  activeTab: "home" | "quincena" | "agregar" | "cuentas" | "metas";
  title: string;
  subtitle: string;
  children: ReactNode;
};

const tabs = [
  { key: "home", label: "Home", href: "/" },
  { key: "quincena", label: "Quincena", href: "/quincena" },
  { key: "agregar", label: "Agregar", href: "/agregar" },
  { key: "cuentas", label: "Cuentas", href: "/cuentas" },
  { key: "metas", label: "Metas", href: "/metas" },
] as const;

export function AppShell({
  activeTab,
  title,
  subtitle,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-6xl flex-col px-5 pb-28 pt-8 md:px-8 md:pb-12">
        <header className="mb-6 flex flex-col gap-2">
          <p className="text-sm font-medium text-text-muted">Fincam</p>
          <h1 className="text-[1.75rem] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm leading-6 text-text-muted">{subtitle}</p>
        </header>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px] md:items-start">
          <section className="space-y-4">{children}</section>

          <aside className="hidden rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)] md:block">
            <p className="text-sm font-medium text-text-muted">Vista rápida</p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
                  Disponible
                </p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  $12,450
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
                  Libre de quincena
                </p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  $1,750
                </p>
              </div>
              <div className="rounded-2xl bg-olive-100 px-4 py-3 text-sm leading-6 text-olive-600">
                Base visual lista para conectar con datos reales de InsForge.
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
                      ? "bg-olive-500 text-white"
                      : "bg-background text-text-muted hover:bg-soft hover:text-foreground"
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
