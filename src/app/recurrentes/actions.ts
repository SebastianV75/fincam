'use server';

import { revalidatePath } from 'next/cache';

import { getInsforgeClient } from '@/lib/insforge';

type ActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

type RecurrenceType = 'weekly' | 'biweekly' | 'monthly' | 'custom';
type LinkedRuleCategory = 'fixed_expense' | 'credit_card' | 'savings' | null;

function parseAmount(value: FormDataEntryValue | null) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function parseReminderDays(value: FormDataEntryValue | null) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }

  return Math.round(amount);
}

function normalizeLinkedRuleCategory(value: FormDataEntryValue | null): LinkedRuleCategory {
  const raw = String(value ?? '').trim();

  if (!raw || raw === 'other') {
    return null;
  }

  if (raw === 'fixed_expense' || raw === 'credit_card' || raw === 'savings') {
    return raw;
  }

  return null;
}

async function resolveUserId() {
  const client = getInsforgeClient();

  const { data: recurringItems, error: recurringError } = await client.database
    .from('recurring_items')
    .select('user_id')
    .eq('is_active', true)
    .limit(1);

  if (recurringError) {
    throw new Error(recurringError.message ?? 'No se pudo resolver el usuario.');
  }

  const recurringUserId = recurringItems?.[0]?.user_id;
  if (recurringUserId) {
    return String(recurringUserId);
  }

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
    throw new Error('No encontramos un usuario base para crear el recurrente.');
  }

  return String(payPeriodUserId);
}

function revalidateApp() {
  revalidatePath('/');
  revalidatePath('/mas');
  revalidatePath('/quincena');
  revalidatePath('/recurrentes');
}

export async function createRecurringAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();
    const userId = await resolveUserId();

    const name = String(formData.get('name') ?? '').trim();
    const amount = parseAmount(formData.get('amount'));
    const recurrenceType = String(formData.get('recurrenceType') ?? 'monthly') as RecurrenceType;
    const nextDueDate = String(formData.get('nextDueDate') ?? '').trim();
    const reminderDaysBefore = parseReminderDays(formData.get('reminderDaysBefore'));
    const linkedRuleCategory = normalizeLinkedRuleCategory(formData.get('linkedRuleCategory'));

    if (!name) {
      return { status: 'error', message: 'Ponle nombre al recurrente.' };
    }

    if (amount <= 0) {
      return { status: 'error', message: 'Ingresa un monto valido.' };
    }

    if (!nextDueDate) {
      return { status: 'error', message: 'Selecciona una fecha para el proximo cargo.' };
    }

    const { error } = await client.database.from('recurring_items').insert([
      {
        user_id: userId,
        name,
        amount,
        recurrence_type: recurrenceType,
        next_due_date: nextDueDate,
        reminder_days_before: reminderDaysBefore,
        linked_rule_category: linkedRuleCategory,
        is_active: true,
      },
    ]);

    if (error) {
      throw new Error(error.message ?? 'No se pudo crear el recurrente.');
    }

    revalidateApp();

    return {
      status: 'success',
      message: 'Recurrente creado correctamente.',
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'No se pudo crear el recurrente.',
    };
  }
}

export async function updateRecurringAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();

    const recurringId = String(formData.get('recurringId') ?? '').trim();
    const name = String(formData.get('name') ?? '').trim();
    const amount = parseAmount(formData.get('amount'));
    const recurrenceType = String(formData.get('recurrenceType') ?? 'monthly') as RecurrenceType;
    const nextDueDate = String(formData.get('nextDueDate') ?? '').trim();
    const reminderDaysBefore = parseReminderDays(formData.get('reminderDaysBefore'));
    const linkedRuleCategory = normalizeLinkedRuleCategory(formData.get('linkedRuleCategory'));

    if (!recurringId) {
      return { status: 'error', message: 'No encontramos el recurrente a editar.' };
    }

    if (!name) {
      return { status: 'error', message: 'Ponle nombre al recurrente.' };
    }

    if (amount <= 0) {
      return { status: 'error', message: 'Ingresa un monto valido.' };
    }

    if (!nextDueDate) {
      return { status: 'error', message: 'Selecciona una fecha para el proximo cargo.' };
    }

    const { error } = await client.database
      .from('recurring_items')
      .update({
        name,
        amount,
        recurrence_type: recurrenceType,
        next_due_date: nextDueDate,
        reminder_days_before: reminderDaysBefore,
        linked_rule_category: linkedRuleCategory,
      })
      .eq('id', recurringId);

    if (error) {
      throw new Error(error.message ?? 'No se pudo actualizar el recurrente.');
    }

    revalidateApp();

    return {
      status: 'success',
      message: 'Recurrente actualizado correctamente.',
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'No se pudo actualizar el recurrente.',
    };
  }
}

export async function archiveRecurringAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();
    const recurringId = String(formData.get('recurringId') ?? '').trim();

    if (!recurringId) {
      return { status: 'error', message: 'No encontramos el recurrente a archivar.' };
    }

    const { error } = await client.database
      .from('recurring_items')
      .update({ is_active: false })
      .eq('id', recurringId);

    if (error) {
      throw new Error(error.message ?? 'No se pudo archivar el recurrente.');
    }

    revalidateApp();

    return {
      status: 'success',
      message: 'Recurrente archivado correctamente.',
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'No se pudo archivar el recurrente.',
    };
  }
}
