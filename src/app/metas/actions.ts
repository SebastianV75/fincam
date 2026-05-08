'use server';

import { revalidatePath } from 'next/cache';

import { getInsforgeClient } from '@/lib/insforge';

type ActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

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

  const { data: goals, error: goalsError } = await client.database
    .from('savings_goals')
    .select('user_id')
    .eq('is_active', true)
    .limit(1);

  if (goalsError) {
    throw new Error(goalsError.message ?? 'No se pudo resolver el usuario.');
  }

  const goalUserId = goals?.[0]?.user_id;
  if (goalUserId) {
    return String(goalUserId);
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

  throw new Error('No encontramos un usuario base para crear la meta.');
}

async function getCurrentPayPeriodId() {
  const client = getInsforgeClient();
  const { data, error } = await client.database
    .from('pay_periods')
    .select('id')
    .eq('status', 'open')
    .order('start_date', { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message ?? 'No se pudo leer la quincena actual.');
  }

  return data?.[0]?.id ?? null;
}

function revalidateApp() {
  revalidatePath('/');
  revalidatePath('/mas');
  revalidatePath('/metas');
}

export async function createGoalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();
    const userId = await resolveUserId();

    const name = String(formData.get('name') ?? '').trim();
    const targetAmount = parseAmount(formData.get('targetAmount'));
    const currentAmount = parseAmount(formData.get('currentAmount'));
    const targetDate = normalizeOptionalDate(formData.get('targetDate'));

    if (!name) {
      return { status: 'error', message: 'Ponle nombre a la meta.' };
    }

    if (targetAmount <= 0) {
      return { status: 'error', message: 'Ingresa un objetivo valido.' };
    }

    const { error } = await client.database.from('savings_goals').insert([
      {
        user_id: userId,
        name,
        target_amount: targetAmount,
        current_amount: currentAmount,
        target_date: targetDate,
        is_active: true,
      },
    ]);

    if (error) {
      throw new Error(error.message ?? 'No se pudo crear la meta.');
    }

    revalidateApp();

    return { status: 'success', message: 'Meta creada correctamente.' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'No se pudo crear la meta.',
    };
  }
}

export async function updateGoalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();

    const goalId = String(formData.get('goalId') ?? '').trim();
    const name = String(formData.get('name') ?? '').trim();
    const targetAmount = parseAmount(formData.get('targetAmount'));
    const targetDate = normalizeOptionalDate(formData.get('targetDate'));

    if (!goalId) {
      return { status: 'error', message: 'No encontramos la meta a editar.' };
    }

    if (!name) {
      return { status: 'error', message: 'Ponle nombre a la meta.' };
    }

    if (targetAmount <= 0) {
      return { status: 'error', message: 'Ingresa un objetivo valido.' };
    }

    const { error } = await client.database
      .from('savings_goals')
      .update({
        name,
        target_amount: targetAmount,
        target_date: targetDate,
      })
      .eq('id', goalId);

    if (error) {
      throw new Error(error.message ?? 'No se pudo actualizar la meta.');
    }

    revalidateApp();

    return { status: 'success', message: 'Meta actualizada correctamente.' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'No se pudo actualizar la meta.',
    };
  }
}

export async function contributeGoalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();
    const goalId = String(formData.get('goalId') ?? '').trim();
    const contributionAmount = parseAmount(formData.get('contributionAmount'));
    const contributionDate = String(formData.get('contributionDate') ?? '').trim();
    const note = String(formData.get('note') ?? '').trim();

    if (!goalId) {
      return { status: 'error', message: 'No encontramos la meta a la que quieres aportar.' };
    }

    if (contributionAmount <= 0) {
      return { status: 'error', message: 'Ingresa un aporte valido.' };
    }

    if (!contributionDate) {
      return { status: 'error', message: 'Selecciona la fecha del aporte.' };
    }

    const { data: goals, error: goalLookupError } = await client.database
      .from('savings_goals')
      .select('id, current_amount')
      .eq('id', goalId)
      .limit(1);

    if (goalLookupError) {
      throw new Error(goalLookupError.message ?? 'No se pudo leer la meta.');
    }

    const goal = goals?.[0];
    if (!goal) {
      return { status: 'error', message: 'La meta ya no existe.' };
    }

    const payPeriodId = await getCurrentPayPeriodId();
    const nextCurrentAmount = Number(goal.current_amount ?? 0) + contributionAmount;

    const { error: updateGoalError } = await client.database
      .from('savings_goals')
      .update({ current_amount: nextCurrentAmount })
      .eq('id', goalId);

    if (updateGoalError) {
      throw new Error(updateGoalError.message ?? 'No se pudo actualizar el avance de la meta.');
    }

    const { error: insertContributionError } = await client.database
      .from('goal_contributions')
      .insert([
        {
          goal_id: goalId,
          pay_period_id: payPeriodId,
          amount: contributionAmount,
          contribution_date: contributionDate,
          note: note || 'Aporte manual desde la app',
        },
      ]);

    if (insertContributionError) {
      throw new Error(insertContributionError.message ?? 'No se pudo guardar el aporte.');
    }

    revalidateApp();

    return { status: 'success', message: 'Aporte registrado correctamente.' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'No se pudo registrar el aporte.',
    };
  }
}

export async function archiveGoalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();
    const goalId = String(formData.get('goalId') ?? '').trim();

    if (!goalId) {
      return { status: 'error', message: 'No encontramos la meta a archivar.' };
    }

    const { error } = await client.database
      .from('savings_goals')
      .update({ is_active: false })
      .eq('id', goalId);

    if (error) {
      throw new Error(error.message ?? 'No se pudo archivar la meta.');
    }

    revalidateApp();

    return { status: 'success', message: 'Meta archivada correctamente.' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'No se pudo archivar la meta.',
    };
  }
}
