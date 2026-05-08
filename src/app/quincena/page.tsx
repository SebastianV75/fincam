import Link from 'next/link';

import { AppShell } from '@/components/layout/app-shell';
import { SectionCard } from '@/components/ui/section-card';
import { getDashboardData } from '@/lib/data/finance-dashboard';
import { formatCurrency, formatShortDate } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

function getShareWidth(amount: number, total: number) {
  if (total <= 0 || amount <= 0) {
    return '0%';
  }

  return `${Math.max(8, Math.round((amount / total) * 100))}%`;
}

function getShareLabel(amount: number, total: number) {
  if (total <= 0 || amount <= 0) {
    return '0%';
  }

  return `${Math.round((amount / total) * 100)}%`;
}

export default async function PayPeriodPage() {
  const data = await getDashboardData();
  const currentPayPeriod = data.currentPayPeriod;
  const incomeAmount = currentPayPeriod?.income_amount ?? 0;
  const freeAmount = currentPayPeriod?.free_amount ?? data.availableBalance;
  const assignedAmount = Math.max(0, incomeAmount - freeAmount);
  const totalPlanned =
    data.fixedExpensesAmount + data.creditCardAmount + data.savingsAmount + freeAmount;

  const orderedBuckets = [
    { label: 'Pagos fijos', amount: data.fixedExpensesAmount, tone: 'default' as const },
    { label: 'TDC', amount: data.creditCardAmount, tone: 'danger' as const },
    { label: 'Ahorro', amount: data.savingsAmount, tone: 'accent' as const },
    { label: 'Libre', amount: freeAmount, tone: 'default' as const },
  ];

  return (
    <AppShell
      activeTab="quincena"
      title="Quincena"
      subtitle={
        currentPayPeriod
          ? `${formatShortDate(currentPayPeriod.start_date)} - ${formatShortDate(currentPayPeriod.end_date)}`
          : 'Sin quincena activa'
      }
      desktopSummary={{
        title: 'Quincena actual',
        stats: [
          {
            label: 'Ingreso',
            value: formatCurrency(incomeAmount),
            tone: 'accent',
          },
          { label: 'Libre', value: formatCurrency(freeAmount) },
        ],
        note: 'Aqui deberia sentirse clarisimo que ya esta cubierto y que sigue disponible.',
      }}
    >
      <section className="overflow-hidden rounded-[28px] border border-border-soft bg-surface shadow-[0_1px_2px_rgba(47,49,43,0.04),0_16px_40px_rgba(47,49,43,0.06)]">
        <div className="border-b border-border-soft bg-[linear-gradient(135deg,#fbfaf7_0%,#f2f0e8_55%,#eef2e5_100%)] px-5 py-6">
          <p className="text-sm font-medium text-text-muted">Ingreso recibido</p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                {formatCurrency(incomeAmount)}
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-text-muted">
                {currentPayPeriod?.income_received_at
                  ? `Depositado el ${formatShortDate(currentPayPeriod.income_received_at)} y repartido con tu orden automatico.`
                  : 'Aun sin fecha de deposito registrada.'}
              </p>
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-olive-600 shadow-sm">
              {freeAmount >= 2000 ? 'Todavia comoda' : 'Mas vigilada'}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Comprometido</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatCurrency(assignedAmount)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Libre</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatCurrency(freeAmount)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Ahorro</p>
              <p className="mt-2 text-lg font-semibold text-olive-600">
                {formatCurrency(data.savingsAmount)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">TDC</p>
              <p className="mt-2 text-lg font-semibold text-danger-500">
                {formatCurrency(data.creditCardAmount)}
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

      <SectionCard title="Orden automatico">
        <div className="space-y-3">
          {orderedBuckets.map((bucket, index) => (
            <div
              key={bucket.label}
              className="flex items-center justify-between rounded-2xl bg-background px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {index + 1}. {bucket.label}
                </p>
                <p className="mt-1 text-xs text-text-muted">
                  {bucket.label === 'Libre'
                    ? 'Lo que queda para usar sin mover tus apartados.'
                    : 'Se cubre antes de seguir con el siguiente bloque.'}
                </p>
              </div>
              <p
                className={`text-sm font-semibold ${
                  bucket.tone === 'danger'
                    ? 'text-danger-500'
                    : bucket.tone === 'accent'
                      ? 'text-olive-600'
                      : 'text-foreground'
                }`}
              >
                {formatCurrency(bucket.amount)}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Distribucion de esta quincena">
        <div className="mb-5 flex h-3 overflow-hidden rounded-full bg-soft">
          <div
            className="bg-[#d8d1c1]"
            style={{ width: getShareWidth(data.fixedExpensesAmount, totalPlanned) }}
          />
          <div
            className="bg-danger-100"
            style={{ width: getShareWidth(data.creditCardAmount, totalPlanned) }}
          />
          <div
            className="bg-olive-300"
            style={{ width: getShareWidth(data.savingsAmount, totalPlanned) }}
          />
          <div
            className="bg-[#878b7f]"
            style={{ width: getShareWidth(freeAmount, totalPlanned) }}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {orderedBuckets.map((bucket) => (
            <div key={bucket.label} className="rounded-2xl bg-background px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-text-body">{bucket.label}</p>
                <span className="text-xs font-medium text-text-muted">
                  {getShareLabel(bucket.amount, totalPlanned)}
                </span>
              </div>
              <p
                className={`mt-2 text-lg font-semibold ${
                  bucket.tone === 'danger'
                    ? 'text-danger-500'
                    : bucket.tone === 'accent'
                      ? 'text-olive-600'
                      : 'text-foreground'
                }`}
              >
                {formatCurrency(bucket.amount)}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      <section className="grid gap-4 md:grid-cols-2">
        <SectionCard
          title="Reglas activas"
          rows={data.rules.map((rule) => ({
            label: rule.name,
            meta:
              rule.rule_type === 'percentage'
                ? `${rule.value}% del ingreso`
                : rule.rule_type === 'manual'
                  ? 'Monto manual'
                  : 'Monto fijo',
            value:
              rule.rule_type === 'percentage'
                ? currentPayPeriod
                  ? formatCurrency((incomeAmount * rule.value) / 100)
                  : `${rule.value}%`
                : formatCurrency(rule.value),
          }))}
        >
          <p className="mb-4 text-sm leading-6 text-text-muted">
            Estas reglas sostienen el reparto automatico cada vez que entra tu quincena.
          </p>
        </SectionCard>

        <SectionCard title="Resultado actual">
          <p className="text-sm font-medium text-text-muted">Libre para gastar esta quincena</p>
          <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
            {formatCurrency(freeAmount)}
          </p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-text-muted">
            Ya cubriste pagos, tarjeta y ahorro antes de gastar. Esta cifra es la que mas te conviene cuidar en el dia a dia.
          </p>

          <div className="mt-5 rounded-2xl bg-background px-4 py-4">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Siguiente paso util</p>
            <p className="mt-2 text-sm leading-6 text-text-body">
              Si vas a hacer un gasto o un abono hoy, registralo desde la captura rapida para que este numero no se desacomode.
            </p>
          </div>
        </SectionCard>
      </section>
    </AppShell>
  );
}
