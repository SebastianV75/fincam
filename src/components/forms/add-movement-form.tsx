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

const movementTypeCopy = {
  expense: {
    title: 'Registrar gasto',
    description: 'Usalo para compras, servicios o cualquier salida de dinero.',
    amountLabel: 'Cuanto gastaste',
    amountPlaceholder: 'Ej. 250',
    accountLabel: 'De donde salio',
    summaryVerb: 'Sale de',
  },
  income: {
    title: 'Registrar ingreso',
    description: 'Ideal para quincena, reembolsos o dinero extra que te entro.',
    amountLabel: 'Cuanto ingreso',
    amountPlaceholder: 'Ej. 8000',
    accountLabel: 'A que cuenta entro',
    summaryVerb: 'Entra a',
  },
  credit_payment: {
    title: 'Registrar abono TDC',
    description:
      'Esto descuenta dinero de una cuenta y baja lo que debes en la tarjeta.',
    amountLabel: 'Cuanto abonaste',
    amountPlaceholder: 'Ej. 1000',
    accountLabel: 'Desde que cuenta pagaste',
    summaryVerb: 'Se paga desde',
  },
  transfer: {
    title: 'Registrar transferencia',
    description: 'Mueve dinero entre tus cuentas sin afectar tu gasto real.',
    amountLabel: 'Cuanto transferiste',
    amountPlaceholder: 'Ej. 500',
    accountLabel: 'Cuenta origen',
    summaryVerb: 'Se mueve desde',
  },
} as const;

const accountTypeLabel = {
  debit: 'Debito',
  credit: 'Credito',
  cash: 'Efectivo',
  savings: 'Ahorro',
} as const;

function formatMoneyPreview(value: string) {
  const amount = Number(value);

  if (!Number.isFinite(amount) || amount <= 0) {
    return '$0';
  }

  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function AddMovementForm({
  categories,
  accounts,
  defaultDate,
}: AddMovementFormProps) {
  const [state, formAction, pending] = useActionState(
    createMovementAction,
    initialState
  );
  const [movementType, setMovementType] = useState<
    (typeof movementTypes)[number]['value']
  >('expense');
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(defaultDate);
  const [note, setNote] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedDestinationAccountId, setSelectedDestinationAccountId] =
    useState('');

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => category.kind === movementType);
  }, [categories, movementType]);

  const sourceAccounts = useMemo(() => {
    if (movementType === 'credit_payment') {
      return accounts.filter((account) => account.type !== 'credit');
    }

    return accounts;
  }, [accounts, movementType]);

  const currentCategoryId = filteredCategories.some(
    (category) => category.id === selectedCategoryId
  )
    ? selectedCategoryId
    : filteredCategories[0]?.id ?? '';

  const currentAccountId = sourceAccounts.some(
    (account) => account.id === selectedAccountId
  )
    ? selectedAccountId
    : sourceAccounts[0]?.id ?? '';

  const destinationAccounts = useMemo(() => {
    return accounts.filter(
      (account) => account.type !== 'credit' && account.id !== currentAccountId
    );
  }, [accounts, currentAccountId]);

  const currentDestinationAccountId = destinationAccounts.some(
    (account) => account.id === selectedDestinationAccountId
  )
    ? selectedDestinationAccountId
    : destinationAccounts[0]?.id ?? '';

  const selectedTypeCopy = movementTypeCopy[movementType];
  const selectedCategory =
    filteredCategories.find((category) => category.id === currentCategoryId) ?? null;
  const selectedSourceAccount =
    sourceAccounts.find((account) => account.id === currentAccountId) ?? null;
  const selectedDestinationAccount =
    destinationAccounts.find((account) => account.id === currentDestinationAccountId) ??
    null;

  const isDisabled =
    pending ||
    sourceAccounts.length === 0 ||
    (movementType !== 'transfer' && filteredCategories.length === 0) ||
    (movementType === 'transfer' && destinationAccounts.length === 0);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-[24px] border border-border-soft bg-surface p-5 shadow-[0_1px_2px_rgba(47,49,43,0.04),0_8px_24px_rgba(47,49,43,0.03)]"
    >
      <div className="rounded-[20px] bg-background px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-olive-600">{selectedTypeCopy.title}</p>
            <p className="mt-2 max-w-md text-sm leading-6 text-text-muted">
              {selectedTypeCopy.description}
            </p>
          </div>
          <span className="rounded-full bg-olive-100 px-3 py-1 text-xs font-medium text-olive-600">
            Rapido
          </span>
        </div>
      </div>

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

      <section className="rounded-[20px] bg-background px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
          Resumen
        </p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-semibold tracking-tight text-foreground">
              {formatMoneyPreview(amount)}
            </p>
            <p className="mt-2 text-sm text-text-muted">
              {selectedTypeCopy.summaryVerb}{' '}
              <span className="font-medium text-text-body">
                {selectedSourceAccount?.name ?? 'tu cuenta'}
              </span>
              {movementType === 'transfer' && selectedDestinationAccount
                ? ` hacia ${selectedDestinationAccount.name}`
                : ''}
            </p>
          </div>
          {selectedCategory ? (
            <span className="rounded-full border border-border-soft px-3 py-1 text-xs font-medium text-text-body">
              {selectedCategory.name}
            </span>
          ) : null}
        </div>
      </section>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">
            {selectedTypeCopy.amountLabel}
          </span>
          <input
            name="amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            required
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            placeholder={selectedTypeCopy.amountPlaceholder}
          />
        </label>

        {movementType !== 'transfer' ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">
              Categoria
            </span>
            <select
              key={`category-${movementType}`}
              name="categoryId"
              value={currentCategoryId}
              onChange={(event) => setSelectedCategoryId(event.target.value)}
              required
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            >
              {filteredCategories.length === 0 ? (
                <option value="">Sin categorias disponibles</option>
              ) : null}
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
            {selectedTypeCopy.accountLabel}
          </span>
          <select
            key={`source-${movementType}`}
            name="accountId"
            value={currentAccountId}
            onChange={(event) => setSelectedAccountId(event.target.value)}
            required
            className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
          >
            {sourceAccounts.length === 0 ? (
              <option value="">Sin cuentas disponibles</option>
            ) : null}
            {sourceAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name} · {accountTypeLabel[account.type]}
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
              key="destination-transfer"
              name="destinationAccountId"
              value={currentDestinationAccountId}
              onChange={(event) => setSelectedDestinationAccountId(event.target.value)}
              required
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            >
              {destinationAccounts.length === 0 ? (
                <option value="">No hay otra cuenta disponible</option>
              ) : null}
              {destinationAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} · {accountTypeLabel[account.type]}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-text-body">Fecha</span>
            <input
              name="transactionDate"
              type="date"
              required
              value={transactionDate}
              onChange={(event) => setTransactionDate(event.target.value)}
              className="h-12 w-full rounded-2xl border border-border-soft bg-background px-4 text-base text-foreground outline-none transition focus:border-olive-500"
            />
          </label>

          <div className="rounded-2xl bg-background px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-muted">
              Impacto
            </p>
            <p className="mt-2 text-sm leading-6 text-text-body">
              {movementType === 'expense' && 'Baja saldo y reduce tu libre restante.'}
              {movementType === 'income' && 'Sube saldo y aumenta lo disponible.'}
              {movementType === 'credit_payment' &&
                'Baja saldo de una cuenta y reduce tu deuda de tarjeta.'}
              {movementType === 'transfer' &&
                'Solo mueve dinero entre cuentas sin cambiar tu gasto real.'}
            </p>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-text-body">Nota</span>
          <textarea
            name="note"
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="w-full rounded-2xl border border-border-soft bg-background px-4 py-3 text-base text-foreground outline-none transition focus:border-olive-500"
            placeholder="Opcional. Ej. super, gasolina, pago adelantado..."
          />
        </label>

        {movementType === 'transfer' ? (
          <p className="rounded-2xl bg-background px-4 py-3 text-sm leading-6 text-text-muted">
            Las transferencias mueven saldo entre cuentas, pero no cambian tu gasto
            real de la quincena.
          </p>
        ) : null}

        {movementType === 'credit_payment' ? (
          <p className="rounded-2xl bg-olive-100 px-4 py-3 text-sm leading-6 text-olive-600">
            El abono se aplicara a la tarjeta de credito activa registrada en el
            backend.
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
          disabled={isDisabled}
          className="h-12 w-full rounded-2xl bg-olive-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-olive-600 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {pending ? 'Guardando...' : 'Guardar movimiento'}
        </button>
      </div>
    </form>
  );
}
