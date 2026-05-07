-- Fincam initial schema
-- Prepared for InsForge/PostgreSQL
-- Scope: simple MVP foundation only

create extension if not exists pgcrypto;

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('debit', 'credit', 'cash', 'savings')),
  current_balance numeric(12, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pay_periods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  start_date date not null,
  end_date date not null,
  income_amount numeric(12, 2) not null default 0,
  income_received_at date,
  status text not null default 'open' check (status in ('open', 'closed')),
  free_amount numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pay_period_dates_valid check (end_date >= start_date)
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('expense', 'income', 'transfer', 'credit_payment')),
  created_at timestamptz not null default now(),
  unique (user_id, name, kind)
);

create table if not exists public.allocation_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null check (category in ('fixed_expense', 'credit_card', 'savings')),
  name text not null,
  rule_type text not null check (rule_type in ('fixed', 'percentage', 'manual')),
  value numeric(12, 2) not null,
  priority_order integer not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recurring_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric(12, 2) not null,
  recurrence_type text not null check (recurrence_type in ('weekly', 'biweekly', 'monthly', 'custom')),
  next_due_date date not null,
  reminder_days_before integer not null default 0,
  linked_rule_category text check (linked_rule_category in ('fixed_expense', 'credit_card', 'savings')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(12, 2) not null,
  current_amount numeric(12, 2) not null default 0,
  target_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references public.accounts(id) on delete cascade,
  due_amount numeric(12, 2) not null default 0,
  due_date date,
  minimum_payment numeric(12, 2),
  last_updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pay_period_id uuid references public.pay_periods(id) on delete set null,
  account_id uuid references public.accounts(id) on delete set null,
  type text not null check (type in ('expense', 'income', 'credit_payment', 'transfer')),
  amount numeric(12, 2) not null check (amount >= 0),
  category_id uuid references public.categories(id) on delete set null,
  note text,
  transaction_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_card_payments (
  id uuid primary key default gen_random_uuid(),
  credit_card_id uuid not null references public.credit_cards(id) on delete cascade,
  pay_period_id uuid references public.pay_periods(id) on delete set null,
  amount numeric(12, 2) not null check (amount >= 0),
  payment_date date not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goal_contributions (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.savings_goals(id) on delete cascade,
  pay_period_id uuid references public.pay_periods(id) on delete set null,
  amount numeric(12, 2) not null check (amount >= 0),
  contribution_date date not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_accounts_user_id on public.accounts(user_id);
create index if not exists idx_pay_periods_user_id on public.pay_periods(user_id);
create index if not exists idx_transactions_user_id on public.transactions(user_id);
create index if not exists idx_transactions_pay_period_id on public.transactions(pay_period_id);
create index if not exists idx_transactions_account_id on public.transactions(account_id);
create index if not exists idx_categories_user_id on public.categories(user_id);
create index if not exists idx_allocation_rules_user_id on public.allocation_rules(user_id);
create index if not exists idx_recurring_items_user_id on public.recurring_items(user_id);
create index if not exists idx_savings_goals_user_id on public.savings_goals(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_accounts_updated_at on public.accounts;
create trigger trg_accounts_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

drop trigger if exists trg_pay_periods_updated_at on public.pay_periods;
create trigger trg_pay_periods_updated_at
before update on public.pay_periods
for each row execute function public.set_updated_at();

drop trigger if exists trg_allocation_rules_updated_at on public.allocation_rules;
create trigger trg_allocation_rules_updated_at
before update on public.allocation_rules
for each row execute function public.set_updated_at();

drop trigger if exists trg_recurring_items_updated_at on public.recurring_items;
create trigger trg_recurring_items_updated_at
before update on public.recurring_items
for each row execute function public.set_updated_at();

drop trigger if exists trg_savings_goals_updated_at on public.savings_goals;
create trigger trg_savings_goals_updated_at
before update on public.savings_goals
for each row execute function public.set_updated_at();

drop trigger if exists trg_credit_cards_updated_at on public.credit_cards;
create trigger trg_credit_cards_updated_at
before update on public.credit_cards
for each row execute function public.set_updated_at();

drop trigger if exists trg_transactions_updated_at on public.transactions;
create trigger trg_transactions_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

drop trigger if exists trg_credit_card_payments_updated_at on public.credit_card_payments;
create trigger trg_credit_card_payments_updated_at
before update on public.credit_card_payments
for each row execute function public.set_updated_at();
