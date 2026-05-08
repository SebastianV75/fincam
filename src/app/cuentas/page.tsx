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

export default async function AccountsPage() {
  const data = await getAccountsPageData();

  return (
    <AppShell
      activeTab="cuentas"
      title="Cuentas"
      subtitle="Resumen rapido de todas tus cuentas"
      desktopSummary={{
        title: 'Balances',
        stats: [
          { label: 'Liquido', value: formatCurrency(data.liquidTotal), tone: 'accent' },
          { label: 'Deuda TDC', value: formatCurrency(data.debtTotal), tone: 'danger' },
        ],
        note: 'Aqui puedes ver rapido cuanto tienes, cuanto esta en ahorro y cuanto debes en tarjeta.',
      }}
    >
      <SectionCard title="Resumen total">
        <p className="mb-4 text-4xl font-semibold tracking-tight text-foreground">
          {formatCurrency(data.liquidTotal)}
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
              Liquido
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {formatCurrency(data.liquidTotal)}
            </p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
              Ahorro
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {formatCurrency(data.savingsTotal)}
            </p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
              Deuda TDC
            </p>
            <p className="mt-2 text-lg font-semibold text-danger-500">
              {formatCurrency(data.debtTotal)}
            </p>
          </div>
        </div>
      </SectionCard>

      {data.accounts.map((account) => (
        <SectionCard
          key={account.id}
          title={account.name}
          rows={[
            {
              label: 'Tipo de cuenta',
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
        />
      ))}
    </AppShell>
  );
}
