import Link from 'next/link';

import { AppShell } from '@/components/layout/app-shell';
import { SectionCard } from '@/components/ui/section-card';
import { getRecurringPageData } from '@/lib/data/finance-dashboard';
import { formatCurrency, formatShortDate } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

const recurrenceLabel = {
  weekly: 'Semanal',
  biweekly: 'Quincenal',
  monthly: 'Mensual',
  custom: 'Personalizada',
} as const;

const categoryLabel = {
  fixed_expense: 'Pago fijo',
  credit_card: 'TDC',
  savings: 'Ahorro',
  other: 'Otros',
} as const;

export default async function RecurringPage() {
  const data = await getRecurringPageData();
  const fixedAmount = data.groupedTotals.fixed_expense ?? 0;
  const creditAmount = data.groupedTotals.credit_card ?? 0;
  const savingsAmount = data.groupedTotals.savings ?? 0;
  const otherAmount = data.groupedTotals.other ?? 0;

  return (
    <AppShell
      activeTab="mas"
      title="Recurrentes"
      subtitle="Tus pagos y apartados que vuelven cada semana, quincena o mes."
      desktopSummary={{
        title: 'Recordatorios',
        stats: [
          { label: 'Total recurrente', value: formatCurrency(data.totalRecurringAmount), tone: 'accent' },
          { label: 'Activos', value: String(data.itemsCount) },
        ],
        note: 'Aqui lo importante es anticiparte a lo que vuelve para que no te tome por sorpresa.',
      }}
    >
      <section className="overflow-hidden rounded-[28px] border border-border-soft bg-surface shadow-[0_1px_2px_rgba(47,49,43,0.04),0_16px_40px_rgba(47,49,43,0.06)]">
        <div className="border-b border-border-soft bg-[linear-gradient(135deg,#fbfaf7_0%,#f2f0e8_55%,#eef2e5_100%)] px-5 py-6">
          <p className="text-sm font-medium text-text-muted">Compromisos recurrentes</p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                {formatCurrency(data.totalRecurringAmount)}
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-text-muted">
                Suma estimada de lo que ya sabes que vuelve y conviene tener presente antes de gastar.
              </p>
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-olive-600 shadow-sm">
              {data.itemsCount > 0 ? `${data.itemsCount} activos` : 'Sin recurrentes'}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Pagos fijos</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatCurrency(fixedAmount)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">TDC</p>
              <p className="mt-2 text-lg font-semibold text-danger-500">
                {formatCurrency(creditAmount)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Ahorro</p>
              <p className="mt-2 text-lg font-semibold text-olive-600">
                {formatCurrency(savingsAmount)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Otros</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatCurrency(otherAmount)}
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
            href="/quincena"
            className="flex items-center justify-center rounded-2xl border border-border-soft bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-soft"
          >
            Ver quincena
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center rounded-2xl border border-border-soft bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-soft"
          >
            Volver a Home
          </Link>
        </div>
      </section>

      <SectionCard
        title="Lo que viene pronto"
        rows={data.recurringItems.slice(0, 4).map((item) => ({
          label: item.name,
          meta: `${recurrenceLabel[item.recurrence_type]} · ${categoryLabel[item.linked_rule_category ?? 'other']}`,
          value: `${formatShortDate(item.next_due_date)} · ${formatCurrency(item.amount)}`,
        }))}
      >
        <p className="mb-4 text-sm leading-6 text-text-muted">
          Estos son los compromisos que mas conviene tener presentes para no improvisar al final.
        </p>
      </SectionCard>

      <section className="grid gap-4 md:grid-cols-2">
        {data.recurringItems.map((item) => (
          <SectionCard
            key={item.id}
            title={item.name}
            rows={[
              {
                label: 'Monto',
                value: formatCurrency(item.amount),
              },
              {
                label: 'Frecuencia',
                value: recurrenceLabel[item.recurrence_type],
              },
              {
                label: 'Proximo cargo',
                value: formatShortDate(item.next_due_date),
              },
              {
                label: 'Recordatorio',
                value:
                  item.reminder_days_before > 0
                    ? `${item.reminder_days_before} dias antes`
                    : 'El mismo dia',
              },
              {
                label: 'Categoria',
                value: categoryLabel[item.linked_rule_category ?? 'other'],
              },
            ]}
          >
            <div className="mb-4 rounded-2xl bg-background px-4 py-4">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Lectura rapida</p>
              <p className="mt-2 text-sm leading-6 text-text-body">
                {item.linked_rule_category === 'savings'
                  ? 'Este recurrente funciona como apartado de ahorro dentro de tu sistema.'
                  : item.linked_rule_category === 'credit_card'
                    ? 'Este recurrente te ayuda a no perder de vista un compromiso de tarjeta.'
                    : 'Este recurrente forma parte de tus gastos o apartados previsibles.'}
              </p>
            </div>
          </SectionCard>
        ))}
      </section>
    </AppShell>
  );
}
