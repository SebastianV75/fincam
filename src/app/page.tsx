import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/ui/section-card";

export default function Home() {
  return (
    <AppShell
      activeTab="home"
      title="Hola, Sebastian"
      subtitle="Tu dinero hoy"
    >
      <section className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]">
        <p className="text-sm font-medium text-text-muted">Tu dinero disponible</p>
        <div className="mt-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground">
              $12,450
            </h1>
            <p className="mt-2 max-w-xs text-sm leading-6 text-text-muted">
              Lo que puedes usar sin afectar lo que ya apartaste para tu
              quincena.
            </p>
          </div>
          <span className="rounded-full bg-olive-100 px-3 py-1 text-xs font-medium text-olive-600">
            Estable
          </span>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <button className="rounded-2xl bg-olive-500 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-olive-600">
          Registrar gasto
        </button>
        <button className="rounded-2xl border border-border-soft bg-surface px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-soft">
          Registrar abono
        </button>
      </section>

      <SectionCard
        title="Quincena actual"
        actionLabel="Ver plan"
        rows={[
          { label: "Ingreso", value: "$8,000" },
          { label: "Asignado", value: "$6,250" },
          { label: "Libre restante", value: "$1,750" },
        ]}
      >
        <p className="mb-4 text-sm text-text-muted">1 May - 15 May</p>
      </SectionCard>

      <SectionCard
        title="Próximos pagos"
        actionLabel="Ver todos"
        rows={[
          { label: "Internet", meta: "08 May", value: "$500" },
          { label: "Spotify", meta: "10 May", value: "$129" },
          { label: "TDC Banamex", meta: "14 May", value: "$2,300" },
        ]}
      />

      <SectionCard
        title="Distribución"
        rows={[
          { label: "Pagos fijos", value: "$2,100" },
          { label: "TDC", value: "$2,300" },
          { label: "Ahorro", value: "$1,000" },
          { label: "Libre", value: "$1,750" },
        ]}
      >
        <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-soft">
          <div className="w-[28%] bg-[#d8d1c1]" />
          <div className="w-[30%] bg-danger-100" />
          <div className="w-[18%] bg-olive-300" />
          <div className="w-[24%] bg-[#878b7f]" />
        </div>
      </SectionCard>

      <SectionCard
        title="Cuentas"
        actionLabel="Ver cuentas"
        rows={[
          { label: "Débito principal", value: "$4,800" },
          { label: "Efectivo", value: "$650" },
          { label: "Ahorro", value: "$5,000" },
          { label: "TDC Banamex", value: "-$2,300", tone: "danger" },
        ]}
      />
    </AppShell>
  );
}
