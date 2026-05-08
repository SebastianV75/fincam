'use client';

import { useActionState } from 'react';

import {
  archiveGoalAction,
  contributeGoalAction,
  createGoalAction,
  updateGoalAction,
} from '@/app/metas/actions';

type Goal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  progressPercent: number;
  remainingAmount: number;
};

type GoalsManagerProps = {
  goals: Goal[];
  defaultDate: string;
};

type ActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const initialGoalActionState: ActionState = { status: 'idle' };

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

function CreateGoalForm() {
  const [state, formAction, pending] = useActionState(
    createGoalAction,
    initialGoalActionState
  );

  return (
    <form
      action={formAction}
      className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]"
    >
      <div className="space-y-2">
        <p className="text-base font-semibold text-foreground">Agregar meta</p>
        <p className="text-sm leading-6 text-text-muted">
          Crea una meta nueva con nombre, objetivo y un monto inicial si ya llevas algo ahorrado.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-text-body">Nombre</span>
          <input
            name="name"
            required
            placeholder="Ej. Fondo de emergencia o Viaje"
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Objetivo</span>
          <input
            name="targetAmount"
            type="number"
            min="0"
            step="0.01"
            defaultValue="0"
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Ya ahorrado</span>
          <input
            name="currentAmount"
            type="number"
            min="0"
            step="0.01"
            defaultValue="0"
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-text-body">Fecha objetivo</span>
          <input
            name="targetDate"
            type="date"
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
        </label>
      </div>

      <div className="mt-5 space-y-3">
        <FeedbackMessage state={state} />
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-2xl bg-olive-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-olive-600 disabled:opacity-70"
        >
          {pending ? 'Guardando...' : 'Agregar meta'}
        </button>
      </div>
    </form>
  );
}

function GoalEditCard({ goal, defaultDate }: { goal: Goal; defaultDate: string }) {
  const [updateState, updateAction, updating] = useActionState(
    updateGoalAction,
    initialGoalActionState
  );
  const [contributeState, contributeAction, contributing] = useActionState(
    contributeGoalAction,
    initialGoalActionState
  );
  const [archiveState, archiveAction, archiving] = useActionState(
    archiveGoalAction,
    initialGoalActionState
  );

  return (
    <div className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]">
      <form action={updateAction} className="space-y-4">
        <input type="hidden" name="goalId" value={goal.id} />

        <div>
          <p className="text-base font-semibold text-foreground">{goal.name}</p>
          <p className="mt-1 text-sm text-text-muted">
            Ajusta el nombre, objetivo o fecha de esta meta sin perder su avance acumulado.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Nombre</span>
          <input
            name="name"
            required
            defaultValue={goal.name}
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">Objetivo</span>
            <input
              name="targetAmount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={String(goal.target_amount)}
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">Fecha objetivo</span>
            <input
              name="targetDate"
              type="date"
              defaultValue={goal.target_date ?? ''}
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            />
          </label>
        </div>

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

      <form action={contributeAction} className="mt-4 border-t border-border-soft pt-4">
        <input type="hidden" name="goalId" value={goal.id} />
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-text-body">Registrar aporte</p>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Suma un aporte manual para que el progreso refleje lo que ya apartaste en la vida real.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-text-body">Aporte</span>
              <input
                name="contributionAmount"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-text-body">Fecha</span>
              <input
                name="contributionDate"
                type="date"
                defaultValue={defaultDate}
                className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">Nota</span>
            <input
              name="note"
              placeholder="Opcional. Ej. apartado de esta quincena"
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            />
          </label>

          <div className="space-y-3">
            <FeedbackMessage state={contributeState} />
            <button
              type="submit"
              disabled={contributing}
              className="h-11 rounded-2xl border border-olive-500 px-4 text-sm font-semibold text-olive-600 transition-colors hover:bg-olive-100 disabled:opacity-70"
            >
              {contributing ? 'Registrando...' : 'Registrar aporte'}
            </button>
          </div>
        </div>
      </form>

      <form action={archiveAction} className="mt-4 border-t border-border-soft pt-4">
        <input type="hidden" name="goalId" value={goal.id} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-text-body">Archivar meta</p>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              La meta deja de mostrarse en tu vista activa, pero su avance queda registrado.
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

export function GoalsManager({ goals, defaultDate }: GoalsManagerProps) {
  return (
    <div className="space-y-4">
      <CreateGoalForm />

      <section className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => (
          <GoalEditCard key={goal.id} goal={goal} defaultDate={defaultDate} />
        ))}
      </section>
    </div>
  );
}
