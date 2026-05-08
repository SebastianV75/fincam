import { AppShell } from '@/components/layout/app-shell';
import { AddMovementForm } from '@/components/forms/add-movement-form';
import { getInsforgeClient } from '@/lib/insforge';

export const dynamic = 'force-dynamic';

async function getAddMovementFormData() {
  const client = getInsforgeClient();

  const [{ data: categories, error: categoriesError }, { data: accounts, error: accountsError }] =
    await Promise.all([
      client.database
        .from('categories')
        .select('id, name, kind')
        .order('kind', { ascending: true })
        .order('name', { ascending: true }),
      client.database
        .from('accounts')
        .select('id, name, type')
        .eq('is_active', true)
        .order('created_at', { ascending: true }),
    ]);

  if (categoriesError) {
    throw new Error(categoriesError.message ?? 'No se pudieron cargar las categorias.');
  }

  if (accountsError) {
    throw new Error(accountsError.message ?? 'No se pudieron cargar las cuentas.');
  }

  return {
    categories: categories ?? [],
    accounts: accounts ?? [],
  };
}

function getTodayDateString() {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  const localDate = new Date(today.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 10);
}

export default async function AddMovementPage() {
  const { categories, accounts } = await getAddMovementFormData();

  return (
    <AppShell
      activeTab="agregar"
      title="Nuevo movimiento"
      subtitle="Captura rapida para el dia a dia"
      desktopSummary={{
        title: 'Captura',
        stats: [
          { label: 'Cuentas activas', value: String(accounts.length), tone: 'accent' },
          { label: 'Categorias', value: String(categories.length) },
        ],
        note: 'Este flujo ya escribe en InsForge. La prioridad aqui es rapidez y claridad.',
      }}
    >
      <AddMovementForm
        categories={categories}
        accounts={accounts}
        defaultDate={getTodayDateString()}
      />
    </AppShell>
  );
}
