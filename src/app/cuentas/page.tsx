import Link from 'next/link';

import { AccountsManager } from '@/components/forms/accounts-manager';
import { AppShell } from '@/components/layout/app-shell';
import { getAccountsPageData } from '@/lib/data/finance-dashboard';
import { formatCurrency } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
  const data = await getAccountsPageData();
  const healthyCash = data.liquidTotal - data.debtTotal;

  return (
    <AppShell
      activeTab="mas"
      title="Cuentas"
      subtitle="Tus saldos, ahorro y deuda reunidos en una sola vista clara."
      desktopSummary={{
        title: 'Balances',
        stats: [
          { label: 'Liquido', value: formatCurrency(data.liquidTotal), tone: 'accent' },
          { label: 'Deuda TDC', value: formatCurrency(data.debtTotal), tone: 'danger' },
        ],
        note: 'La idea aqui es entender rapido donde esta tu dinero y que tanto esta comprometido.',
      }}
    >
      <section className="overflow-hidden rounded-[28px] border border-border-soft bg-surface shadow-[0_1px_2px_rgba(47,49,43,0.04),0_16px_40px_rgba(47,49,43,0.06)]">
        <div className="border-b border-border-soft bg-[linear-gradient(135deg,#fbfaf7_0%,#f2f0e8_55%,#eef2e5_100%)] px-5 py-6">
          <p className="text-sm font-medium text-text-muted">Panorama general</p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                {formatCurrency(data.liquidTotal)}
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-text-muted">
                Lo que hoy tienes repartido entre debito, efectivo y ahorro, antes de restar la deuda de tarjeta.
              </p>
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-olive-600 shadow-sm">
              {healthyCash >= 0 ? 'Balance sano' : 'Balance presionado'}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Liquido</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatCurrency(data.liquidTotal)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Ahorro</p>
              <p className="mt-2 text-lg font-semibold text-olive-600">
                {formatCurrency(data.savingsTotal)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Deuda TDC</p>
              <p className="mt-2 text-lg font-semibold text-danger-500">
                {formatCurrency(data.debtTotal)}
              </p>
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
            href="/quincena"
            className="flex items-center justify-center rounded-2xl border border-border-soft bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-soft"
          >
            Ver quincena
          </Link>
        </div>
      </section>

      <section className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]">
        <p className="text-base font-semibold text-foreground">Administrar cuentas</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
          Aqui ya puedes crear, renombrar, ajustar y archivar cuentas. Para tu caso, por ejemplo,
          puedes cambiar la TDC de Banamex a BBVA sin perder la base del producto.
        </p>
      </section>

      <AccountsManager accounts={data.accounts} />
    </AppShell>
  );
}
