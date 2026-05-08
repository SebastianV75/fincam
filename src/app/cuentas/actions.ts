'use server';

import { revalidatePath } from 'next/cache';

import { getInsforgeClient } from '@/lib/insforge';

type ActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

export const initialAccountActionState: ActionState = { status: 'idle' };

type AccountType = 'debit' | 'credit' | 'cash' | 'savings';

function parseAmount(value: FormDataEntryValue | null) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function normalizeOptionalDate(value: FormDataEntryValue | null) {
  const date = String(value ?? '').trim();
  return date ? date : null;
}

async function resolveUserId() {
  const client = getInsforgeClient();

  const { data: accounts, error: accountsError } = await client.database
    .from('accounts')
    .select('user_id')
    .eq('is_active', true)
    .limit(1);

  if (accountsError) {
    throw new Error(accountsError.message ?? 'No se pudo resolver el usuario.');
  }

  const accountUserId = accounts?.[0]?.user_id;
  if (accountUserId) {
    return String(accountUserId);
  }

  const { data: payPeriods, error: payPeriodsError } = await client.database
    .from('pay_periods')
    .select('user_id')
    .limit(1);

  if (payPeriodsError) {
    throw new Error(payPeriodsError.message ?? 'No se pudo resolver el usuario.');
  }

  const payPeriodUserId = payPeriods?.[0]?.user_id;
  if (!payPeriodUserId) {
    throw new Error('No encontramos un usuario base para crear la cuenta.');
  }

  return String(payPeriodUserId);
}

function revalidateApp() {
  revalidatePath('/');
  revalidatePath('/agregar');
  revalidatePath('/cuentas');
  revalidatePath('/mas');
  revalidatePath('/quincena');
  revalidatePath('/recurrentes');
}

export async function createAccountAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();
    const userId = await resolveUserId();

    const name = String(formData.get('name') ?? '').trim();
    const type = String(formData.get('type') ?? 'debit') as AccountType;
    const currentBalance = parseAmount(formData.get('currentBalance'));
    const dueAmount = parseAmount(formData.get('dueAmount'));
    const minimumPayment = parseAmount(formData.get('minimumPayment'));
    const dueDate = normalizeOptionalDate(formData.get('dueDate'));

    if (!name) {
      return { status: 'error', message: 'Ponle nombre a la cuenta.' };
    }

    const balanceToStore = type === 'credit' ? -Math.abs(dueAmount) : currentBalance;

    const { data: insertedAccounts, error: insertAccountError } = await client.database
      .from('accounts')
      .insert([
        {
          user_id: userId,
          name,
          type,
          current_balance: balanceToStore,
          is_active: true,
        },
      ])
      .select('id')
      .limit(1);

    if (insertAccountError) {
      throw new Error(insertAccountError.message ?? 'No se pudo crear la cuenta.');
    }

    const accountId = insertedAccounts?.[0]?.id;

    if (type === 'credit' && accountId) {
      const { error: insertCreditError } = await client.database
        .from('credit_cards')
        .insert([
          {
            account_id: accountId,
            due_amount: Math.abs(dueAmount),
            due_date: dueDate,
            minimum_payment: minimumPayment || null,
          },
        ]);

      if (insertCreditError) {
        throw new Error(insertCreditError.message ?? 'No se pudo crear la tarjeta de crédito.');
      }
    }

    revalidateApp();

    return {
      status: 'success',
      message: 'Cuenta creada correctamente.',
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'No se pudo crear la cuenta.',
    };
  }
}

export async function updateAccountAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();

    const accountId = String(formData.get('accountId') ?? '').trim();
    const type = String(formData.get('type') ?? 'debit') as AccountType;
    const name = String(formData.get('name') ?? '').trim();
    const currentBalance = parseAmount(formData.get('currentBalance'));
    const dueAmount = parseAmount(formData.get('dueAmount'));
    const minimumPayment = parseAmount(formData.get('minimumPayment'));
    const dueDate = normalizeOptionalDate(formData.get('dueDate'));

    if (!accountId) {
      return { status: 'error', message: 'No encontramos la cuenta a editar.' };
    }

    if (!name) {
      return { status: 'error', message: 'Ponle nombre a la cuenta.' };
    }

    const balanceToStore = type === 'credit' ? -Math.abs(dueAmount) : currentBalance;

    const { error: updateAccountError } = await client.database
      .from('accounts')
      .update({
        name,
        current_balance: balanceToStore,
      })
      .eq('id', accountId);

    if (updateAccountError) {
      throw new Error(updateAccountError.message ?? 'No se pudo actualizar la cuenta.');
    }

    if (type === 'credit') {
      const { data: existingCreditCards, error: creditCardLookupError } = await client.database
        .from('credit_cards')
        .select('id')
        .eq('account_id', accountId)
        .limit(1);

      if (creditCardLookupError) {
        throw new Error(
          creditCardLookupError.message ?? 'No se pudo revisar la tarjeta de crédito.'
        );
      }

      const existingCreditCardId = existingCreditCards?.[0]?.id;

      if (existingCreditCardId) {
        const { error: updateCreditError } = await client.database
          .from('credit_cards')
          .update({
            due_amount: Math.abs(dueAmount),
            due_date: dueDate,
            minimum_payment: minimumPayment || null,
          })
          .eq('id', existingCreditCardId);

        if (updateCreditError) {
          throw new Error(updateCreditError.message ?? 'No se pudo actualizar la TDC.');
        }
      } else {
        const { error: insertCreditError } = await client.database
          .from('credit_cards')
          .insert([
            {
              account_id: accountId,
              due_amount: Math.abs(dueAmount),
              due_date: dueDate,
              minimum_payment: minimumPayment || null,
            },
          ]);

        if (insertCreditError) {
          throw new Error(insertCreditError.message ?? 'No se pudo crear la TDC.');
        }
      }
    }

    revalidateApp();

    return {
      status: 'success',
      message: 'Cuenta actualizada correctamente.',
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'No se pudo actualizar la cuenta.',
    };
  }
}

export async function archiveAccountAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();
    const accountId = String(formData.get('accountId') ?? '').trim();

    if (!accountId) {
      return { status: 'error', message: 'No encontramos la cuenta a archivar.' };
    }

    const { error } = await client.database
      .from('accounts')
      .update({ is_active: false })
      .eq('id', accountId);

    if (error) {
      throw new Error(error.message ?? 'No se pudo archivar la cuenta.');
    }

    revalidateApp();

    return {
      status: 'success',
      message: 'Cuenta archivada correctamente.',
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'No se pudo archivar la cuenta.',
    };
  }
}
