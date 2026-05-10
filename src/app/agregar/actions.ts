'use server';

import { revalidatePath } from 'next/cache';

import { getInsforgeClient } from '@/lib/insforge';
import {
  applyMovementEffect,
  loadMovementLedgerContext,
  persistMovementLedgerContext,
} from '@/lib/finance/movement-ledger';

type ActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

function revalidateApp() {
  revalidatePath('/');
  revalidatePath('/agregar');
  revalidatePath('/cuentas');
  revalidatePath('/mas');
  revalidatePath('/metas');
  revalidatePath('/movimientos');
  revalidatePath('/quincena');
  revalidatePath('/recurrentes');
}

export async function createMovementAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();

    const type = String(formData.get('type') ?? 'expense') as
      | 'expense'
      | 'income'
      | 'credit_payment'
      | 'transfer';
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

    const context = await loadMovementLedgerContext();
    const sourceAccount = context.accountsById.get(accountId);

    if (!sourceAccount) {
      return { status: 'error', message: 'La cuenta seleccionada no existe.' };
    }

    const currentPayPeriod = context.currentPayPeriod;
    const userId = currentPayPeriod?.user_id ?? sourceAccount.user_id;

    const movement = {
      user_id: userId,
      pay_period_id: currentPayPeriod?.id ?? null,
      account_id: accountId,
      destination_account_id: type === 'transfer' ? destinationAccountId : null,
      type,
      amount,
      category_id: categoryId || null,
      note: note || null,
      transaction_date: transactionDate,
    };

    const { data: insertedTransactions, error: insertError } = await client.database
      .from('transactions')
      .insert([movement])
      .select('id')
      .limit(1);

    if (insertError) {
      throw new Error(insertError.message ?? 'No se pudo guardar el movimiento.');
    }

    const transactionId = insertedTransactions?.[0]?.id;

    applyMovementEffect(context, movement, 'apply');
    await persistMovementLedgerContext(context);

    if (type === 'credit_payment') {
      const creditAccountId = sourceAccount.type === 'credit'
        ? sourceAccount.id
        : Array.from(context.creditCardByAccountId.values())[0]?.account_id;
      const creditCard = creditAccountId
        ? context.creditCardByAccountId.get(creditAccountId)
        : null;

      if (!creditCard) {
        throw new Error('No hay una tarjeta de crédito activa para registrar el abono.');
      }

      const { error: paymentError } = await client.database
        .from('credit_card_payments')
        .insert([
          {
            transaction_id: transactionId ?? null,
            credit_card_id: creditCard.id,
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

    revalidateApp();

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
