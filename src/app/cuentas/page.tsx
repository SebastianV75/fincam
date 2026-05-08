import Link from 'next/link';

import { AppShell } from '@/components/layout/app-shell';
import { SectionCard } from '@/components/ui/section-card';
import { getAccountsPageData } from '@/lib/data/finance-dashboard';
import { formatCurrency, formatShortDate } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

const accountTypeLabel = {
  debit: 'Debito',
  credit: 'Credito',
  cash: 'Efectivo',
  savings: 'Ahorro',
} as const;

const accountTypeDescription = {
  debit: 'Tu flujo principal para uso diario.',
  credit: 'Cuenta ligada a deuda y fecha limite.',
  cash: 'Dinero disponible fuera del banco.',
  savings: 'Apartado para metas o reserva.',
} as const;

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

      <section className="grid gap-4 md:grid-cols-2">
        {data.accounts.map((account) => (
          <SectionCard
            key={account.id}
            title={account.name}
            rows={[
              {
                label: 'Tipo de cuenta',
                meta: accountTypeDescription[account.type],
                value: accountTypeLabel[account.type],
              },
              {
                label: 'Saldo actual',
                value: formatCurrency(account.current_balance),
                tone: account.type === 'credit' ? 'danger' : 'default',
              },
              ...(account.type === 'credit'
                ? [
                    {
                      label: 'Debes hoy',
                      value: formatCurrency(account.due_amount ?? 0),
                      tone: 'danger' as const,
                    },
                    {
                      label: 'Fecha limite',
                      value: account.due_date ? formatShortDate(account.due_date) : 'Sin fecha',
                    },
                    {
                      label: 'Pago minimo',
                      value: formatCurrency(account.minimum_payment ?? 0),
                    },
                  ]
                : []),
            ]}
          >
            <div className="mb-4 rounded-2xl bg-background px-4 py-4">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">
                {account.type === 'credit' ? 'Saldo comprometido' : 'Saldo disponible'}
              </p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  account.type === 'credit' ? 'text-danger-500' : 'text-foreground'
                }`}
              >
                {formatCurrency(account.current_balance)}
              </p>
            </div>
          </SectionCard>
        ))}
      </section>
    </AppShell>
  );
}
