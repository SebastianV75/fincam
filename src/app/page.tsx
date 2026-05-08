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

export default async function Home() {
  const data = await getDashboardData();
  const currentPayPeriod = data.currentPayPeriod;
  const freeAmount = currentPayPeriod?.free_amount ?? data.availableBalance;
  const incomeAmount = currentPayPeriod?.income_amount ?? 0;
  const assignedAmount = Math.max(0, incomeAmount - freeAmount);
  const totalPlanned =
    data.fixedExpensesAmount + data.creditCardAmount + data.savingsAmount + freeAmount;
  const reserveHealth =
    freeAmount >= 3000 ? 'Con margen' : freeAmount >= 1500 ? 'En control' : 'Mas ajustada';

  return (
    <AppShell
      activeTab="home"
      title="Tu dinero hoy"
      subtitle="Un vistazo rapido de lo disponible, lo comprometido y lo que sigue en esta quincena."
      desktopSummary={{
        title: 'Hoy',
        stats: [
          { label: 'Disponible', value: formatCurrency(data.availableBalance), tone: 'accent' },
          { label: 'Libre de quincena', value: formatCurrency(freeAmount) },
        ],
        note: 'La prioridad aqui es que puedas leer tu estado financiero en pocos segundos.',
      }}
    >
      <section className="overflow-hidden rounded-[28px] border border-border-soft bg-surface shadow-[0_1px_2px_rgba(47,49,43,0.04),0_16px_40px_rgba(47,49,43,0.06)]">
        <div className="border-b border-border-soft bg-[linear-gradient(135deg,#fbfaf7_0%,#f2f0e8_55%,#eef2e5_100%)] px-5 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-text-muted">Disponible para usar</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
                {formatCurrency(data.availableBalance)}
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-text-muted">
                Dinero que hoy puedes mover sin tocar lo que ya esta apartado para pagos,
                tarjeta o ahorro.
              </p>
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-olive-600 shadow-sm">
              {reserveHealth}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Libre</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatCurrency(freeAmount)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Asignado</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatCurrency(assignedAmount)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Proximos</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {String(data.upcomingPayments.length)}
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
            Revisar quincena
          </Link>
          <Link
            href="/cuentas"
            className="flex items-center justify-center rounded-2xl border border-border-soft bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-soft"
          >
            Ver cuentas
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <SectionCard
          title="Quincena actual"
          actionLabel="Abrir plan"
          actionHref="/quincena"
          rows={
            currentPayPeriod
              ? [
                  { label: 'Ingreso recibido', value: formatCurrency(incomeAmount) },
                  { label: 'Ya comprometido', value: formatCurrency(assignedAmount) },
                  { label: 'Libre restante', value: formatCurrency(freeAmount) },
                ]
              : []
          }
        >
          <p className="mb-4 text-sm leading-6 text-text-muted">
            {currentPayPeriod
              ? `${formatShortDate(currentPayPeriod.start_date)} - ${formatShortDate(currentPayPeriod.end_date)}`
              : 'Aun no tienes una quincena activa.'}
          </p>
        </SectionCard>

        <SectionCard
          title="Proximos pagos"
          actionLabel="Capturar"
          actionHref="/agregar"
          rows={data.upcomingPayments.map((payment) => ({
            label: payment.name,
            meta: formatShortDate(payment.dueDate),
            value: formatCurrency(payment.amount),
          }))}
        >
          {data.upcomingPayments.length === 0 ? (
            <p className="mb-4 text-sm leading-6 text-text-muted">
              No hay pagos cercanos por ahora. Eso te deja un poco mas de aire.
            </p>
          ) : (
            <p className="mb-4 text-sm leading-6 text-text-muted">
              Lo siguiente en tu radar para que no se te junte al final de la quincena.
            </p>
          )}
        </SectionCard>
      </section>

      <SectionCard title="Como se reparte tu quincena" actionLabel="Ver detalle" actionHref="/quincena">
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
          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Pagos fijos</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {formatCurrency(data.fixedExpensesAmount)}
            </p>
          </div>
          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">TDC</p>
            <p className="mt-2 text-lg font-semibold text-danger-500">
              {formatCurrency(data.creditCardAmount)}
            </p>
          </div>
          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Ahorro</p>
            <p className="mt-2 text-lg font-semibold text-olive-600">
              {formatCurrency(data.savingsAmount)}
            </p>
          </div>
          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Libre</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {formatCurrency(freeAmount)}
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Tus cuentas"
        actionLabel="Abrir cuentas"
        actionHref="/cuentas"
        rows={data.accounts.map((account) => ({
          label: account.name,
          meta:
            account.type === 'credit'
              ? 'Tarjeta de credito'
              : account.type === 'savings'
                ? 'Ahorro'
                : account.type === 'cash'
                  ? 'Efectivo'
                  : 'Debito',
          value: formatCurrency(account.current_balance),
          tone: account.type === 'credit' ? 'danger' : 'default',
        }))}
      />
    </AppShell>
  );
}
