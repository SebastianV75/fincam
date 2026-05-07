# Fincam Technical Plan

## Goal

Build Fincam as a simple, mobile-first personal finance web app for iPhone that also works well on laptop, without overengineering.

The technical approach should optimize for:

- fast iteration,
- simple deployment,
- low maintenance,
- clear business logic,
- easy future expansion.

## Final Stack

### App

- Next.js
- TypeScript
- Tailwind CSS

### Backend Platform

- InsForge end-to-end

Use InsForge for:

- Postgres database
- auth
- storage only if needed later
- deployment

### Recommended Extras

- Zod for validation
- date-fns for date handling
- Lucide icons for a clean UI set

## Why This Stack

This stack keeps everything inside one app and avoids unnecessary infrastructure.

What we are intentionally not doing:

- no separate backend service
- no microservices
- no Redux or heavy state management
- no real-time features in MVP
- no complex syncing logic
- no bank integrations yet

## Architecture

## High-Level Shape

Use a simple monolith:

- one Next.js app
- one database
- one deployment platform
- business logic inside the app

### Layers

1. `UI layer`
   - screens
   - reusable components
   - forms

2. `feature layer`
   - pay periods
   - transactions
   - accounts
   - goals
   - recurring items

3. `business logic layer`
   - allocation rules
   - available balance calculation
   - pay period summary calculation
   - credit card calculations

4. `data access layer`
   - InsForge database queries
   - auth/session helpers

## App Structure

Recommended folder structure:

```txt
src/
  app/
    (app)/
      page.tsx
      quincena/
        page.tsx
      cuentas/
        page.tsx
      metas/
        page.tsx
      agregar/
        page.tsx
      layout.tsx
    api/
    layout.tsx
    globals.css
  components/
    ui/
    layout/
    finance/
  features/
    accounts/
    credit-card/
    goals/
    home/
    pay-periods/
    recurring/
    transactions/
  lib/
    auth/
    db/
    finance/
    utils/
    validations/
  types/
```

## Routing Strategy

Keep routing very small and obvious:

- `/` -> Home
- `/quincena` -> current pay period
- `/cuentas` -> accounts overview
- `/metas` -> savings goals
- `/agregar` -> add movement flow

Later:

- `/cuentas/[id]`
- `/historial`
- `/recurrentes`
- `/tdc/[id]`

## Rendering Strategy

Use mostly server-rendered pages with client components only where interaction needs them.

### Prefer

- Server Components for page data loading
- Server Actions for create/update forms if InsForge flow allows it cleanly
- Route Handlers only where an API endpoint is truly useful

### Avoid

- turning everything into client-side state
- fetching the same data in many places
- building a separate frontend API layer unless necessary

## State Management

Keep state management minimal.

### Use

- local component state for forms and UI controls
- server state from database as the source of truth

### Avoid at first

- Redux
- Zustand unless we discover a clear need
- React Query unless the app becomes much more interactive later

For MVP, plain React state plus server refresh is enough.

## Auth Strategy

Keep auth simple.

### Phase 1

- optional simple email/password or magic link through InsForge
- can even start with one seeded development user while building

### Rule

Do not let auth complexity block product development.

## Data Model

Keep the schema small and practical.

## Core Tables

### users

- id
- name
- email
- currency
- created_at

### accounts

- id
- user_id
- name
- type (`debit`, `credit`, `cash`, `savings`)
- current_balance
- is_active
- created_at

### pay_periods

- id
- user_id
- label
- start_date
- end_date
- income_amount
- income_received_at
- status (`open`, `closed`)
- free_amount
- created_at

### allocation_rules

- id
- user_id
- category
- name
- rule_type (`fixed`, `percentage`, `manual`)
- value
- priority_order
- is_active

### transactions

- id
- user_id
- pay_period_id
- account_id
- type (`expense`, `income`, `credit_payment`, `transfer`)
- amount
- category_id
- note
- transaction_date
- created_at

### categories

- id
- user_id
- name
- kind (`expense`, `income`, `transfer`, `credit_payment`)

### recurring_items

- id
- user_id
- name
- amount
- recurrence_type
- next_due_date
- reminder_days_before
- linked_rule_category
- is_active

### savings_goals

- id
- user_id
- name
- target_amount
- current_amount
- target_date
- is_active

### credit_cards

- id
- account_id
- due_amount
- due_date
- minimum_payment
- last_updated_at

### credit_card_payments

- id
- credit_card_id
- pay_period_id
- amount
- payment_date
- note

## Business Logic Modules

Keep money logic in dedicated files.

Recommended files:

```txt
src/lib/finance/
  allocate-paycheck.ts
  calculate-available-balance.ts
  calculate-pay-period-summary.ts
  calculate-account-totals.ts
  close-pay-period.ts
```

### Most Important Rules

#### 1. Paycheck Allocation Order

Always allocate in this order:

1. fixed recurring payments
2. credit card
3. savings
4. free spending

#### 2. Available Balance

Available balance is not raw total cash.

It should represent money that is still free to spend after assigned obligations.

#### 3. Closed Pay Periods

A closed pay period should remain stable as historical data.

## UI Architecture

## Foundation Components

Build these first:

- `AppShell`
- `BottomNav`
- `PageHeader`
- `MoneyHeroCard`
- `SectionCard`
- `SummaryRow`
- `PrimaryButton`
- `SecondaryButton`
- `TextInput`
- `StatusChip`
- `AllocationBar`

## Feature Screens to Build First

### Phase 1 UI

1. Home
2. Quincena

### Phase 2 UI

3. Add Transaction
4. Accounts
5. Credit Card Detail

### Phase 3 UI

6. Goals
7. Recurring Items
8. History

## Form Strategy

Keep forms very straightforward.

### Use

- small forms
- inline validation
- one main action per screen
- native inputs where possible

### Avoid

- multi-step wizards unless clearly needed
- large modal-heavy flows

## Error Handling

Keep error handling human and lightweight.

### Patterns

- inline field errors
- small toast for save success/failure
- empty states with one clear CTA

No heavy system-style error language.

## Deployment Strategy

Use InsForge deployment for the app.

### Environment Setup

Keep environment variables minimal:

- database URL
- auth keys/secrets
- app URL

### Environments

At minimum:

- local
- production

Only add staging if it becomes necessary later.

## Implementation Roadmap

## Step 1: Project Setup

- scaffold Next.js with TypeScript and Tailwind
- wire global styles
- add design tokens from `MINI_DESIGN_SYSTEM.md`
- create app shell and base layout

## Step 2: Database Setup

- create initial schema in InsForge
- seed one dev user
- seed sample accounts and a sample pay period

## Step 3: Home and Quincena

- build Home UI
- build Quincena UI
- connect both to real data
- implement paycheck allocation logic

## Step 4: Transaction Flow

- add quick movement form
- persist transactions
- update account balances
- reflect updates on Home and Quincena

## Step 5: Accounts and Credit Card

- accounts overview
- account detail
- credit card due amount and due date
- payment history

## Step 6: Goals and Recurrentes

- savings goals
- recurring items
- reminder-related fields

## Step 7: History

- closing pay periods
- historical summaries
- past period detail

## MVP Success Criteria

The app is ready as an MVP when the user can:

- record their income for a pay period
- automatically distribute that income
- register daily expenses quickly
- understand free spending left
- see upcoming obligations
- track one credit card
- review previous pay periods

## Technical Decisions To Keep Simple

1. One repo only
2. One Next.js app only
3. One database only
4. No advanced state library initially
5. No event system
6. No queue system
7. No analytics pipeline
8. No real-time synchronization in MVP

## Recommended Immediate Next Step

Start the actual codebase with:

1. Next.js scaffold
2. Tailwind setup
3. app shell
4. Home and Quincena static UI

That gives us the fastest visible progress while keeping the architecture clean.
