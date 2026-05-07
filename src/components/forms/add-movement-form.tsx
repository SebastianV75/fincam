'use client';

import { useActionState, useMemo, useState } from 'react';

import { createMovementAction, initialState } from '@/app/agregar/actions';

type CategoryOption = {
  id: string;
  name: string;
  kind: 'expense' | 'income' | 'transfer' | 'credit_payment';
};

type AccountOption = {
  id: string;
  name: string;
  type: 'debit' | 'credit' | 'cash' | 'savings';
};

type AddMovementFormProps = {
  categories: CategoryOption[];
  accounts: AccountOption[];
  defaultDate: string;
};

const movementTypes = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' },
  { value: 'credit_payment', label: 'Abono TDC' },
  { value: 'transfer', label: 'Transferencia' },
] as const;

export function AddMovementForm({
  categories,
  accounts,
  defaultDate,
}: AddMovementFormProps) {
  const [state, formAction, pending] = useActionState(createMovementAction, initialState);
  const [movementType, setMovementType] = useState<(typeof movementTypes)[number]['value']>('expense');

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => category.kind === movementType);
  }, [categories, movementType]);

  const sourceAccounts = useMemo(() => {
    if (movementType === 'credit_payment') {
      return accounts.filter((account) => account.type !== 'credit');
    }

    return accounts;
  }, [accounts, movementType]);

  const destinationAccounts = useMemo(() => {
    return accounts.filter((account) => account.type !== 'credit');
  }, [accounts]);

  return (
    <form
      action={formAction}
      className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]"
    >
      <div className="grid grid-cols-2 gap-2">
        {movementTypes.map((type) => {
          const isActive = type.value === movementType;

          return (
            <button
              key={type.value}
              type="button"
              onClick={() => setMovementType(type.value)}
              className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-olive-500 bg-olive-500 text-white'
                  : 'border-border-soft bg-background text-foreground hover:bg-soft'
              }`}
            >
              {type.label}
            </button>
          );
        })}
      </div>

      <input type="hidden" name="type" value={movementType} />

      <div className="mt-5 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Monto</span>
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            required
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            placeholder="0.00"
          />
        </label>

        {movementType !== 'transfer' ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">Categoría</span>
            <select
              name="categoryId"
              required
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            >
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">
            {movementType === 'credit_payment' ? 'Cuenta origen' : 'Cuenta'}
          </span>
          <select
            name="accountId"
            required
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          >
            {sourceAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>

        {movementType === 'transfer' ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">
              Cuenta destino
            </span>
            <select
              name="destinationAccountId"
              required
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            >
              {destinationAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Fecha</span>
          <input
            name="transactionDate"
            type="date"
            required
            defaultValue={defaultDate}
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Nota</span>
          <textarea
            name="note"
            rows={3}
            className="w-full rounded-2xl border border-border-soft bg-background px-4 py-3 text-base text-foreground outline-none transition focus:border-olive-500"
            placeholder="Opcional"
          />
        </label>

        {movementType === 'credit_payment' ? (
          <p className="rounded-2xl bg-olive-100 px-4 py-3 text-sm leading-6 text-olive-600">
            El abono se aplicará a la tarjeta de crédito activa registrada en el backend.
          </p>
        ) : null}

        {state.message ? (
          <p
            className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
              state.status === 'success'
                ? 'bg-olive-100 text-olive-600'
                : 'bg-danger-100 text-danger-500'
            }`}
          >
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 h-12 w-full rounded-2xl bg-olive-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-olive-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? 'Guardando...' : 'Guardar movimiento'}
        </button>
      </div>
    </form>
  );
}
