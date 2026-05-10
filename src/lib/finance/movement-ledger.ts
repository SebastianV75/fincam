import { getInsforgeClient } from '@/lib/insforge';

export type MovementType = 'expense' | 'income' | 'credit_payment' | 'transfer';

export type LedgerAccount = {
  id: string;
  user_id: string;
  name: string;
  type: 'debit' | 'credit' | 'cash' | 'savings';
  current_balance: number;
};

export type LedgerPayPeriod = {
  id: string;
  user_id: string;
  free_amount: number;
};

export type LedgerCreditCard = {
  id: string;
  account_id: string;
  due_amount: number;
};

export type MovementRecordInput = {
  id?: string;
  user_id?: string;
  pay_period_id?: string | null;
  account_id: string;
  destination_account_id?: string | null;
  type: MovementType;
  amount: number;
  category_id?: string | null;
  note?: string | null;
  transaction_date: string;
};

type QueryLike<T> = {
  then: (
    onfulfilled: (value: { data: T[] | null; error: { message?: string } | null }) => unknown,
    onrejected?: (reason: unknown) => unknown
  ) => unknown;
};

export type MovementLedgerContext = {
  accountsById: Map<string, LedgerAccount>;
  currentPayPeriod: LedgerPayPeriod | null;
  creditCardsById: Map<string, LedgerCreditCard>;
  creditCardByAccountId: Map<string, LedgerCreditCard>;
};

export function asNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

export async function runRows<T>(query: QueryLike<T>) {
  const { data, error } = await query;

  if (error) {
    throw new Error(error.message ?? 'InsForge query failed');
  }

  return data ?? [];
}

export async function loadMovementLedgerContext() {
  const client = getInsforgeClient();

  const [accounts, payPeriods, creditCards] = await Promise.all([
    runRows<LedgerAccount>(
      client.database
        .from('accounts')
        .select('id, user_id, name, type, current_balance')
    ),
    runRows<LedgerPayPeriod>(
      client.database
        .from('pay_periods')
        .select('id, user_id, free_amount')
        .eq('status', 'open')
        .order('start_date', { ascending: false })
        .limit(1)
    ),
    runRows<LedgerCreditCard>(
      client.database
        .from('credit_cards')
        .select('id, account_id, due_amount')
        .order('created_at', { ascending: true })
    ),
  ]);

  const normalizedAccounts = accounts.map((account) => ({
    ...account,
    current_balance: asNumber(account.current_balance),
  }));
  const normalizedCreditCards = creditCards.map((card) => ({
    ...card,
    due_amount: asNumber(card.due_amount),
  }));

  return {
    accountsById: new Map(normalizedAccounts.map((account) => [account.id, account])),
    currentPayPeriod:
      payPeriods[0]
        ? {
            ...payPeriods[0],
            free_amount: asNumber(payPeriods[0].free_amount),
          }
        : null,
    creditCardsById: new Map(normalizedCreditCards.map((card) => [card.id, card])),
    creditCardByAccountId: new Map(
      normalizedCreditCards.map((card) => [card.account_id, card])
    ),
  } satisfies MovementLedgerContext;
}

function adjustAccount(context: MovementLedgerContext, accountId: string, delta: number) {
  const account = context.accountsById.get(accountId);
  if (!account) {
    throw new Error('La cuenta asociada al movimiento ya no existe.');
  }

  account.current_balance = asNumber(account.current_balance) + delta;
}

function adjustPayPeriod(context: MovementLedgerContext, delta: number) {
  if (!context.currentPayPeriod) {
    return;
  }

  context.currentPayPeriod.free_amount = asNumber(context.currentPayPeriod.free_amount) + delta;
}

function adjustCreditCardByAccount(
  context: MovementLedgerContext,
  accountId: string,
  delta: number
) {
  const card = context.creditCardByAccountId.get(accountId);
  if (!card) {
    throw new Error('La tarjeta asociada al movimiento ya no existe.');
  }

  card.due_amount = Math.max(0, asNumber(card.due_amount) + delta);
}

export function applyMovementEffect(
  context: MovementLedgerContext,
  movement: MovementRecordInput,
  mode: 'apply' | 'reverse'
) {
  const direction = mode === 'apply' ? 1 : -1;
  const amount = asNumber(movement.amount);
  const sourceAccount = context.accountsById.get(movement.account_id);

  if (!sourceAccount) {
    throw new Error('La cuenta origen del movimiento ya no existe.');
  }

  if (movement.type === 'expense') {
    adjustAccount(context, movement.account_id, -direction * amount);

    if (sourceAccount.type === 'credit') {
      adjustCreditCardByAccount(context, sourceAccount.id, direction * amount);
    }

    adjustPayPeriod(context, -direction * amount);
    return;
  }

  if (movement.type === 'income') {
    adjustAccount(context, movement.account_id, direction * amount);
    adjustPayPeriod(context, direction * amount);
    return;
  }

  if (movement.type === 'credit_payment') {
    if (sourceAccount.type !== 'credit') {
      adjustAccount(context, movement.account_id, -direction * amount);
    }

    const creditAccountId =
      sourceAccount.type === 'credit'
        ? sourceAccount.id
        : Array.from(context.creditCardByAccountId.values())[0]?.account_id;

    if (!creditAccountId) {
      throw new Error('No hay una tarjeta de crédito activa para este abono.');
    }

    adjustAccount(context, creditAccountId, direction * amount);
    adjustCreditCardByAccount(context, creditAccountId, -direction * amount);
    return;
  }

  if (movement.type === 'transfer') {
    const destinationAccountId = movement.destination_account_id ?? null;

    if (!destinationAccountId) {
      throw new Error('Este movimiento no tiene cuenta destino registrada.');
    }

    adjustAccount(context, movement.account_id, -direction * amount);
    adjustAccount(context, destinationAccountId, direction * amount);
  }
}

export async function persistMovementLedgerContext(context: MovementLedgerContext) {
  const client = getInsforgeClient();

  await Promise.all([
    ...Array.from(context.accountsById.values()).map((account) =>
      client.database
        .from('accounts')
        .update({ current_balance: account.current_balance })
        .eq('id', account.id)
        .then(({ error }) => {
          if (error) {
            throw new Error(error.message ?? 'No se pudo actualizar una cuenta.');
          }
        })
    ),
    ...Array.from(context.creditCardsById.values()).map((card) =>
      client.database
        .from('credit_cards')
        .update({ due_amount: card.due_amount })
        .eq('id', card.id)
        .then(({ error }) => {
          if (error) {
            throw new Error(error.message ?? 'No se pudo actualizar una TDC.');
          }
        })
    ),
    ...(context.currentPayPeriod
      ? [
          client.database
            .from('pay_periods')
            .update({ free_amount: context.currentPayPeriod.free_amount })
            .eq('id', context.currentPayPeriod.id)
            .then(({ error }) => {
              if (error) {
                throw new Error(error.message ?? 'No se pudo actualizar la quincena.');
              }
            }),
        ]
      : []),
  ]);
}
