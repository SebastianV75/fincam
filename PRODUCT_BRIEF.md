# Personal Finance Planner

## Product Summary

Web app mobile-first for iPhone, also usable on laptop, focused on organizing each paycheck period ("quincena") in a simple and tangible way.

The app helps the user:

- know where their money is going,
- automatically assign each paycheck,
- track daily spending quickly,
- manage debit, credit, cash, and savings balances,
- monitor recurring expenses,
- follow savings goals,
- review previous pay periods.

## Core Product Goal

Give the user a clear and calm system to answer:

- How much money do I actually have available?
- How much is already committed?
- How much should go to fixed bills, credit card, savings, and free spending?
- How did I use my money in past pay periods?

## Primary User

Single personal user in Mexico.

Profile:

- receives income mostly every 15 days,
- income is usually fixed,
- wants simple manual expense capture,
- uses debit, credit, cash, and savings,
- wants planning more than deep accounting.

## Platform Recommendation

Start with a web app optimized for iPhone and responsive for laptop.

Why:

- faster to build,
- lower complexity than native iOS,
- easy to validate product logic,
- enough for daily manual capture,
- still works comfortably on desktop.

## Design Direction

Principles:

- simple,
- clear,
- practical,
- calm,
- mobile-first,
- minimal friction for daily use.

Visual style:

- Notion-inspired cleanliness,
- soft neutral backgrounds,
- subtle olive green accents,
- understated cards,
- generous spacing,
- clear hierarchy,
- low visual noise.

## Main Product Flows

### 1. Start a New Pay Period

When income arrives, the user records the paycheck amount.  
The app distributes the money automatically in this fixed order:

1. fixed recurring payments
2. credit card payment
3. savings
4. free spending

The user can configure each allocation as:

- fixed amount,
- percentage,
- or a mix depending on the item.

### 2. Daily Capture

The user quickly logs:

- expense,
- income,
- credit card payment,
- transfer between accounts.

The flow should require as few taps as possible.

### 3. Ongoing Visibility

The dashboard shows:

- available balance,
- current pay period status,
- allocated savings,
- pending credit card amount,
- upcoming recurring payments,
- free money left.

### 4. Historical Review

Each pay period can be closed and kept as a historical snapshot so the user can review how money was used over time.

## MVP Scope

### Included

#### Dashboard

- available balance,
- current pay period summary,
- total across accounts,
- savings set aside,
- credit card amount due,
- upcoming recurring payments,
- free spending remaining.

#### Pay Period Planning

- create a pay period,
- enter paycheck amount,
- apply automatic allocation,
- support allocation by fixed amount or percentage,
- show clear breakdown of assigned money.

#### Quick Transaction Logging

- add expense,
- add income,
- add credit card payment,
- add transfer,
- assign category,
- optionally assign source account.

#### Accounts

- debit,
- credit,
- cash,
- savings,
- summary first,
- detail view second.

#### Credit Card Tracking

- total amount due,
- due date,
- payments made,
- payment history.

#### Recurring Items

- services,
- subscriptions,
- savings contributions,
- credit card due reminders,
- bill reminders before due date.

#### Savings Goals

- create goal,
- target amount,
- progress tracking,
- manual or automatic contribution.

#### Historical Pay Periods

- closed pay periods,
- summary by period,
- amount received,
- amount spent,
- amount saved,
- amount paid to credit card.

### Not Included in MVP

- bank integrations,
- automatic transaction import,
- advanced analytics,
- predictive projections,
- category budgets with complex logic,
- multi-user support,
- advanced notifications beyond simple reminders,
- widgets,
- complex offline-first syncing.

## Information Architecture

### Main Navigation

1. Home
2. Pay Period
3. Add
4. Accounts
5. Goals

Secondary views can live inside sections:

- credit card details,
- recurring items,
- settings,
- history.

## Screen Outline

### Home

Top priorities:

- available balance,
- current pay period card,
- money already assigned,
- next payments,
- quick add action.

### Pay Period

- current paycheck,
- auto-allocation breakdown,
- allocation rules,
- closed periods history.

### Add Transaction

- movement type selector,
- amount,
- category,
- date,
- optional account,
- notes if needed.

### Accounts

- all accounts overview,
- total balance summary,
- per-account details.

### Credit Card

- amount due,
- due date,
- recent payments,
- payment history.

### Goals

- active goals,
- progress bars,
- contribution actions.

### Settings

- allocation rules,
- categories,
- recurring payments,
- reminder settings,
- account management.

## Core Business Rules

### Allocation Order

Every new pay period uses this order:

1. fixed recurring payments
2. credit card
3. savings
4. free spending

### Available Balance

Available balance should represent money the user can still spend freely, not the full raw sum of all money across accounts.

### Closed Period Snapshot

Once a pay period is closed, its summary should remain stable for historical review.

### Manual First

All core features should work well without bank syncing.

### Lightweight Data Entry

The product should always prefer speed and clarity over detailed accounting complexity.

## Suggested Data Model

Main entities:

- User
- Account
- PayPeriod
- AllocationRule
- Transaction
- Category
- RecurringItem
- CreditCardAccount
- CreditCardPayment
- SavingsGoal
- GoalContribution

## Recommended Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS

### Backend / Data

- Supabase
- PostgreSQL
- Supabase Auth if login is needed

Why this stack:

- fast to launch,
- simple deployment,
- good developer speed,
- enough structure without overengineering.

## MVP Roadmap

### Phase 1: Foundation

- set up project
- define design tokens
- create responsive app shell
- create database schema
- add seed/demo data

### Phase 2: Core Money Flow

- accounts
- pay periods
- allocation rules
- automatic paycheck distribution
- dashboard summary

### Phase 3: Daily Usage

- quick transaction entry
- categories
- account balances update
- transaction list/history

### Phase 4: Planning and Tracking

- recurring items
- credit card details
- savings goals
- closed pay period history

### Phase 5: Polish

- reminder UX
- empty states
- onboarding
- responsive refinements for laptop
- visual cleanup

## Success Criteria For MVP

The MVP is successful if the user can:

- create and manage accounts,
- start a new pay period with a paycheck,
- automatically allocate that paycheck,
- record daily expenses quickly,
- see how much money is still free to use,
- track credit card due amount and date,
- review previous pay periods,
- manage savings goals without confusion.

## Build Priorities

If time is tight, build in this order:

1. pay periods
2. automatic allocation
3. dashboard
4. transaction logging
5. accounts
6. credit card tracking
7. recurring items
8. savings goals
9. historical periods

## Open Decisions For Later

- whether reminders are in-app only or email/push too,
- whether free spending should later support sub-buckets,
- whether category reports are needed,
- whether the app should become installable as a PWA,
- whether future versions should support multiple credit cards.
