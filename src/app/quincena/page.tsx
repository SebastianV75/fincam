import Link from 'next/link';

import { AllocationRulesManager } from '@/components/forms/allocation-rules-manager';
import { AppShell } from '@/components/layout/app-shell';
import { SectionCard } from '@/components/ui/section-card';
import { getDashboardData } from '@/lib/data/finance-dashboard';
import { formatCurrency, formatShortDate } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

const categoryLabel = {
  fixed_expense: 'Pago fijo',
  credit_card: 'TDC',
  savings: 'Ahorro',
  other: 'Otro',
} as const;

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

function parseLocalDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

function isWithinPeriod(date: string | null, startDate: string, endDate: string) {
  if (!date) {
    return false;
  }

  const current = parseLocalDate(date).getTime();
  return current >= parseLocalDate(startDate).getTime() && current <= parseLocalDate(endDate).getTime();
}

function getDaysRemaining(endDate: string) {
  const today = new Date();
  const normalizedToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    12,
    0,
    0,
    0
  );
  const periodEnd = parseLocalDate(endDate);
  const diff = periodEnd.getTime() - normalizedToday.getTime();

  if (diff <= 0) {
    return 1;
  }

  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

function getHealthLabel(freeAmount: number, incomeAmount: number) {
  if (freeAmount <= 0) {
    return 'Sin margen';
  }

  if (incomeAmount > 0) {
    const ratio = freeAmount / incomeAmount;

    if (ratio >= 0.35) {
      return 'Con aire';
    }

    if (ratio >= 0.18) {
      return 'Bien cuidada';
    }
  }

  if (freeAmount >= 2000) {
    return 'Con aire';
  }

  return 'Mas vigilada';
}

export default async function PayPeriodPage() {
  const data = await getDashboardData();
  const currentPayPeriod = data.currentPayPeriod;

  if (!currentPayPeriod) {
    return (
      <AppShell
        activeTab="quincena"
        title="Quincena"
        subtitle="Todavia no tienes una quincena activa."
        desktopSummary={{
          title: 'Sin quincena',
          stats: [{ label: 'Disponible', value: formatCurrency(data.availableBalance) }],
          note: 'Cuando abras una quincena, aqui se vera el plan completo de tu dinero.',
        }}
      >
        <section className="rounded-[28px] border border-border-soft bg-surface p-6 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_16px_40px_rgba(47,49,43,0.06)]">
          <p className="text-sm font-medium text-text-muted">Aun no hay plan activo</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
            Empieza por registrar tu quincena
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-text-muted">
            En cuanto exista una quincena abierta, aqui vas a ver cuanto entra, cuanto ya quedo apartado y cuanto sigue libre para gastar con calma.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="flex min-h-12 items-center justify-center rounded-2xl bg-olive-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-olive-600"
            >
              Volver a Inicio
            </Link>
            <Link
              href="/agregar"
              className="flex min-h-12 items-center justify-center rounded-2xl border border-border-soft bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-soft"
            >
              Registrar movimiento
            </Link>
          </div>
        </section>
      </AppShell>
    );
  }

  const incomeAmount = currentPayPeriod.income_amount ?? 0;
  const freeAmount = currentPayPeriod.free_amount ?? data.availableBalance;
  const protectedAmount = Math.max(0, incomeAmount - freeAmount);
  const totalPlanned =
    data.fixedExpensesAmount + data.creditCardAmount + data.savingsAmount + freeAmount;
  const daysRemaining = getDaysRemaining(currentPayPeriod.end_date);
  const dailyBudget = freeAmount > 0 ? Math.floor(freeAmount / daysRemaining) : 0;
  const freeRatio = incomeAmount > 0 ? Math.round((freeAmount / incomeAmount) * 100) : 0;

  const orderedBuckets = [
    {
      label: 'Pagos fijos',
      amount: data.fixedExpensesAmount,
      tone: 'default' as const,
      summary: 'Servicios, suscripciones y compromisos que no quieres perseguir despues.',
    },
    {
      label: 'TDC',
      amount: data.creditCardAmount,
      tone: 'danger' as const,
      summary: 'Lo que apartaste para no perder de vista la tarjeta dentro de esta quincena.',
    },
    {
      label: 'Ahorro',
      amount: data.savingsAmount,
      tone: 'accent' as const,
      summary: 'Lo que se separa antes de gastar para que el ahorro no se quede al final.',
    },
    {
      label: 'Libre',
      amount: freeAmount,
      tone: 'default' as const,
      summary: 'Este es el monto que si puedes usar en tu dia a dia sin desacomodar el plan.',
    },
  ];

  const periodCommitments = [
    ...data.recurringItems
      .filter((item) => isWithinPeriod(item.next_due_date, currentPayPeriod.start_date, currentPayPeriod.end_date))
      .map((item) => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
        dueDate: item.next_due_date,
        category: (item.linked_rule_category ?? 'other') as keyof typeof categoryLabel,
      })),
    ...data.creditCards
      .filter((card) => isWithinPeriod(card.due_date, currentPayPeriod.start_date, currentPayPeriod.end_date))
      .map((card) => ({
        id: card.id,
        name: data.accounts.find((account) => account.id === card.account_id)?.name ?? 'Tarjeta de crédito',
        amount: card.due_amount,
        dueDate: card.due_date ?? currentPayPeriod.end_date,
        category: 'credit_card' as keyof typeof categoryLabel,
      })),
  ]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 6);

  return (
    <AppShell
      activeTab="quincena"
      title="Quincena"
      subtitle={`${formatShortDate(currentPayPeriod.start_date)} - ${formatShortDate(currentPayPeriod.end_date)}`}
      desktopSummary={{
        title: 'Plan actual',
        stats: [
          { label: 'Ingreso', value: formatCurrency(incomeAmount), tone: 'accent' },
          { label: 'Libre', value: formatCurrency(freeAmount) },
        ],
        note: 'Aqui deberia quedarte clarisimo que ya esta protegido y cuanto puedes usar sin culpa.',
      }}
    >
      <section className="overflow-hidden rounded-[28px] border border-border-soft bg-surface shadow-[0_1px_2px_rgba(47,49,43,0.04),0_16px_40px_rgba(47,49,43,0.06)]">
        <div className="border-b border-border-soft bg-[linear-gradient(135deg,#fbfaf7_0%,#f2f0e8_55%,#eef2e5_100%)] px-5 py-6">
          <p className="text-sm font-medium text-text-muted">Libre para gastar en esta quincena</p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                {formatCurrency(freeAmount)}
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-text-muted">
                De {formatCurrency(incomeAmount)} ya apartaste {formatCurrency(protectedAmount)} para lo importante. Este monto es el que te conviene usar como referencia diaria.
              </p>
            </div>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-olive-600 shadow-sm">
              {getHealthLabel(freeAmount, incomeAmount)}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Ingreso</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatCurrency(incomeAmount)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Protegido</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {formatCurrency(protectedAmount)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Libre</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {freeRatio}%
              </p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Ritmo diario</p>
              <p className="mt-2 text-lg font-semibold text-olive-600">
                {formatCurrency(dailyBudget)}
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

      <SectionCard title="Tu orden de quincena">
        <div className="space-y-3">
          {orderedBuckets.map((bucket, index) => (
            <div
              key={bucket.label}
              className="rounded-2xl border border-border-soft/70 bg-background px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {index + 1}. {bucket.label}
                  </p>
                  <p className="mt-1 max-w-lg text-sm leading-6 text-text-muted">
                    {bucket.summary}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-semibold ${
                      bucket.tone === 'danger'
                        ? 'text-danger-500'
                        : bucket.tone === 'accent'
                          ? 'text-olive-600'
                          : 'text-foreground'
                    }`}
                  >
                    {formatCurrency(bucket.amount)}
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    {getShareLabel(bucket.amount, totalPlanned)} del total
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Como se repartio esta quincena">
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
          title="Lo que todavia cae en esta quincena"
          rows={periodCommitments.map((item) => ({
            label: item.name,
            meta: `${categoryLabel[item.category]} · ${formatShortDate(item.dueDate)}`,
            value: formatCurrency(item.amount),
            tone: item.category === 'credit_card' ? 'danger' : 'default',
          }))}
        >
          {periodCommitments.length === 0 ? (
            <p className="mb-4 text-sm leading-6 text-text-muted">
              Por ahora no hay compromisos con fecha dentro de este periodo. Tu margen libre se siente mas limpio.
            </p>
          ) : (
            <p className="mb-4 text-sm leading-6 text-text-muted">
              Estos son los cargos o apartados que todavia conviene tener presentes antes de cerrar la quincena.
            </p>
          )}
        </SectionCard>

        <SectionCard title="Lectura rapida del plan">
          <div className="space-y-4">
            <div className="rounded-2xl bg-background px-4 py-4">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Tu referencia diaria</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {formatCurrency(dailyBudget)} al dia
              </p>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                Con {daysRemaining} {daysRemaining === 1 ? 'dia restante' : 'dias restantes'}, esta cifra te ayuda a no comerte de golpe lo que quedo libre.
              </p>
            </div>
            <div className="rounded-2xl bg-background px-4 py-4">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Lo ya protegido</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {formatCurrency(protectedAmount)}
              </p>
              <p className="mt-2 text-sm leading-6 text-text-muted">
                Aqui ya viven tus pagos fijos, tu apartado para TDC y el ahorro. Mientras cuides el libre, el plan sigue ordenado.
              </p>
            </div>
          </div>
        </SectionCard>
      </section>

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
              ? formatCurrency((incomeAmount * rule.value) / 100)
              : formatCurrency(rule.value),
        }))}
      >
        <p className="mb-4 text-sm leading-6 text-text-muted">
          Estas reglas son las que sostienen el reparto cada vez que entra tu quincena.
        </p>
      </SectionCard>

      <section className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]">
        <p className="text-base font-semibold text-foreground">Personaliza tu reparto</p>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-text-muted">
          Aqui puedes decidir como dividir la quincena segun sus necesidades reales: que porcentaje se va a ahorro, cuanto se aparta para pagos fijos o cuanto quiere mandar a tarjeta.
        </p>
      </section>

      <AllocationRulesManager rules={data.rules} />
    </AppShell>
  );
}
