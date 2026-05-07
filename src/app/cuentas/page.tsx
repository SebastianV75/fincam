import { AppShell } from "@/components/layout/app-shell";
import { SectionCard } from "@/components/ui/section-card";

export default function AccountsPage() {
  return (
    <AppShell
      activeTab="cuentas"
      title="Cuentas"
      subtitle="Resumen rápido de todas tus cuentas"
    >
      <SectionCard
        title="Resumen total"
        rows={[
          { label: "Débito principal", value: "$4,800" },
          { label: "Efectivo", value: "$650" },
          { label: "Ahorro", value: "$5,000" },
          { label: "TDC Banamex", value: "-$2,300", tone: "danger" },
        ]}
      >
        <p className="mb-4 text-4xl font-semibold tracking-tight text-foreground">
          $10,450
        </p>
      </SectionCard>
    </AppShell>
  );
}
