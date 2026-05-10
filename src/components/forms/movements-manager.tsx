'use client';

import { useActionState } from 'react';

import {
  deleteMovementAction,
  updateMovementAction,
} from '@/app/movimientos/actions';

type TransactionRecord = {
  id: string;
  user_id: string;
  pay_period_id: string | null;
  account_id: string | null;
  destination_account_id: string | null;
  type: 'expense' | 'income' | 'credit_payment' | 'transfer';
  amount: number;
  category_id: string | null;
  note: string | null;
  transaction_date: string;
};

type AccountOption = {
  id: string;
  name: string;
  type: 'debit' | 'credit' | 'cash' | 'savings';
  is_active: boolean;
};

type CategoryOption = {
  id: string;
  name: string;
  kind: 'expense' | 'income' | 'transfer' | 'credit_payment';
};

type MovementsManagerProps = {
  transactions: TransactionRecord[];
  accounts: AccountOption[];
  categories: CategoryOption[];
};

type ActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const initialMovementActionState: ActionState = { status: 'idle' };

const movementTypeOptions = [
  { value: 'expense', label: 'Gasto' },
  { value: 'income', label: 'Ingreso' },
  { value: 'credit_payment', label: 'Abono TDC' },
  { value: 'transfer', label: 'Transferencia' },
] as const;

const accountTypeLabel = {
  debit: 'Debito',
  credit: 'Credito',
  cash: 'Efectivo',
  savings: 'Ahorro',
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

function formatMovementTypeLabel(type: TransactionRecord['type']) {
  return movementTypeOptions.find((option) => option.value === type)?.label ?? type;
}

function MovementEditCard({
  transaction,
  accounts,
  categories,
}: {
  transaction: TransactionRecord;
  accounts: AccountOption[];
  categories: CategoryOption[];
}) {
  const [updateState, updateAction, updating] = useActionState(
    updateMovementAction,
    initialMovementActionState
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteMovementAction,
    initialMovementActionState
  );

  const filteredCategories = categories.filter((category) => category.kind === transaction.type);
  const sourceAccounts =
    transaction.type === 'credit_payment'
      ? accounts.filter((account) => account.type !== 'credit')
      : accounts;
  const destinationAccounts = accounts.filter(
    (account) => account.type !== 'credit' && account.id !== transaction.account_id
  );

  return (
    <div className="rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]">
      <form action={updateAction} className="space-y-4">
        <input type="hidden" name="transactionId" value={transaction.id} />

        <div>
          <p className="text-base font-semibold text-foreground">
            {formatMovementTypeLabel(transaction.type)} · ${transaction.amount.toFixed(2)}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            Corrige cuenta, monto, fecha o categoria si capturaste algo mal.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Tipo</span>
          <select
            name="type"
            defaultValue={transaction.type}
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          >
            {movementTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">Monto</span>
            <input
              name="amount"
              type="number"
              min="0"
              step="0.01"
              defaultValue={String(transaction.amount)}
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">Fecha</span>
            <input
              name="transactionDate"
              type="date"
              defaultValue={transaction.transaction_date.slice(0, 10)}
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Cuenta origen</span>
          <select
            name="accountId"
            defaultValue={transaction.account_id ?? ''}
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          >
            {sourceAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} · {accountTypeLabel[account.type]}
              </option>
            ))}
          </select>
        </label>

        {transaction.type === 'transfer' ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">Cuenta destino</span>
            <select
              name="destinationAccountId"
              defaultValue={transaction.destination_account_id ?? ''}
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            >
              {destinationAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} · {accountTypeLabel[account.type]}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {transaction.type !== 'transfer' ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">Categoria</span>
            <select
              name="categoryId"
              defaultValue={transaction.category_id ?? ''}
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
          <span className="mb-2 block text-sm font-medium text-text-body">Nota</span>
          <input
            name="note"
            defaultValue={transaction.note ?? ''}
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          />
        </label>

        <div className="space-y-3">
          <FeedbackMessage state={updateState} />
          <button
            type="submit"
            disabled={updating}
            className="h-11 rounded-2xl bg-olive-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-olive-600 disabled:opacity-70"
          >
            {updating ? 'Guardando...' : 'Aplicar cambios'}
          </button>
        </div>
      </form>

      <form action={deleteAction} className="mt-4 border-t border-border-soft pt-4">
        <input type="hidden" name="transactionId" value={transaction.id} />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-text-body">Eliminar movimiento</p>
            <p className="mt-1 text-sm leading-6 text-text-muted">
              Esto sí revierte su impacto en saldos y quincena. Úsalo solo si fue una captura equivocada.
            </p>
          </div>
          <button
            type="submit"
            disabled={deleting}
            className="h-11 rounded-2xl border border-danger-500 px-4 text-sm font-semibold text-danger-500 transition-colors hover:bg-danger-100 disabled:opacity-70"
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
        <div className="mt-3">
          <FeedbackMessage state={deleteState} />
        </div>
      </form>
    </div>
  );
}

export function MovementsManager({
  transactions,
  accounts,
  categories,
}: MovementsManagerProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {transactions.map((transaction) => (
        <MovementEditCard
          key={transaction.id}
          transaction={transaction}
          accounts={accounts}
          categories={categories}
        />
      ))}
    </section>
  );
}
