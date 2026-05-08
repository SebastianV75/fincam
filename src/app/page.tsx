import Link from 'next/link';

import { AppShell } from '@/components/layout/app-shell';
import { SectionCard } from '@/components/ui/section-card';
import { getDashboardData } from '@/lib/data/finance-dashboard';
import { formatCurrency, formatShortDate } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const data = await getDashboardData();
  const currentPayPeriod = data.currentPayPeriod;

  return (
    <AppShell
      activeTab="home"
      title="Hola, Camil"
      subtitle="Tu dinero hoy"
      desktopSummary={{
        title: 'Hoy',
        stats: [
          { label: 'Disponible', value: formatCurrency(data.availableBalance), tone: 'accent' },
          {
            label: 'Libre de quincena',
            value: formatCurrency(currentPayPeriod?.free_amount ?? data.availableBalance),
          },
        ],
        note: 'Tu panel principal ya esta conectado a datos reales. Lo importante aparece primero.',
      }}
    >
      <section className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]">
        <p className="text-sm font-medium text-text-muted">Tu dinero disponible</p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              {formatCurrency(data.availableBalance)}
            </h1>
            <p className="mt-2 max-w-xs text-sm leading-6 text-text-muted">
              Lo que puedes usar sin afectar lo que ya apartaste para tu quincena.
            </p>
          </div>
          <span className="rounded-full bg-olive-100 px-3 py-1 text-xs font-medium text-olive-600">
            {data.availableBalance >= 2000 ? 'Estable' : 'Justa'}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link
          href="/agregar"
          className="flex items-center justify-center rounded-2xl bg-olive-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-olive-600"
        >
          Registrar gasto
        </Link>
        <Link
          href="/agregar"
          className="flex items-center justify-center rounded-2xl border border-border-soft bg-surface px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-soft"
        >
          Registrar abono
        </Link>
      </section>

      <SectionCard
        title="Quincena actual"
        actionLabel="Ver plan"
        rows={
          currentPayPeriod
            ? [
                { label: 'Ingreso', value: formatCurrency(currentPayPeriod.income_amount) },
                {
                  label: 'Asignado',
                  value: formatCurrency(
                    currentPayPeriod.income_amount - currentPayPeriod.free_amount
                  ),
                },
                { label: 'Libre restante', value: formatCurrency(currentPayPeriod.free_amount) },
              ]
            : []
        }
      >
        <p className="mb-4 text-sm text-text-muted">
          {currentPayPeriod
            ? `${formatShortDate(currentPayPeriod.start_date)} - ${formatShortDate(currentPayPeriod.end_date)}`
            : 'Sin quincena activa'}
        </p>
      </SectionCard>

      <SectionCard
        title="Próximos pagos"
        actionLabel="Ver todos"
        rows={data.upcomingPayments.map((payment) => ({
          label: payment.name,
          meta: formatShortDate(payment.dueDate),
          value: formatCurrency(payment.amount),
        }))}
      />

      <SectionCard
        title="Distribución"
        rows={[
          { label: 'Pagos fijos', value: formatCurrency(data.fixedExpensesAmount) },
          { label: 'TDC', value: formatCurrency(data.creditCardAmount) },
          { label: 'Ahorro', value: formatCurrency(data.savingsAmount) },
          { label: 'Libre', value: formatCurrency(data.availableBalance) },
        ]}
      >
        <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-soft">
          <div className="w-[25%] bg-[#d8d1c1]" />
          <div className="w-[29%] bg-danger-100" />
          <div className="w-[12%] bg-olive-300" />
          <div className="w-[34%] bg-[#878b7f]" />
        </div>
      </SectionCard>

      <SectionCard
        title="Cuentas"
        actionLabel="Ver cuentas"
        rows={data.accounts.map((account) => ({
          label: account.name,
          value: formatCurrency(account.current_balance),
          tone: account.type === 'credit' ? 'danger' : 'default',
        }))}
      />
    </AppShell>
  );
}
