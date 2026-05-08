'use client';

import { useActionState, useState } from 'react';

import {
  archiveAccountAction,
  createAccountAction,
  initialAccountActionState,
  updateAccountAction,
} from '@/app/cuentas/actions';

type ManagedAccount = {
  id: string;
  name: string;
  type: 'debit' | 'credit' | 'cash' | 'savings';
  current_balance: number;
  due_amount?: number;
  due_date?: string | null;
  minimum_payment?: number | null;
};

type AccountsManagerProps = {
  accounts: ManagedAccount[];
};

type ActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const accountTypeOptions = [
  { value: 'debit', label: 'Debito' },
  { value: 'cash', label: 'Efectivo' },
  { value: 'savings', label: 'Ahorro' },
  { value: 'credit', label: 'Credito' },
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

function CreateAccountForm() {
  const [state, formAction, pending] = useActionState(
    createAccountAction,
    initialAccountActionState
  );
  const [type, setType] = useState<'debit' | 'credit' | 'cash' | 'savings'>('debit');

  return (
    <form
      action={formAction}
      className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]"
    >
      <div className="space-y-2">
        <p className="text-base font-semibold text-foreground">Agregar cuenta</p>
        <p className="text-sm leading-6 text-text-muted">
          Aqui puedes crear una cuenta nueva o una nueva TDC con sus datos base.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Nombre</span>
          <input
            name="name"
            required
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            placeholder="Ej. BBVA Debito o TDC BBVA"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Tipo</span>
          <select
            name="type"
            value={type}
            onChange={(event) =>
              setType(event.target.value as 'debit' | 'credit' | 'cash' | 'savings')
            }
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          >
            {accountTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {type === 'credit' ? (
          <>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-text-body">
                Deuda actual
              </span>
              <input
                name="dueAmount"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-text-body">
                Pago minimo
              </span>
              <input
                name="minimumPayment"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-text-body">
                Fecha limite
              </span>
              <input
                name="dueDate"
                type="date"
                className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
              />
            </label>
          </>
        ) : (
          <label className="block sm:col-span-2">
            <span className="mb-2 block text-sm font-medium text-text-body">Saldo actual</span>
            <input
              name="currentBalance"
              type="number"
              min="0"
              step="0.01"
              defaultValue="0"
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            />
          </label>
        )}
      </div>

      <div className="mt-5 space-y-3">
        <FeedbackMessage state={state} />
        <button
          type="submit"
          disabled={pending}
          className="h-12 rounded-2xl bg-olive-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-olive-600 disabled:opacity-70"
        >
          {pending ? 'Guardando...' : 'Agregar cuenta'}
        </button>
      </div>
    </form>
  );
}

function AccountEditCard({ account }: { account: ManagedAccount }) {
  const [updateState, updateAction, updating] = useActionState(
    updateAccountAction,
    initialAccountActionState
  );
  const [archiveState, archiveAction, archiving] = useActionState(
    archiveAccountAction,
    initialAccountActionState
  );

  const isCredit = account.type === 'credit';

  return (
    <div className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]">
      <form action={updateAction} className="space-y-4">
        <input type="hidden" name="accountId" value={account.id} />
        <input type="hidden" name="type" value={account.type} />

        <div>
          <p className="text-base font-semibold text-foreground">{account.name}</p>
          <p className="mt-1 text-sm text-text-muted">
            {isCredit
              ? 'Edita nombre, deuda, fecha limite y pago minimo.'
              : 'Edita el nombre y saldo visible de esta cuenta.'}
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Nombre</span>
          <input
            name="name"
            required
            defaultValue={account.name}
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
        </label>

        {isCredit ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-text-body">Deuda actual</span>
              <input
                name="dueAmount"
                type="number"
                min="0"
                step="0.01"
                defaultValue={String(account.due_amount ?? Math.abs(account.current_balance))}
                className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-text-body">Pago minimo</span>
              <input
                name="minimumPayment"
                type="number"
                min="0"
                step="0.01"
                defaultValue={String(account.minimum_payment ?? 0)}
                className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
              />
            </label>

            <label className="block sm:col-span-2">
              <span className="mb-2 block text-sm font-medium text-text-body">Fecha limite</span>
              <input
                name="dueDate"
                type="date"
                defaultValue={account.due_date ?? ''}
                className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
              />
            </label>
          </div>
        ) : (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">Saldo actual</span>
            <input
              name="currentBalance"
              type="number"
              min="0"
              step="0.01"
              defaultValue={String(account.current_balance)}
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            />
          </label>
        )}

        <div className="space-y-3">
          <FeedbackMessage state={updateState} />
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={updating}
              className="h-11 rounded-2xl bg-olive-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-olive-600 disabled:opacity-70"
            >
              {updating ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>

      <form action={archiveAction} className="mt-4 border-t border-border-soft pt-4">
        <input type="hidden" name="accountId" value={account.id} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-text-body">Archivar cuenta</p>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              La cuenta deja de aparecer en la app, pero tus movimientos pasados se conservan.
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

export function AccountsManager({ accounts }: AccountsManagerProps) {
  return (
    <div className="space-y-4">
      <CreateAccountForm />

      <section className="grid gap-4 md:grid-cols-2">
        {accounts.map((account) => (
          <AccountEditCard key={account.id} account={account} />
        ))}
      </section>
    </div>
  );
}
