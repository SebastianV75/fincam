'use client';

import { useActionState, useMemo, useState } from 'react';

import {
  archiveAllocationRuleAction,
  createAllocationRuleAction,
  updateAllocationRuleAction,
} from '@/app/quincena/actions';
import type { AllocationRuleRecord } from '@/lib/data/finance-dashboard';

type ActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

type AllocationRulesManagerProps = {
  rules: AllocationRuleRecord[];
};

const initialRuleActionState: ActionState = { status: 'idle' };

const categoryOptions = [
  { value: 'fixed_expense', label: 'Pago fijo' },
  { value: 'credit_card', label: 'TDC' },
  { value: 'savings', label: 'Ahorro' },
] as const;

const ruleTypeOptions = [
  { value: 'fixed', label: 'Monto fijo' },
  { value: 'manual', label: 'Monto manual' },
  { value: 'percentage', label: 'Porcentaje' },
] as const;

const categoryCopy = {
  fixed_expense: 'Cubre servicios, suscripciones y compromisos que quieres apartar primero.',
  credit_card: 'Aparta lo que quieres mandar a tarjeta dentro de esta quincena.',
  savings: 'Separa ahorro desde que entra el ingreso para no dejarlo al final.',
} as const;

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

function RuleValueHint({ ruleType }: { ruleType: 'fixed' | 'manual' | 'percentage' }) {
  const copy =
    ruleType === 'percentage'
      ? 'Este valor se calcula sobre el ingreso de la quincena. Ejemplo: 15 significa 15%.'
      : 'Este valor se toma como monto en pesos dentro del reparto de la quincena.';

  return <p className="mt-2 text-xs leading-5 text-text-muted">{copy}</p>;
}

function CreateRuleForm({ nextPriority }: { nextPriority: number }) {
  const [state, formAction, pending] = useActionState(
    createAllocationRuleAction,
    initialRuleActionState
  );
  const [category, setCategory] = useState<'fixed_expense' | 'credit_card' | 'savings'>(
    'fixed_expense'
  );
  const [ruleType, setRuleType] = useState<'fixed' | 'manual' | 'percentage'>('fixed');

  return (
    <form
      action={formAction}
      className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]"
    >
      <div className="space-y-2">
        <p className="text-base font-semibold text-foreground">Agregar regla de reparto</p>
        <p className="text-sm leading-6 text-text-muted">
          Aqui defines como quieres dividir tu quincena segun tus prioridades reales.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-2 block text-sm font-medium text-text-body">Nombre</span>
          <input
            name="name"
            required
            placeholder="Ej. Renta, TDC BBVA o Ahorro viaje"
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Categoria</span>
          <select
            name="category"
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as 'fixed_expense' | 'credit_card' | 'savings')
            }
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs leading-5 text-text-muted">{categoryCopy[category]}</p>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Tipo</span>
          <select
            name="ruleType"
            value={ruleType}
            onChange={(event) =>
              setRuleType(event.target.value as 'fixed' | 'manual' | 'percentage')
            }
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          >
            {ruleTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">
            {ruleType === 'percentage' ? 'Porcentaje' : 'Monto'}
          </span>
          <input
            name="value"
            type="number"
            min="0"
            step="0.01"
            defaultValue="0"
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
          <RuleValueHint ruleType={ruleType} />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Prioridad</span>
          <input
            name="priorityOrder"
            type="number"
            min="1"
            step="1"
            defaultValue={String(nextPriority)}
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
          <p className="mt-2 text-xs leading-5 text-text-muted">
            Se usa para ordenar tus reglas dentro del plan.
          </p>
        </label>
      </div>

      <div className="mt-5 space-y-3">
        <FeedbackMessage state={state} />
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-2xl bg-olive-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-olive-600 disabled:opacity-70"
        >
          {pending ? 'Guardando...' : 'Agregar regla'}
        </button>
      </div>
    </form>
  );
}

function RuleEditCard({
  rule,
  nextPriority,
}: {
  rule: AllocationRuleRecord;
  nextPriority: number;
}) {
  const [updateState, updateAction, updating] = useActionState(
    updateAllocationRuleAction,
    initialRuleActionState
  );
  const [archiveState, archiveAction, archiving] = useActionState(
    archiveAllocationRuleAction,
    initialRuleActionState
  );
  const [category, setCategory] = useState(rule.category);
  const [ruleType, setRuleType] = useState(rule.rule_type);

  const valueLabel = ruleType === 'percentage' ? 'Porcentaje' : 'Monto';

  return (
    <div className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]">
      <form action={updateAction} className="space-y-4">
        <input type="hidden" name="ruleId" value={rule.id} />

        <div>
          <p className="text-base font-semibold text-foreground">{rule.name}</p>
          <p className="mt-1 text-sm text-text-muted">
            Ajusta la regla para que el reparto se parezca mas a su vida real.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Nombre</span>
          <input
            name="name"
            required
            defaultValue={rule.name}
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">Categoria</span>
            <select
              name="category"
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value as 'fixed_expense' | 'credit_card' | 'savings'
                )
              }
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs leading-5 text-text-muted">{categoryCopy[category]}</p>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">Tipo</span>
            <select
              name="ruleType"
              value={ruleType}
              onChange={(event) =>
                setRuleType(event.target.value as 'fixed' | 'manual' | 'percentage')
              }
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            >
              {ruleTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">{valueLabel}</span>
            <input
              name="value"
              type="number"
              min="0"
              step="0.01"
              defaultValue={String(rule.value)}
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            />
            <RuleValueHint ruleType={ruleType} />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">Prioridad</span>
            <input
              name="priorityOrder"
              type="number"
              min="1"
              step="1"
              defaultValue={String(rule.priority_order || nextPriority)}
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            />
          </label>
        </div>

        <div className="space-y-3">
          <FeedbackMessage state={updateState} />
          <FeedbackMessage state={archiveState} />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={updating}
            className="h-12 rounded-2xl bg-olive-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-olive-600 disabled:opacity-70"
          >
            {updating ? 'Guardando...' : 'Aplicar cambios'}
          </button>

          <button
            type="submit"
            formAction={archiveAction}
            disabled={archiving}
            className="h-12 rounded-2xl border border-danger-200 px-4 text-sm font-semibold text-danger-500 transition-colors hover:bg-danger-100 disabled:opacity-70"
          >
            {archiving ? 'Archivando...' : 'Archivar regla'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function AllocationRulesManager({ rules }: AllocationRulesManagerProps) {
  const sortedRules = useMemo(
    () => [...rules].sort((a, b) => a.priority_order - b.priority_order || a.name.localeCompare(b.name)),
    [rules]
  );
  const nextPriority = sortedRules.length > 0 ? sortedRules[sortedRules.length - 1].priority_order + 1 : 1;

  return (
    <div className="space-y-4">
      <CreateRuleForm nextPriority={nextPriority} />
      <div className="space-y-4">
        {sortedRules.map((rule) => (
          <RuleEditCard key={rule.id} rule={rule} nextPriority={nextPriority} />
        ))}
      </div>
    </div>
  );
}
