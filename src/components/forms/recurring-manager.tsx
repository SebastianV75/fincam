'use client';

import { useActionState, useState } from 'react';

import {
  archiveRecurringAction,
  createRecurringAction,
  updateRecurringAction,
} from '@/app/recurrentes/actions';

type RecurringItem = {
  id: string;
  name: string;
  amount: number;
  recurrence_type: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  next_due_date: string;
  reminder_days_before: number;
  linked_rule_category: 'fixed_expense' | 'credit_card' | 'savings' | null;
};

type RecurringManagerProps = {
  recurringItems: RecurringItem[];
};

type ActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const initialRecurringActionState: ActionState = { status: 'idle' };

const recurrenceOptions = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' },
  { value: 'monthly', label: 'Mensual' },
  { value: 'custom', label: 'Personalizada' },
] as const;

const linkedCategoryOptions = [
  { value: 'fixed_expense', label: 'Pago fijo' },
  { value: 'credit_card', label: 'TDC' },
  { value: 'savings', label: 'Ahorro' },
  { value: 'other', label: 'Otro' },
] as const;

function FeedbackMessage({ state }: { state: ActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
        state.status === 'success'
          ? 'bg-olive-100 text-olive-600'
          : 'bg-danger-100 text-danger-500'
      }`}
    >
      {state.message}
    </p>
  );
}

function CreateRecurringForm() {
  const [state, formAction, pending] = useActionState(
    createRecurringAction,
    initialRecurringActionState
  );
  const [recurrenceType, setRecurrenceType] = useState<
    'weekly' | 'biweekly' | 'monthly' | 'custom'
  >('monthly');

  return (
    <form
      action={formAction}
      className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]"
    >
      <div className="space-y-2">
        <p className="text-base font-semibold text-foreground">Agregar recurrente</p>
        <p className="text-sm leading-6 text-text-muted">
          Crea un pago o apartado que vuelve con frecuencia para tenerlo presente en tu quincena.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-text-body">Nombre</span>
          <input
            name="name"
            required
            placeholder="Ej. Internet, Spotify o Ahorro fondo"
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Monto</span>
          <input
            name="amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue="0"
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Frecuencia</span>
          <select
            name="recurrenceType"
            value={recurrenceType}
            onChange={(event) =>
              setRecurrenceType(
                event.target.value as 'weekly' | 'biweekly' | 'monthly' | 'custom'
              )
            }
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          >
            {recurrenceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">
            Proximo cargo
          </span>
          <input
            name="nextDueDate"
            type="date"
            required
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">
            Recordatorio
          </span>
          <input
            name="reminderDaysBefore"
            type="number"
            min="0"
            step="1"
            defaultValue="0"
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-text-body">Categoria</span>
          <select
            name="linkedRuleCategory"
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          >
            {linkedCategoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 space-y-3">
        <FeedbackMessage state={state} />
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-2xl bg-olive-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-olive-600 disabled:opacity-70"
        >
          {pending ? 'Guardando...' : 'Agregar recurrente'}
        </button>
      </div>
    </form>
  );
}

function RecurringEditCard({ item }: { item: RecurringItem }) {
  const [updateState, updateAction, updating] = useActionState(
    updateRecurringAction,
    initialRecurringActionState
  );
  const [archiveState, archiveAction, archiving] = useActionState(
    archiveRecurringAction,
    initialRecurringActionState
  );
  const defaultCategory = item.linked_rule_category ?? 'other';

  return (
    <div className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]">
      <form action={updateAction} className="space-y-4">
        <input type="hidden" name="recurringId" value={item.id} />

        <div>
          <p className="text-base font-semibold text-foreground">{item.name}</p>
          <p className="mt-1 text-sm text-text-muted">
            Ajusta monto, frecuencia, categoria o fecha sin rehacer tu planeacion.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Nombre</span>
          <input
            name="name"
            required
            defaultValue={item.name}
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">Monto</span>
            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={String(item.amount)}
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">Frecuencia</span>
            <select
              name="recurrenceType"
              defaultValue={item.recurrence_type}
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            >
              {recurrenceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">
              Proximo cargo
            </span>
            <input
              name="nextDueDate"
              type="date"
              defaultValue={item.next_due_date}
              required
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">
              Recordatorio
            </span>
            <input
              name="reminderDaysBefore"
              type="number"
              min="0"
              step="1"
              defaultValue={String(item.reminder_days_before)}
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Categoria</span>
          <select
            name="linkedRuleCategory"
            defaultValue={defaultCategory}
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          >
            {linkedCategoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="space-y-3">
          <FeedbackMessage state={updateState} />
          <button
            type="submit"
            disabled={updating}
            className="h-11 rounded-2xl bg-olive-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-olive-600 disabled:opacity-70"
          >
            {updating ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      <form action={archiveAction} className="mt-4 border-t border-border-soft pt-4">
        <input type="hidden" name="recurringId" value={item.id} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-text-body">Archivar recurrente</p>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Deja de salir en tu vista activa, pero no borra el contexto historico del sistema.
            </p>
          </div>
          <button
            type="submit"
            disabled={archiving}
            className="h-11 rounded-2xl border border-danger-500 px-4 text-sm font-semibold text-danger-500 transition-colors hover:bg-danger-100 disabled:opacity-70"
          >
            {archiving ? 'Archivando...' : 'Archivar'}
          </button>
        </div>
        <div className="mt-3">
          <FeedbackMessage state={archiveState} />
        </div>
      </form>
    </div>
  );
}

export function RecurringManager({ recurringItems }: RecurringManagerProps) {
  return (
    <div className="space-y-4">
      <CreateRecurringForm />

      <section className="grid gap-4 md:grid-cols-2">
        {recurringItems.map((item) => (
          <RecurringEditCard key={item.id} item={item} />
        ))}
      </section>
    </div>
  );
}
