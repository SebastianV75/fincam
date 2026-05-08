import { AppShell } from '@/components/layout/app-shell';
import { SectionCard } from '@/components/ui/section-card';
import { getDashboardData } from '@/lib/data/finance-dashboard';
import { formatCurrency, formatShortDate } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export default async function PayPeriodPage() {
  const data = await getDashboardData();
  const currentPayPeriod = data.currentPayPeriod;

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
            value: formatCurrency(currentPayPeriod?.income_amount ?? 0),
            tone: 'accent',
          },
          { label: 'Libre', value: formatCurrency(data.availableBalance) },
        ],
        note: 'Aqui se ve como se reparte tu ingreso entre obligaciones, ahorro y libre.',
      }}
    >
      <SectionCard title="Ingreso recibido">
        <p className="text-4xl font-semibold tracking-tight text-foreground">
          {formatCurrency(currentPayPeriod?.income_amount ?? 0)}
        </p>
        <p className="mt-2 text-sm text-text-muted">
          {currentPayPeriod?.income_received_at
            ? `Depositado el ${formatShortDate(currentPayPeriod.income_received_at)}`
            : 'Aun sin fecha de deposito'}
        </p>
      </SectionCard>

      <SectionCard
        title="Orden automatico"
        rows={[
          { label: '1. Pagos fijos', value: '' },
          { label: '2. TDC', value: '' },
          { label: '3. Ahorro', value: '' },
          { label: '4. Libre', value: '' },
        ]}
      />

      <SectionCard
        title="Distribucion"
        actionLabel="Ajustar"
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
        title="Reglas activas"
        actionLabel="Editar reglas"
        rows={data.rules.map((rule) => ({
          label: rule.name,
          meta: rule.rule_type === 'percentage' ? `${rule.value}%` : rule.rule_type,
          value:
            rule.rule_type === 'percentage'
              ? rule.category === 'savings' && currentPayPeriod
                ? formatCurrency((currentPayPeriod.income_amount * rule.value) / 100)
                : `${rule.value}%`
              : formatCurrency(rule.value),
        }))}
      />

      <SectionCard title="Resultado">
        <p className="text-sm font-medium text-text-muted">Dinero libre para esta quincena</p>
        <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
          {formatCurrency(data.availableBalance)}
        </p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-text-muted">
          Ya asignaste pagos, TDC y ahorro antes de gastar.
        </p>
      </SectionCard>
    </AppShell>
  );
}
