'use server';

import { revalidatePath } from 'next/cache';

import { getInsforgeClient } from '@/lib/insforge';
import {
  applyMovementEffect,
  asNumber,
  loadMovementLedgerContext,
  persistMovementLedgerContext,
  runRows,
  type MovementRecordInput,
} from '@/lib/finance/movement-ledger';

type ActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

type StoredMovement = MovementRecordInput & {
  id: string;
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

async function loadStoredMovement(transactionId: string) {
  const client = getInsforgeClient();
  const rows = await runRows<StoredMovement>(
    client.database
      .from('transactions')
      .select(
        'id, user_id, pay_period_id, account_id, destination_account_id, type, amount, category_id, note, transaction_date'
      )
      .eq('id', transactionId)
      .limit(1)
  );

  const movement = rows[0] ?? null;
  if (!movement) {
    throw new Error('El movimiento ya no existe.');
  }

  return {
    ...movement,
    amount: asNumber(movement.amount),
  };
}

async function findCreditCardPaymentId(transactionId: string, movement: StoredMovement) {
  const client = getInsforgeClient();
  const directRows = await runRows<{ id: string }>(
    client.database
      .from('credit_card_payments')
      .select('id')
      .eq('transaction_id', transactionId)
      .limit(1)
  );

  if (directRows[0]?.id) {
    return directRows[0].id;
  }

  const fallbackRows = await runRows<{ id: string }>(
    client.database
      .from('credit_card_payments')
      .select('id')
      .eq('amount', movement.amount)
      .eq('payment_date', movement.transaction_date)
      .limit(1)
  );

  return fallbackRows[0]?.id ?? null;
}

async function syncCreditCardPayment(transactionId: string, movement: StoredMovement) {
  if (movement.type !== 'credit_payment') {
    return;
  }

  const client = getInsforgeClient();
  const context = await loadMovementLedgerContext();
  const sourceAccount = movement.account_id
    ? context.accountsById.get(movement.account_id)
    : null;
  const creditAccountId = sourceAccount?.type === 'credit'
    ? sourceAccount.id
    : Array.from(context.creditCardByAccountId.values())[0]?.account_id;
  const creditCard = creditAccountId
    ? context.creditCardByAccountId.get(creditAccountId)
    : null;

  if (!creditCard) {
    throw new Error('No hay una tarjeta de crédito activa para este abono.');
  }

  const paymentId = await findCreditCardPaymentId(transactionId, movement);

  if (paymentId) {
    const { error } = await client.database
      .from('credit_card_payments')
      .update({
        transaction_id: transactionId,
        credit_card_id: creditCard.id,
        pay_period_id: movement.pay_period_id ?? null,
        amount: movement.amount,
        payment_date: movement.transaction_date,
        note: movement.note || 'Abono registrado desde la app',
      })
      .eq('id', paymentId);

    if (error) {
      throw new Error(error.message ?? 'No se pudo actualizar el abono TDC ligado.');
    }

    return;
  }

  const { error } = await client.database.from('credit_card_payments').insert([
    {
      transaction_id: transactionId,
      credit_card_id: creditCard.id,
      pay_period_id: movement.pay_period_id ?? null,
      amount: movement.amount,
      payment_date: movement.transaction_date,
      note: movement.note || 'Abono registrado desde la app',
    },
  ]);

  if (error) {
    throw new Error(error.message ?? 'No se pudo guardar el abono TDC ligado.');
  }
}

async function removeLinkedCreditCardPayment(transactionId: string, movement: StoredMovement) {
  if (movement.type !== 'credit_payment') {
    return;
  }

  const paymentId = await findCreditCardPaymentId(transactionId, movement);
  if (!paymentId) {
    return;
  }

  const client = getInsforgeClient();
  const { error } = await client.database
    .from('credit_card_payments')
    .delete()
    .eq('id', paymentId);

  if (error) {
    throw new Error(error.message ?? 'No se pudo eliminar el abono TDC ligado.');
  }
}

export async function updateMovementAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();
    const transactionId = String(formData.get('transactionId') ?? '').trim();

    if (!transactionId) {
      return { status: 'error', message: 'No encontramos el movimiento a editar.' };
    }

    const existingMovement = await loadStoredMovement(transactionId);
    const type = String(formData.get('type') ?? existingMovement.type) as StoredMovement['type'];
    const amount = Number(formData.get('amount') ?? 0);
    const accountId = String(formData.get('accountId') ?? '').trim();
    const destinationAccountId = String(formData.get('destinationAccountId') ?? '').trim();
    const categoryId = String(formData.get('categoryId') ?? '').trim();
    const transactionDate = String(formData.get('transactionDate') ?? '').trim();
    const note = String(formData.get('note') ?? '').trim();

    if (!Number.isFinite(amount) || amount <= 0) {
      return { status: 'error', message: 'Ingresa un monto valido.' };
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

    const nextMovement: StoredMovement = {
      ...existingMovement,
      account_id: accountId,
      destination_account_id: type === 'transfer' ? destinationAccountId : null,
      type,
      amount,
      category_id: type === 'transfer' ? null : categoryId || null,
      note: note || null,
      transaction_date: transactionDate,
    };

    const context = await loadMovementLedgerContext();
    applyMovementEffect(context, existingMovement, 'reverse');
    applyMovementEffect(context, nextMovement, 'apply');

    const { error: updateError } = await client.database
      .from('transactions')
      .update({
        account_id: nextMovement.account_id,
        destination_account_id: nextMovement.destination_account_id ?? null,
        type: nextMovement.type,
        amount: nextMovement.amount,
        category_id: nextMovement.category_id ?? null,
        note: nextMovement.note,
        transaction_date: nextMovement.transaction_date,
      })
      .eq('id', transactionId);

    if (updateError) {
      throw new Error(updateError.message ?? 'No se pudo actualizar el movimiento.');
    }

    await persistMovementLedgerContext(context);

    if (existingMovement.type === 'credit_payment' && nextMovement.type !== 'credit_payment') {
      await removeLinkedCreditCardPayment(transactionId, existingMovement);
    }

    if (nextMovement.type === 'credit_payment') {
      await syncCreditCardPayment(transactionId, nextMovement);
    }

    revalidateApp();

    return { status: 'success', message: 'Movimiento actualizado correctamente.' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'No se pudo actualizar el movimiento.',
    };
  }
}

export async function deleteMovementAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();
    const transactionId = String(formData.get('transactionId') ?? '').trim();

    if (!transactionId) {
      return { status: 'error', message: 'No encontramos el movimiento a eliminar.' };
    }

    const existingMovement = await loadStoredMovement(transactionId);
    const context = await loadMovementLedgerContext();

    applyMovementEffect(context, existingMovement, 'reverse');

    const { error: deleteError } = await client.database
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (deleteError) {
      throw new Error(deleteError.message ?? 'No se pudo eliminar el movimiento.');
    }

    await persistMovementLedgerContext(context);
    await removeLinkedCreditCardPayment(transactionId, existingMovement);
    revalidateApp();

    return { status: 'success', message: 'Movimiento eliminado correctamente.' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'No se pudo eliminar el movimiento.',
    };
  }
}
