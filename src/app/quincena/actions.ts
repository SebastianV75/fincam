'use server';

import { revalidatePath } from 'next/cache';

import { getInsforgeClient } from '@/lib/insforge';

type ActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
};

type RuleCategory = 'fixed_expense' | 'credit_card' | 'savings';
type RuleType = 'fixed' | 'percentage' | 'manual';

function parseAmount(value: FormDataEntryValue | null) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function parsePriority(value: FormDataEntryValue | null) {
  const priority = Number(value ?? 1);

  if (!Number.isFinite(priority) || priority <= 0) {
    return 1;
  }

  return Math.round(priority);
}

function normalizeCategory(value: FormDataEntryValue | null): RuleCategory {
  const raw = String(value ?? '').trim();

  if (raw === 'fixed_expense' || raw === 'credit_card' || raw === 'savings') {
    return raw;
  }

  return 'fixed_expense';
}

function normalizeRuleType(value: FormDataEntryValue | null): RuleType {
  const raw = String(value ?? '').trim();

  if (raw === 'fixed' || raw === 'percentage' || raw === 'manual') {
    return raw;
  }

  return 'fixed';
}

async function resolveUserId() {
  const client = getInsforgeClient();

  const { data: rules, error: rulesError } = await client.database
    .from('allocation_rules')
    .select('user_id')
    .eq('is_active', true)
    .limit(1);

  if (rulesError) {
    throw new Error(rulesError.message ?? 'No se pudo resolver el usuario.');
  }

  const rulesUserId = rules?.[0]?.user_id;
  if (rulesUserId) {
    return String(rulesUserId);
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
    throw new Error('No encontramos un usuario base para crear la regla.');
  }

  return String(payPeriodUserId);
}

function revalidateApp() {
  revalidatePath('/');
  revalidatePath('/mas');
  revalidatePath('/quincena');
  revalidatePath('/recurrentes');
}

function validateRuleInput(name: string, ruleType: RuleType, value: number) {
  if (!name) {
    return 'Ponle nombre a la regla.';
  }

  if (value <= 0) {
    return 'Ingresa un monto o porcentaje valido.';
  }

  if (ruleType === 'percentage' && value > 100) {
    return 'Un porcentaje no puede ser mayor a 100.';
  }

  return null;
}

export async function createAllocationRuleAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();
    const userId = await resolveUserId();

    const name = String(formData.get('name') ?? '').trim();
    const category = normalizeCategory(formData.get('category'));
    const ruleType = normalizeRuleType(formData.get('ruleType'));
    const value = parseAmount(formData.get('value'));
    const priorityOrder = parsePriority(formData.get('priorityOrder'));

    const validationError = validateRuleInput(name, ruleType, value);
    if (validationError) {
      return { status: 'error', message: validationError };
    }

    const { error } = await client.database.from('allocation_rules').insert([
      {
        user_id: userId,
        category,
        name,
        rule_type: ruleType,
        value,
        priority_order: priorityOrder,
        is_active: true,
      },
    ]);

    if (error) {
      throw new Error(error.message ?? 'No se pudo crear la regla.');
    }

    revalidateApp();

    return {
      status: 'success',
      message: 'Regla guardada correctamente.',
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'No se pudo crear la regla.',
    };
  }
}

export async function updateAllocationRuleAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();

    const ruleId = String(formData.get('ruleId') ?? '').trim();
    const name = String(formData.get('name') ?? '').trim();
    const category = normalizeCategory(formData.get('category'));
    const ruleType = normalizeRuleType(formData.get('ruleType'));
    const value = parseAmount(formData.get('value'));
    const priorityOrder = parsePriority(formData.get('priorityOrder'));

    if (!ruleId) {
      return { status: 'error', message: 'No encontramos la regla a editar.' };
    }

    const validationError = validateRuleInput(name, ruleType, value);
    if (validationError) {
      return { status: 'error', message: validationError };
    }

    const { error } = await client.database
      .from('allocation_rules')
      .update({
        name,
        category,
        rule_type: ruleType,
        value,
        priority_order: priorityOrder,
      })
      .eq('id', ruleId);

    if (error) {
      throw new Error(error.message ?? 'No se pudo actualizar la regla.');
    }

    revalidateApp();

    return {
      status: 'success',
      message: 'Regla actualizada correctamente.',
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'No se pudo actualizar la regla.',
    };
  }
}

export async function archiveAllocationRuleAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const client = getInsforgeClient();
    const ruleId = String(formData.get('ruleId') ?? '').trim();

    if (!ruleId) {
      return { status: 'error', message: 'No encontramos la regla a archivar.' };
    }

    const { error } = await client.database
      .from('allocation_rules')
      .update({ is_active: false })
      .eq('id', ruleId);

    if (error) {
      throw new Error(error.message ?? 'No se pudo archivar la regla.');
    }

    revalidateApp();

    return {
      status: 'success',
      message: 'Regla archivada correctamente.',
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'No se pudo archivar la regla.',
    };
  }
}
