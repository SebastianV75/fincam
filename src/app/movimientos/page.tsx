import Link from 'next/link';

import { MovementsManager } from '@/components/forms/movements-manager';
import { AppShell } from '@/components/layout/app-shell';
import { getMovementsPageData } from '@/lib/data/finance-dashboard';
import { formatCurrency } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export default async function MovementsPage() {
  const data = await getMovementsPageData();
  const totalMovements = data.transactions.length;
  const totalVolume = data.transactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <AppShell
      activeTab="mas"
      title="Movimientos"
      subtitle="Revisa lo que ya capturaste y corrige cualquier movimiento sin perder el orden de tu quincena."
      desktopSummary={{
        title: 'Historial',
        stats: [
          { label: 'Movimientos', value: String(totalMovements), tone: 'accent' },
          { label: 'Volumen', value: formatCurrency(totalVolume) },
        ],
        note: 'Este historial te da control para revisar, corregir y limpiar capturas equivocadas.',
      }}
    >
      <section className="overflow-hidden rounded-[28px] border border-border-soft bg-surface shadow-[0_1px_2px_rgba(47,49,43,0.04),0_16px_40px_rgba(47,49,43,0.06)]">
        <div className="border-b border-border-soft bg-[linear-gradient(135deg,#fbfaf7_0%,#f2f0e8_55%,#eef2e5_100%)] px-5 py-6">
          <p className="text-sm font-medium text-text-muted">Historial vivo</p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                {String(totalMovements)} movimientos
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-text-muted">
                Aqui puedes revisar lo que ya capturaste y corregir errores antes de que se te acumulen.
              </p>
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-olive-600 shadow-sm">
              {data.transactions.length > 0 ? 'Editable' : 'Sin registros'}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Movimientos</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{String(totalMovements)}</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Volumen</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatCurrency(totalVolume)}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/agregar"
            className="flex min-h-12 items-center justify-center rounded-2xl bg-olive-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-olive-600 sm:min-w-[220px]"
          >
            Registrar movimiento
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-olive-600 transition-colors hover:text-olive-500"
          >
            Volver a Inicio
          </Link>
        </div>
      </section>

      <section className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]">
        <p className="text-base font-semibold text-foreground">Editar movimientos</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
          Si una captura quedó mal, puedes ajustar su tipo, cuenta, monto o fecha. Si fue un error completo, puedes eliminarla y el sistema revierte su impacto.
        </p>
      </section>

      <MovementsManager
        transactions={data.transactions}
        accounts={data.accounts}
        categories={data.categories}
      />
    </AppShell>
  );
}
