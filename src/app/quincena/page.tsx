import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/ui/section-card";

export default function PayPeriodPage() {
  return (
    <AppShell
      activeTab="quincena"
      title="Quincena"
      subtitle="1 May - 15 May"
    >
      <SectionCard title="Ingreso recibido">
        <p className="text-4xl font-semibold tracking-tight text-foreground">
          $8,000
        </p>
        <p className="mt-2 text-sm text-text-muted">Depositado el 1 May</p>
      </SectionCard>

      <SectionCard
        title="Orden automático"
        rows={[
          { label: "1. Pagos fijos", value: "" },
          { label: "2. TDC", value: "" },
          { label: "3. Ahorro", value: "" },
          { label: "4. Libre", value: "" },
        ]}
      />

      <SectionCard
        title="Distribución"
        actionLabel="Ajustar"
        rows={[
          { label: "Pagos fijos", value: "$2,100" },
          { label: "TDC", value: "$2,300" },
          { label: "Ahorro", value: "$1,000" },
          { label: "Libre", value: "$2,600" },
        ]}
      >
        <div className="mb-4 flex h-3 overflow-hidden rounded-full bg-soft">
          <div className="w-[26%] bg-[#d8d1c1]" />
          <div className="w-[29%] bg-danger-100" />
          <div className="w-[13%] bg-olive-300" />
          <div className="w-[32%] bg-[#878b7f]" />
        </div>
      </SectionCard>

      <SectionCard
        title="Reglas activas"
        actionLabel="Editar reglas"
        rows={[
          { label: "Renta", meta: "fijo", value: "$1,500" },
          { label: "Internet", meta: "fijo", value: "$500" },
          { label: "TDC Banamex", meta: "manual", value: "$2,300" },
          { label: "Fondo emergencia", meta: "12%", value: "ahorro" },
        ]}
      />

      <SectionCard title="Resultado">
        <p className="text-sm font-medium text-text-muted">
          Dinero libre para esta quincena
        </p>
        <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground">
          $2,600
        </p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-text-muted">
          Ya asignaste pagos, TDC y ahorro antes de gastar.
        </p>
      </SectionCard>
    </AppShell>
  );
}
