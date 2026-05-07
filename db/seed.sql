-- Fincam sample seed
-- Replace the auth user UUID before running.

-- Example:
-- \set user_id '00000000-0000-0000-0000-000000000000'

insert into public.accounts (user_id, name, type, current_balance)
values
  (:'user_id', 'Débito principal', 'debit', 4800.00),
  (:'user_id', 'Efectivo', 'cash', 650.00),
  (:'user_id', 'Ahorro', 'savings', 5000.00),
  (:'user_id', 'TDC Banamex', 'credit', -2300.00);

insert into public.pay_periods (user_id, label, start_date, end_date, income_amount, income_received_at, status, free_amount)
values
  (:'user_id', 'Primera quincena de mayo', '2026-05-01', '2026-05-15', 8000.00, '2026-05-01', 'open', 1750.00);

insert into public.categories (user_id, name, kind)
values
  (:'user_id', 'Comida', 'expense'),
  (:'user_id', 'Transporte', 'expense'),
  (:'user_id', 'Servicios', 'expense'),
  (:'user_id', 'Salidas', 'expense'),
  (:'user_id', 'Quincena', 'income'),
  (:'user_id', 'Abono TDC', 'credit_payment');

insert into public.allocation_rules (user_id, category, name, rule_type, value, priority_order)
values
  (:'user_id', 'fixed_expense', 'Renta', 'fixed', 1500.00, 1),
  (:'user_id', 'fixed_expense', 'Internet', 'fixed', 500.00, 2),
  (:'user_id', 'credit_card', 'TDC Banamex', 'manual', 2300.00, 3),
  (:'user_id', 'savings', 'Fondo de emergencia', 'percentage', 12.00, 4);

insert into public.recurring_items (user_id, name, amount, recurrence_type, next_due_date, reminder_days_before, linked_rule_category)
values
  (:'user_id', 'Internet', 500.00, 'monthly', '2026-05-08', 2, 'fixed_expense'),
  (:'user_id', 'Spotify', 129.00, 'monthly', '2026-05-10', 1, 'fixed_expense'),
  (:'user_id', 'Ahorro fondo', 1000.00, 'biweekly', '2026-05-15', 0, 'savings');

insert into public.savings_goals (user_id, name, target_amount, current_amount, target_date)
values
  (:'user_id', 'Fondo de emergencia', 20000.00, 6000.00, '2026-12-31'),
  (:'user_id', 'Viaje', 10000.00, 2500.00, '2026-11-30');
