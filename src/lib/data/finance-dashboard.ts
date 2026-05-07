import { getInsforgeClient } from '@/lib/insforge';

export type AccountRecord = {
  id: string;
  name: string;
  type: 'debit' | 'credit' | 'cash' | 'savings';
  current_balance: number;
};

export type PayPeriodRecord = {
  id: string;
  label: string | null;
  start_date: string;
  end_date: string;
  income_amount: number;
  free_amount: number;
  income_received_at: string | null;
  status: 'open' | 'closed';
};

export type AllocationRuleRecord = {
  id: string;
  category: 'fixed_expense' | 'credit_card' | 'savings';
  name: string;
  rule_type: 'fixed' | 'percentage' | 'manual';
  value: number;
  priority_order: number;
};

export type RecurringItemRecord = {
  id: string;
  name: string;
  amount: number;
  next_due_date: string;
  linked_rule_category: 'fixed_expense' | 'credit_card' | 'savings' | null;
};

export type CreditCardRecord = {
  id: string;
  account_id: string;
  due_amount: number;
  due_date: string | null;
  minimum_payment: number | null;
};

function normalizeNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

async function runQuery<T>(query: { then: (onfulfilled: (value: { data: T[] | null; error: unknown }) => unknown, onrejected?: (reason: unknown) => unknown) => unknown }) {
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getDashboardData() {
  const client = getInsforgeClient();

  const [accounts, payPeriods, rules, recurringItems, creditCards] = await Promise.all([
    runQuery<AccountRecord>(
      client.database
        .from('accounts')
        .select('id, name, type, current_balance')
        .order('created_at', { ascending: true })
    ),
    runQuery<PayPeriodRecord>(
      client.database
        .from('pay_periods')
        .select('id, label, start_date, end_date, income_amount, free_amount, income_received_at, status')
        .eq('status', 'open')
        .order('start_date', { ascending: false })
        .limit(1)
    ),
    runQuery<AllocationRuleRecord>(
      client.database
        .from('allocation_rules')
        .select('id, category, name, rule_type, value, priority_order')
        .eq('is_active', true)
        .order('priority_order', { ascending: true })
    ),
    runQuery<RecurringItemRecord>(
      client.database
        .from('recurring_items')
        .select('id, name, amount, next_due_date, linked_rule_category')
        .eq('is_active', true)
        .order('next_due_date', { ascending: true })
        .limit(5)
    ),
    runQuery<CreditCardRecord>(
      client.database
        .from('credit_cards')
        .select('id, account_id, due_amount, due_date, minimum_payment')
        .order('due_date', { ascending: true })
    ),
  ]);

  const currentPayPeriod = payPeriods[0] ?? null;
  const accountMap = new Map(accounts.map((account) => [account.id, account]));

  const availableBalance = currentPayPeriod
    ? normalizeNumber(currentPayPeriod.free_amount)
    : accounts
        .filter((account) => account.type !== 'credit')
        .reduce((sum, account) => sum + normalizeNumber(account.current_balance), 0);

  const fixedExpensesAmount = rules
    .filter((rule) => rule.category === 'fixed_expense')
    .reduce((sum, rule) => sum + normalizeNumber(rule.value), 0);

  const creditCardAmount = rules
    .filter((rule) => rule.category === 'credit_card')
    .reduce((sum, rule) => sum + normalizeNumber(rule.value), 0);

  const savingsAmount = currentPayPeriod
    ? rules
        .filter((rule) => rule.category === 'savings')
        .reduce((sum, rule) => {
          if (rule.rule_type === 'percentage') {
            return sum + (normalizeNumber(currentPayPeriod.income_amount) * normalizeNumber(rule.value)) / 100;
          }

          return sum + normalizeNumber(rule.value);
        }, 0)
    : 0;

  const upcomingPayments = [
    ...recurringItems.map((item) => ({
      id: item.id,
      name: item.name,
      amount: normalizeNumber(item.amount),
      dueDate: item.next_due_date,
    })),
    ...creditCards
      .filter((card) => card.due_date)
      .map((card) => ({
        id: card.id,
        name: accountMap.get(card.account_id)?.name ?? 'Tarjeta de crédito',
        amount: normalizeNumber(card.due_amount),
        dueDate: card.due_date!,
      })),
  ]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  return {
    availableBalance,
    currentPayPeriod,
    fixedExpensesAmount,
    creditCardAmount,
    savingsAmount,
    upcomingPayments,
    accounts: accounts.map((account) => ({
      ...account,
      current_balance: normalizeNumber(account.current_balance),
    })),
    rules: rules.map((rule) => ({
      ...rule,
      value: normalizeNumber(rule.value),
    })),
  };
}
