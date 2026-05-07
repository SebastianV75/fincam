import { AppShell } from "@/components/layout/app-shell";

const movementTypes = ["Gasto", "Ingreso", "Abono TDC", "Transferencia"];

export default function AddMovementPage() {
  return (
    <AppShell
      activeTab="agregar"
      title="Nuevo movimiento"
      subtitle="Captura rápida para el día a día"
    >
      <section className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]">
        <div className="grid grid-cols-2 gap-2">
          {movementTypes.map((type) => (
            <button
              key={type}
              className="rounded-2xl border border-border-soft bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-soft"
            >
              {type}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">
              Monto
            </span>
            <input
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
              placeholder="$0.00"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">
              Categoría
            </span>
            <select className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500">
              <option>Comida</option>
              <option>Transporte</option>
              <option>Servicios</option>
              <option>Salidas</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">
              Cuenta
            </span>
            <select className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500">
              <option>Débito principal</option>
              <option>Efectivo</option>
              <option>TDC Banamex</option>
            </select>
          </label>

          <button className="mt-2 h-12 w-full rounded-2xl bg-olive-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-olive-600">
            Guardar movimiento
          </button>
        </div>
      </section>
    </AppShell>
  );
}
