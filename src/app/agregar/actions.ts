'use server';

import { revalidatePath } from 'next/cache';

import { getInsforgeClient } from '@/lib/insforge';

type ActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

const initialState: ActionState = { status: 'idle' };

function asNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

async function runSingle<T>(query: {
  then: (
    onfulfilled: (value: { data: T[] | null; error: { message?: string } | null }) => unknown,
    onrejected?: (reason: unknown) => unknown
  ) => unknown;
}) {
  const { data, error } = await query;

  if (error) {
    throw new Error(error.message ?? 'InsForge query failed');
  }

  return data ?? [];
}

export async function createMovementAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();

    const type = String(formData.get('type') ?? 'expense');
    const amount = Number(formData.get('amount') ?? 0);
    const accountId = String(formData.get('accountId') ?? '');
    const destinationAccountId = String(formData.get('destinationAccountId') ?? '');
    const categoryId = String(formData.get('categoryId') ?? '');
    const transactionDate = String(formData.get('transactionDate') ?? '');
    const note = String(formData.get('note') ?? '').trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      return { status: 'error', message: 'Ingresa un monto válido.' };
    }

    if (!accountId) {
      return { status: 'error', message: 'Selecciona una cuenta.' };
    }

    if (!transactionDate) {
      return { status: 'error', message: 'Selecciona una fecha.' };
    }

    if (type === 'transfer' && !destinationAccountId) {
      return { status: 'error', message: 'Selecciona una cuenta destino.' };
    }

    const [accounts, payPeriods, creditCards] = await Promise.all([
      runSingle<{
        id: string;
        user_id: string;
        name: string;
        type: 'debit' | 'credit' | 'cash' | 'savings';
        current_balance: number;
      }>(
        client.database
          .from('accounts')
          .select('id, user_id, name, type, current_balance')
      ),
      runSingle<{
        id: string;
        user_id: string;
        free_amount: number;
      }>(
        client.database
          .from('pay_periods')
          .select('id, user_id, free_amount')
          .eq('status', 'open')
          .order('start_date', { ascending: false })
          .limit(1)
      ),
      runSingle<{
        id: string;
        account_id: string;
        due_amount: number;
      }>(
        client.database
          .from('credit_cards')
          .select('id, account_id, due_amount')
          .order('created_at', { ascending: true })
      ),
    ]);

    const sourceAccount = accounts.find((account) => account.id === accountId);
    if (!sourceAccount) {
      return { status: 'error', message: 'La cuenta seleccionada no existe.' };
    }

    const currentPayPeriod = payPeriods[0] ?? null;
    const userId = currentPayPeriod?.user_id ?? sourceAccount.user_id;

    const selectedCreditCard = creditCards.find(
      (card) => card.account_id === sourceAccount.id
    );
    const fallbackCreditCard = creditCards[0] ?? null;

    const transactionPayload = {
      user_id: userId,
      pay_period_id: currentPayPeriod?.id ?? null,
      account_id: sourceAccount.id,
      type,
      amount,
      category_id: categoryId || null,
      note: note || null,
      transaction_date: transactionDate,
    };

    const insertTransaction = async () => {
      const { error } = await client.database
        .from('transactions')
        .insert([transactionPayload]);

      if (error) {
        throw new Error(error.message ?? 'No se pudo guardar el movimiento.');
      }
    };

    const updateAccountBalance = async (targetAccountId: string, nextBalance: number) => {
      const { error } = await client.database
        .from('accounts')
        .update({ current_balance: nextBalance })
        .eq('id', targetAccountId);

      if (error) {
        throw new Error(error.message ?? 'No se pudo actualizar la cuenta.');
      }
    };

    const updatePayPeriodFreeAmount = async (nextFreeAmount: number) => {
      if (!currentPayPeriod) {
        return;
      }

      const { error } = await client.database
        .from('pay_periods')
        .update({ free_amount: nextFreeAmount })
        .eq('id', currentPayPeriod.id);

      if (error) {
        throw new Error(error.message ?? 'No se pudo actualizar la quincena.');
      }
    };

    if (type === 'expense') {
      await insertTransaction();
      await updateAccountBalance(
        sourceAccount.id,
        asNumber(sourceAccount.current_balance) - amount
      );

      if (sourceAccount.type === 'credit' && selectedCreditCard) {
        const { error } = await client.database
          .from('credit_cards')
          .update({ due_amount: asNumber(selectedCreditCard.due_amount) + amount })
          .eq('id', selectedCreditCard.id);

        if (error) {
          throw new Error(error.message ?? 'No se pudo actualizar la TDC.');
        }
      }

      if (currentPayPeriod) {
        await updatePayPeriodFreeAmount(asNumber(currentPayPeriod.free_amount) - amount);
      }
    }

    if (type === 'income') {
      await insertTransaction();
      await updateAccountBalance(
        sourceAccount.id,
        asNumber(sourceAccount.current_balance) + amount
      );

      if (currentPayPeriod) {
        await updatePayPeriodFreeAmount(asNumber(currentPayPeriod.free_amount) + amount);
      }
    }

    if (type === 'credit_payment') {
      const targetCreditCard = selectedCreditCard ?? fallbackCreditCard;

      if (!targetCreditCard) {
        return {
          status: 'error',
          message: 'No hay una tarjeta de crédito activa para registrar el abono.',
        };
      }

      const creditAccount = accounts.find(
        (account) => account.id === targetCreditCard.account_id
      );

      await insertTransaction();

      if (sourceAccount.type !== 'credit') {
        await updateAccountBalance(
          sourceAccount.id,
          asNumber(sourceAccount.current_balance) - amount
        );
      }

      if (creditAccount) {
        await updateAccountBalance(
          creditAccount.id,
          asNumber(creditAccount.current_balance) + amount
        );
      }

      const { error: creditCardError } = await client.database
        .from('credit_cards')
        .update({ due_amount: Math.max(0, asNumber(targetCreditCard.due_amount) - amount) })
        .eq('id', targetCreditCard.id);

      if (creditCardError) {
        throw new Error(creditCardError.message ?? 'No se pudo actualizar la TDC.');
      }

      const { error: paymentError } = await client.database
        .from('credit_card_payments')
        .insert([
          {
            credit_card_id: targetCreditCard.id,
            pay_period_id: currentPayPeriod?.id ?? null,
            amount,
            payment_date: transactionDate,
            note: note || 'Abono registrado desde la app',
          },
        ]);

      if (paymentError) {
        throw new Error(paymentError.message ?? 'No se pudo guardar el abono TDC.');
      }
    }

    if (type === 'transfer') {
      const destinationAccount = accounts.find(
        (account) => account.id === destinationAccountId
      );

      if (!destinationAccount) {
        return { status: 'error', message: 'La cuenta destino no existe.' };
      }

      await insertTransaction();
      await updateAccountBalance(
        sourceAccount.id,
        asNumber(sourceAccount.current_balance) - amount
      );
      await updateAccountBalance(
        destinationAccount.id,
        asNumber(destinationAccount.current_balance) + amount
      );
    }

    revalidatePath('/');
    revalidatePath('/quincena');
    revalidatePath('/cuentas');
    revalidatePath('/agregar');

    return {
      status: 'success',
      message: 'Movimiento guardado correctamente.',
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Algo salió mal al guardar.',
    };
  }
}

export { initialState };
