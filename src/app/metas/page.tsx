import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/ui/section-card";

export default function GoalsPage() {
  return (
    <AppShell
      activeTab="metas"
      title="Metas"
      subtitle="Ahorro simple y visible"
    >
      <SectionCard
        title="Fondo de emergencia"
        actionLabel="Aportar"
        rows={[{ label: "Progreso", value: "$6,000 / $20,000" }]}
      >
        <div className="mb-4 h-3 overflow-hidden rounded-full bg-soft">
          <div className="h-full w-[30%] rounded-full bg-olive-500" />
        </div>
      </SectionCard>

      <SectionCard
        title="Viaje"
        actionLabel="Aportar"
        rows={[{ label: "Progreso", value: "$2,500 / $10,000" }]}
      >
        <div className="mb-4 h-3 overflow-hidden rounded-full bg-soft">
          <div className="h-full w-[25%] rounded-full bg-olive-300" />
        </div>
      </SectionCard>
    </AppShell>
  );
}
