import { AppShell } from '@/components/layout/app-shell';
import { SectionCard } from '@/components/ui/section-card';
import { getGoalsPageData } from '@/lib/data/finance-dashboard';
import { formatCurrency, formatMonthYear } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export default async function GoalsPage() {
  const data = await getGoalsPageData();

  return (
    <AppShell
      activeTab="metas"
      title="Metas"
      subtitle="Ahorro simple y visible"
      desktopSummary={{
        title: 'Ahorro',
        stats: [
          { label: 'Guardado', value: formatCurrency(data.totalSaved), tone: 'accent' },
          { label: 'Objetivo total', value: formatCurrency(data.totalTarget) },
        ],
        note: 'Tus metas ya muestran avance real. La siguiente capa natural sera poder aportar desde aqui.',
      }}
    >
      <SectionCard title="Resumen de metas">
        <p className="mb-4 text-4xl font-semibold tracking-tight text-foreground">
          {formatCurrency(data.totalSaved)}
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
              Ahorrado hoy
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {formatCurrency(data.totalSaved)}
            </p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
              Meta total
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {formatCurrency(data.totalTarget)}
            </p>
          </div>
        </div>
      </SectionCard>

      {data.goals.map((goal, index) => (
        <SectionCard
          key={goal.id}
          title={goal.name}
          actionLabel="Aportar"
          rows={[
            {
              label: 'Progreso',
              value: `${formatCurrency(goal.current_amount)} / ${formatCurrency(goal.target_amount)}`,
            },
            {
              label: 'Te faltan',
              value: formatCurrency(goal.remainingAmount),
            },
            {
              label: 'Objetivo',
              value: goal.target_date ? formatMonthYear(goal.target_date) : 'Sin fecha',
            },
          ]}
        >
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-text-body">Avance</span>
              <span className="text-text-muted">{goal.progressPercent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-soft">
              <div
                className={`h-full rounded-full ${index % 2 === 0 ? 'bg-olive-500' : 'bg-olive-300'}`}
                style={{ width: `${goal.progressPercent}%` }}
              />
            </div>
          </div>
        </SectionCard>
      ))}
    </AppShell>
  );
}
