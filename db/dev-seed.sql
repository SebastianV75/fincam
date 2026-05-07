-- Development seed for Fincam
-- Uses the existing InsForge auth user with email admin@example.com

with dev_user as (
  select id
  from auth.users
  where lower(email) = lower('admin@example.com')
  limit 1
),
inserted_accounts as (
  insert into public.accounts (user_id, name, type, current_balance)
  select id, 'Débito principal', 'debit', 4800.00 from dev_user
  union all
  select id, 'Efectivo', 'cash', 650.00 from dev_user
  union all
  select id, 'Ahorro', 'savings', 5000.00 from dev_user
  union all
  select id, 'TDC Banamex', 'credit', -2300.00 from dev_user
  returning id, user_id, name, type
),
inserted_pay_period as (
  insert into public.pay_periods (
    user_id,
    label,
    start_date,
    end_date,
    income_amount,
    income_received_at,
    status,
    free_amount
  )
  select
    id,
    'Primera quincena de mayo',
    date '2026-05-01',
    date '2026-05-15',
    8000.00,
    date '2026-05-01',
    'open',
    2740.00
  from dev_user
  returning id, user_id
),
inserted_categories as (
  insert into public.categories (user_id, name, kind)
  select id, 'Comida', 'expense' from dev_user
  union all
  select id, 'Transporte', 'expense' from dev_user
  union all
  select id, 'Servicios', 'expense' from dev_user
  union all
  select id, 'Salidas', 'expense' from dev_user
  union all
  select id, 'Quincena', 'income' from dev_user
  union all
  select id, 'Abono TDC', 'credit_payment' from dev_user
  returning id, user_id, name, kind
),
inserted_rules as (
  insert into public.allocation_rules (user_id, category, name, rule_type, value, priority_order)
  select id, 'fixed_expense', 'Renta', 'fixed', 1500.00, 1 from dev_user
  union all
  select id, 'fixed_expense', 'Internet', 'fixed', 500.00, 2 from dev_user
  union all
  select id, 'credit_card', 'TDC Banamex', 'manual', 2300.00, 3 from dev_user
  union all
  select id, 'savings', 'Fondo de emergencia', 'percentage', 12.00, 4 from dev_user
  returning id
),
inserted_recurring as (
  insert into public.recurring_items (
    user_id,
    name,
    amount,
    recurrence_type,
    next_due_date,
    reminder_days_before,
    linked_rule_category
  )
  select id, 'Internet', 500.00, 'monthly', date '2026-05-08', 2, 'fixed_expense' from dev_user
  union all
  select id, 'Spotify', 129.00, 'monthly', date '2026-05-10', 1, 'fixed_expense' from dev_user
  union all
  select id, 'Ahorro fondo', 1000.00, 'biweekly', date '2026-05-15', 0, 'savings' from dev_user
  returning id
),
inserted_goals as (
  insert into public.savings_goals (user_id, name, target_amount, current_amount, target_date)
  select id, 'Fondo de emergencia', 20000.00, 6000.00, date '2026-12-31' from dev_user
  union all
  select id, 'Viaje', 10000.00, 2500.00, date '2026-11-30' from dev_user
  returning id, user_id, name
),
inserted_credit_card as (
  insert into public.credit_cards (account_id, due_amount, due_date, minimum_payment)
  select id, 2300.00, date '2026-05-14', 500.00
  from inserted_accounts
  where type = 'credit'
  returning id
),
inserted_transactions as (
  insert into public.transactions (
    user_id,
    pay_period_id,
    account_id,
    type,
    amount,
    category_id,
    note,
    transaction_date
  )
  select
    pp.user_id,
    pp.id,
    a.id,
    'expense',
    650.00,
    c.id,
    'Supermercado',
    date '2026-05-02'
  from inserted_pay_period pp
  join inserted_accounts a on a.user_id = pp.user_id and a.name = 'TDC Banamex'
  join inserted_categories c on c.user_id = pp.user_id and c.name = 'Comida' and c.kind = 'expense'
  union all
  select
    pp.user_id,
    pp.id,
    a.id,
    'expense',
    900.00,
    c.id,
    'Gasolina',
    date '2026-05-01'
  from inserted_pay_period pp
  join inserted_accounts a on a.user_id = pp.user_id and a.name = 'TDC Banamex'
  join inserted_categories c on c.user_id = pp.user_id and c.name = 'Transporte' and c.kind = 'expense'
  union all
  select
    pp.user_id,
    pp.id,
    a.id,
    'income',
    8000.00,
    c.id,
    'Depósito de quincena',
    date '2026-05-01'
  from inserted_pay_period pp
  join inserted_accounts a on a.user_id = pp.user_id and a.name = 'Débito principal'
  join inserted_categories c on c.user_id = pp.user_id and c.name = 'Quincena' and c.kind = 'income'
  returning id
),
inserted_cc_payments as (
  insert into public.credit_card_payments (credit_card_id, pay_period_id, amount, payment_date, note)
  select cc.id, pp.id, 800.00, date '2026-04-30', 'Abono previo'
  from inserted_credit_card cc
  cross join inserted_pay_period pp
  union all
  select cc.id, pp.id, 1000.00, date '2026-04-15', 'Abono previo'
  from inserted_credit_card cc
  cross join inserted_pay_period pp
  returning id
)
select
  (select count(*) from inserted_accounts) as accounts_created,
  (select count(*) from inserted_categories) as categories_created,
  (select count(*) from inserted_rules) as rules_created,
  (select count(*) from inserted_recurring) as recurring_created,
  (select count(*) from inserted_goals) as goals_created,
  (select count(*) from inserted_transactions) as transactions_created,
  (select count(*) from inserted_cc_payments) as credit_card_payments_created;
