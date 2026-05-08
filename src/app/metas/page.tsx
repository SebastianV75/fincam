import Link from 'next/link';

import { GoalsManager } from '@/components/forms/goals-manager';
import { AppShell } from '@/components/layout/app-shell';
import { getGoalsPageData } from '@/lib/data/finance-dashboard';
import { formatCurrency } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

function getTodayDateString() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export default async function GoalsPage() {
  const data = await getGoalsPageData();
  const overallProgress =
    data.totalTarget > 0 ? Math.round((data.totalSaved / data.totalTarget) * 100) : 0;

  return (
    <AppShell
      activeTab="mas"
      title="Metas"
      subtitle="Tu ahorro visible, tranquilo y facil de seguir con el tiempo."
      desktopSummary={{
        title: 'Ahorro',
        stats: [
          { label: 'Guardado', value: formatCurrency(data.totalSaved), tone: 'accent' },
          { label: 'Objetivo total', value: formatCurrency(data.totalTarget) },
        ],
        note: 'La meta aqui es que el ahorro se sienta tangible, no escondido entre numeros sueltos.',
      }}
    >
      <section className="overflow-hidden rounded-[28px] border border-border-soft bg-surface shadow-[0_1px_2px_rgba(47,49,43,0.04),0_16px_40px_rgba(47,49,43,0.06)]">
        <div className="border-b border-border-soft bg-[linear-gradient(135deg,#fbfaf7_0%,#f2f0e8_55%,#eef2e5_100%)] px-5 py-6">
          <p className="text-sm font-medium text-text-muted">Ahorro total</p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                {formatCurrency(data.totalSaved)}
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-text-muted">
                Lo que ya llevas apartado entre todas tus metas activas.
              </p>
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-olive-600 shadow-sm">
              {overallProgress}% total
            </span>
          </div>

          <div className="mt-5 space-y-3">
            <div className="h-3 overflow-hidden rounded-full bg-white/70">
              <div
                className="h-full rounded-full bg-olive-500"
                style={{ width: `${Math.max(0, Math.min(100, overallProgress))}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Guardado</p>
                <p className="mt-2 text-lg font-semibold text-olive-600">
                  {formatCurrency(data.totalSaved)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Objetivo</p>
                <p className="mt-2 text-lg font-semibold text-foreground">
                  {formatCurrency(data.totalTarget)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 px-5 py-4 sm:grid-cols-3">
          <Link
            href="/agregar"
            className="flex items-center justify-center rounded-2xl bg-olive-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-olive-600"
          >
            Registrar movimiento
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center rounded-2xl border border-border-soft bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-soft"
          >
            Volver a Home
          </Link>
          <Link
            href="/cuentas"
            className="flex items-center justify-center rounded-2xl border border-border-soft bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-soft"
          >
            Ver ahorro
          </Link>
        </div>
      </section>

      <section className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]">
        <p className="text-base font-semibold text-foreground">Administrar metas</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
          Aqui ya puedes crear metas nuevas, ajustar objetivos, registrar aportes manuales y archivar las que ya no quieras seguir viendo activas.
        </p>
      </section>

      <GoalsManager goals={data.goals} defaultDate={getTodayDateString()} />
    </AppShell>
  );
}
