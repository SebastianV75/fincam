import Link from 'next/link';

import { AppShell } from '@/components/layout/app-shell';

const secondarySections = [
  {
    title: 'Cuentas',
    href: '/cuentas',
    description: 'Consulta tus saldos, ahorro y deuda de tarjeta en una vista tranquila.',
  },
  {
    title: 'Metas',
    href: '/metas',
    description: 'Revisa tu avance de ahorro y cuanto te falta para cada objetivo.',
  },
  {
    title: 'Recurrentes',
    href: '/recurrentes',
    description: 'Ten presentes tus pagos y apartados que vuelven cada semana, quincena o mes.',
  },
  {
    title: 'Movimientos',
    href: '/movimientos',
    description: 'Revisa, corrige o elimina capturas para mantener tu historial y saldos coherentes.',
  },
] as const;

export default function MorePage() {
  return (
    <AppShell
      activeTab="mas"
      title="Mas"
      subtitle="Secciones de consulta para revisar cuentas, metas y compromisos recurrentes sin saturar tu flujo diario."
      desktopSummary={{
        title: 'Consulta',
        stats: [
          { label: 'Secciones', value: String(secondarySections.length), tone: 'accent' },
          { label: 'Uso', value: 'Ocasional' },
        ],
        note: 'Inicio, Agregar y Quincena son el centro. Aqui vive lo secundario para mantener la app mas limpia.',
      }}
    >
      <section className="grid gap-4">
        {secondarySections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)] transition-colors hover:bg-soft"
          >
            <p className="text-base font-semibold text-foreground">{section.title}</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-text-muted">
              {section.description}
            </p>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
