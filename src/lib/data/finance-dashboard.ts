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
  recurrence_type: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  next_due_date: string;
  reminder_days_before: number;
  linked_rule_category: 'fixed_expense' | 'credit_card' | 'savings' | null;
  is_active?: boolean;
};

export type CreditCardRecord = {
  id: string;
  account_id: string;
  due_amount: number;
  due_date: string | null;
  minimum_payment: number | null;
};

export type SavingsGoalRecord = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  is_active: boolean;
};

export type AccountWithDetails = AccountRecord & {
  due_amount?: number;
  due_date?: string | null;
  minimum_payment?: number | null;
};

function normalizeNumber(value: number | string | null | undefined) {
  return Number(value ?? 0);
}

async function runQuery<T>(query: {
  then: (
    onfulfilled: (value: { data: T[] | null; error: unknown }) => unknown,
    onrejected?: (reason: unknown) => unknown
  ) => unknown;
}) {
  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function getBaseFinanceData() {
  const client = getInsforgeClient();

  const [accounts, payPeriods, rules, recurringItems, creditCards, savingsGoals] =
    await Promise.all([
      runQuery<AccountRecord>(
        client.database
          .from('accounts')
          .select('id, name, type, current_balance')
          .eq('is_active', true)
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
          .select(
            'id, name, amount, recurrence_type, next_due_date, reminder_days_before, linked_rule_category, is_active'
          )
          .eq('is_active', true)
          .order('next_due_date', { ascending: true })
      ),
      runQuery<CreditCardRecord>(
        client.database
          .from('credit_cards')
          .select('id, account_id, due_amount, due_date, minimum_payment')
          .order('due_date', { ascending: true })
      ),
      runQuery<SavingsGoalRecord>(
        client.database
          .from('savings_goals')
          .select('id, name, target_amount, current_amount, target_date, is_active')
          .eq('is_active', true)
          .order('created_at', { ascending: true })
      ),
    ]);

  return {
    accounts: accounts.map((account) => ({
      ...account,
      current_balance: normalizeNumber(account.current_balance),
    })),
    payPeriods: payPeriods.map((payPeriod) => ({
      ...payPeriod,
      income_amount: normalizeNumber(payPeriod.income_amount),
      free_amount: normalizeNumber(payPeriod.free_amount),
    })),
    rules: rules.map((rule) => ({
      ...rule,
      value: normalizeNumber(rule.value),
    })),
    recurringItems: recurringItems.map((item) => ({
      ...item,
      amount: normalizeNumber(item.amount),
      reminder_days_before: normalizeNumber(item.reminder_days_before),
    })),
    creditCards: creditCards.map((card) => ({
      ...card,
      due_amount: normalizeNumber(card.due_amount),
      minimum_payment: normalizeNumber(card.minimum_payment),
    })),
    savingsGoals: savingsGoals.map((goal) => ({
      ...goal,
      target_amount: normalizeNumber(goal.target_amount),
      current_amount: normalizeNumber(goal.current_amount),
    })),
  };
}

export async function getDashboardData() {
  const { accounts, payPeriods, rules, recurringItems, creditCards } =
    await getBaseFinanceData();

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
            return (
              sum +
              (normalizeNumber(currentPayPeriod.income_amount) * normalizeNumber(rule.value)) /
                100
            );
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
    accounts,
    rules,
  };
}

export async function getAccountsPageData() {
  const { accounts, creditCards } = await getBaseFinanceData();
  const creditCardMap = new Map(creditCards.map((card) => [card.account_id, card]));

  const accountsWithDetails: AccountWithDetails[] = accounts.map((account) => {
    const creditCard = creditCardMap.get(account.id);

    return {
      ...account,
      due_amount: creditCard?.due_amount,
      due_date: creditCard?.due_date ?? null,
      minimum_payment: creditCard?.minimum_payment ?? null,
    };
  });

  const liquidTotal = accountsWithDetails
    .filter((account) => account.type !== 'credit')
    .reduce((sum, account) => sum + normalizeNumber(account.current_balance), 0);

  const debtTotal = accountsWithDetails
    .filter((account) => account.type === 'credit')
    .reduce((sum, account) => sum + Math.abs(normalizeNumber(account.current_balance)), 0);

  const savingsTotal = accountsWithDetails
    .filter((account) => account.type === 'savings')
    .reduce((sum, account) => sum + normalizeNumber(account.current_balance), 0);

  return {
    liquidTotal,
    debtTotal,
    savingsTotal,
    accounts: accountsWithDetails,
  };
}

export async function getGoalsPageData() {
  const { savingsGoals } = await getBaseFinanceData();

  const goals = savingsGoals.map((goal) => {
    const progress = goal.target_amount > 0 ? goal.current_amount / goal.target_amount : 0;
    const progressPercent = Math.max(0, Math.min(100, Math.round(progress * 100)));

    return {
      ...goal,
      progressPercent,
      remainingAmount: Math.max(0, goal.target_amount - goal.current_amount),
    };
  });

  const totalSaved = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const totalTarget = goals.reduce((sum, goal) => sum + goal.target_amount, 0);

  return {
    totalSaved,
    totalTarget,
    goals,
  };
}

export async function getRecurringPageData() {
  const { recurringItems } = await getBaseFinanceData();

  const totalRecurringAmount = recurringItems.reduce(
    (sum, item) => sum + normalizeNumber(item.amount),
    0
  );

  const groupedTotals = recurringItems.reduce(
    (totals, item) => {
      const key = item.linked_rule_category ?? 'other';
      totals[key] = (totals[key] ?? 0) + normalizeNumber(item.amount);
      return totals;
    },
    {} as Record<string, number>
  );

  return {
    totalRecurringAmount,
    itemsCount: recurringItems.length,
    upcomingCount: recurringItems.filter((item) => Boolean(item.next_due_date)).length,
    groupedTotals,
    recurringItems,
  };
}

export type MovementCategoryRecord = {
  id: string;
  name: string;
  kind: 'expense' | 'income' | 'transfer' | 'credit_payment';
};

export type MovementHistoryRecord = {
  id: string;
  user_id: string;
  pay_period_id: string | null;
  account_id: string | null;
  destination_account_id: string | null;
  type: 'expense' | 'income' | 'credit_payment' | 'transfer';
  amount: number;
  category_id: string | null;
  note: string | null;
  transaction_date: string;
};

export async function getMovementsPageData() {
  const client = getInsforgeClient();

  const [transactions, accounts, categories] = await Promise.all([
    runQuery<MovementHistoryRecord>(
      client.database
        .from('transactions')
        .select(
          'id, user_id, pay_period_id, account_id, destination_account_id, type, amount, category_id, note, transaction_date'
        )
        .order('transaction_date', { ascending: false })
    ),
    runQuery<
      AccountRecord & {
        is_active: boolean;
      }
    >(
      client.database
        .from('accounts')
        .select('id, name, type, current_balance, is_active')
        .order('created_at', { ascending: true })
    ),
    runQuery<MovementCategoryRecord>(
      client.database
        .from('categories')
        .select('id, name, kind')
        .order('kind', { ascending: true })
        .order('name', { ascending: true })
    ),
  ]);

  return {
    transactions: transactions.map((transaction) => ({
      ...transaction,
      amount: normalizeNumber(transaction.amount),
    })),
    accounts: accounts.map((account) => ({
      ...account,
      current_balance: normalizeNumber(account.current_balance),
    })),
    categories,
  };
}
