# Detailed Mockups

## Scope

This document defines high-detail MVP mockups for the two most important screens:

1. Home
2. Quincena

The goal is to make the UI direction concrete enough to start design or implementation without ambiguity.

## Product Feel

The product should feel:

- calm,
- intentional,
- personal,
- trustworthy,
- lightweight,
- financially clear without feeling intimidating.

Reference vibe:

- Notion-like simplicity,
- soft editorial spacing,
- restrained color use,
- very little visual noise.

## Visual System

### Color Direction

Use a warm neutral base with olive accents.

- Background: warm off-white
- Surface: soft ivory / very light stone
- Border: light gray-beige
- Primary text: charcoal
- Secondary text: muted gray-brown
- Accent: olive green
- Accent soft: pale sage
- Danger/debt: muted clay red

Suggested token direction:

- `bg-app`: `#F6F4EE`
- `bg-card`: `#FBFAF7`
- `border-soft`: `#E7E2D8`
- `text-strong`: `#2F312B`
- `text-muted`: `#6E7168`
- `olive-500`: `#6F7C4F`
- `olive-200`: `#DCE3CF`
- `danger-400`: `#B96A5E`

### Typography Direction

Keep it clean and understated.

- Headings: elegant sans or humanist sans
- Body: neutral sans
- Money amounts: slightly tighter, larger, high-contrast

Suggested hierarchy:

- Screen title: 24-28px semibold
- Main money number: 34-40px semibold
- Card title: 15-16px medium
- Body text: 14-15px regular
- Secondary labels: 12-13px medium

### Spacing Direction

- outer mobile padding: 20px
- card padding: 16px to 18px
- section gap: 16px
- card radius: 18px to 22px
- button radius: 14px to 16px

### Shadow / Depth

Very subtle.

- thin borders first,
- soft shadows only where necessary,
- no heavy floating UI.

## Screen 1: Home

### Main Job

Tell the user, within 5 seconds:

- how much money is truly available,
- how the current quincena is going,
- what is already committed,
- what needs attention next.

### Mobile Layout Structure

```text
[ Safe top space ]

Header
Main available balance card
Quick actions row
Current quincena card
Upcoming payments card
Distribution card
Accounts preview card

[ Bottom nav ]
```

### Mobile Mockup Detailed

```text
+--------------------------------------------------+
| 9:41                                         ... |
|                                                  |
| Hola, Camila                           [profile] |
| Miercoles, 6 de mayo                             |
|                                                  |
| +----------------------------------------------+ |
| | Tu dinero disponible                          | |
| |                                               | |
| | $12,450                                       | |
| | Lo que puedes usar sin afectar lo asignado    | |
| |                                               | |
| | Quincena actual: estable                      | |
| | [olive pill]                                  | |
| +----------------------------------------------+ |
|                                                  |
| +----------------+  +--------------------------+ |
| | Registrar gasto|  | Registrar abono TDC      | |
| +----------------+  +--------------------------+ |
|                                                  |
| +----------------------------------------------+ |
| | Quincena actual                              | |
| | 1 May - 15 May                               | |
| |                                               | |
| | Ingreso            $8,000                    | |
| | Asignado           $6,250                    | |
| | Libre restante     $1,750                    | |
| |                                               | |
| | [Ver plan de quincena]                       | |
| +----------------------------------------------+ |
|                                                  |
| +----------------------------------------------+ |
| | Proximos pagos                               | |
| |                                               | |
| | Internet               08 May      $500      | |
| | Spotify                10 May      $129      | |
| | TDC Banamex            14 May      $2,300    | |
| |                                               | |
| | [Ver todos]                                  | |
| +----------------------------------------------+ |
|                                                  |
| +----------------------------------------------+ |
| | Distribucion de esta quincena                | |
| |                                               | |
| | Pagos fijos                     $2,100        | |
| | TDC                             $2,300        | |
| | Ahorro                          $1,000        | |
| | Libre                           $1,750        | |
| |                                               | |
| | [mini stacked bar visual]                     | |
| +----------------------------------------------+ |
|                                                  |
| +----------------------------------------------+ |
| | Cuentas                                       | |
| | Debito principal                $4,800        | |
| | Efectivo                        $650          | |
| | Ahorro                          $5,000        | |
| | TDC Banamex                     -$2,300       | |
| |                                               | |
| | [Ver cuentas]                                 | |
| +----------------------------------------------+ |
|                                                  |
+--------------------------------------------------+
| Home | Quincena | + | Cuentas | Metas           |
+--------------------------------------------------+
```

### Home Visual Hierarchy

#### 1. Main Balance Card

This is the hero section.

Content:

- label: `Tu dinero disponible`
- large amount
- one-line explanation
- optional status chip

Behavior:

- amount should be visually dominant,
- explanatory line should reduce confusion about what the number means,
- chip can reflect state like `Estable`, `Justa`, `Apretada`.

Style:

- slightly tinted ivory card,
- olive accent line or dot,
- calm typography,
- no strong gradients.

#### 2. Quick Actions

Two actions only:

- `Registrar gasto`
- `Registrar abono TDC`

Optional third later:

- `Agregar ingreso`

Style:

- one primary filled olive button,
- one secondary outlined button.

#### 3. Quincena Summary Card

Purpose:

- connect daily use to the pay period plan.

Should show:

- dates,
- paycheck amount,
- total assigned,
- free balance left.

The CTA should clearly lead to deeper planning.

#### 4. Upcoming Payments

Purpose:

- answer “what is coming next?”

Rows should contain:

- item name,
- due date,
- amount.

If an item is near due:

- highlight the row with a soft olive or muted warm tint,
- never use alarming red unless overdue.

#### 5. Distribution Card

Purpose:

- make the allocation feel tangible and trustworthy.

Best presentation:

- 4 clean rows,
- one small stacked progress bar underneath,
- each segment uses restrained color variation.

#### 6. Accounts Preview

Purpose:

- allow quick overview without forcing detailed accounting.

Important:

- debit and cash feel positive,
- credit card should be visually distinct as debt, but not aggressive.

### Home Mobile Interaction Notes

- tapping the main balance card can optionally open a short explanation modal later,
- quick actions should be reachable with the thumb,
- scrolling should feel calm and card-based,
- avoid carousels.

### Home Empty / Early State

When the user has not created their first quincena yet:

```text
+----------------------------------------------+
| Tu dinero disponible                         |
| $0                                            |
| Aun no has configurado tu primera quincena   |
| [ Crear mi primera quincena ]                |
+----------------------------------------------+
```

This must feel encouraging, not broken.

### Home Desktop Adaptation

Recommended layout:

```text
+---------------------------------------------------------------+
| Sidebar        | Main content                    | Right rail |
+---------------------------------------------------------------+
```

Main content:

- hero balance card full width,
- 2-column grid below.

Left column:

- quincena summary,
- distribution.

Right column:

- upcoming payments,
- accounts preview.

Desktop should feel spacious, not stretched.

## Screen 2: Quincena

### Main Job

Help the user understand and manage the current pay period plan with clarity and control.

### Mobile Layout Structure

```text
[ Header ]
Current period summary
Income card
Allocation breakdown
Allocation rules
Manual adjustment action
Past pay periods preview
```

### Mobile Mockup Detailed

```text
+--------------------------------------------------+
| Quincena                                         |
| 1 May - 15 May                                   |
|                                                  |
| +----------------------------------------------+ |
| | Ingreso recibido                              | |
| |                                               | |
| | $8,000                                        | |
| | Depositado el 1 May                           | |
| +----------------------------------------------+ |
|                                                  |
| +----------------------------------------------+ |
| | Orden automatico                              | |
| | 1. Pagos fijos                                | |
| | 2. TDC                                        | |
| | 3. Ahorro                                     | |
| | 4. Libre                                      | |
| +----------------------------------------------+ |
|                                                  |
| +----------------------------------------------+ |
| | Distribucion                                  | |
| |                                               | |
| | Pagos fijos                     $2,100        | |
| | TDC                             $2,300        | |
| | Ahorro                          $1,000        | |
| | Libre                           $2,600        | |
| |                                               | |
| | [stacked allocation bar]                      | |
| |                                               | |
| | [ Recalcular ] [ Ajustar ]                    | |
| +----------------------------------------------+ |
|                                                  |
| +----------------------------------------------+ |
| | Reglas activas                                | |
| |                                               | |
| | Renta                fijo         $1,500      | |
| | Internet             fijo         $500        | |
| | TDC Banamex          manual       $2,300      | |
| | Fondo emergencia     porcentaje   12%         | |
| |                                               | |
| | [ Editar reglas ]                             | |
| +----------------------------------------------+ |
|                                                  |
| +----------------------------------------------+ |
| | Resultado                                     | |
| |                                               | |
| | Dinero libre para esta quincena               | |
| | $2,600                                        | |
| |                                               | |
| | Ya asignaste pagos, TDC y ahorro antes        | |
| | de gastar                                     | |
| +----------------------------------------------+ |
|                                                  |
| +----------------------------------------------+ |
| | Quincenas pasadas                             | |
| | 16 Abr - 30 Abr       Libre final   $1,200    | |
| | 01 Abr - 15 Abr       Libre final   $900      | |
| | [ Ver historial ]                             | |
| +----------------------------------------------+ |
+--------------------------------------------------+
```

### Quincena Visual Hierarchy

#### 1. Income Card

This sets the starting point for the whole period.

Must show:

- total income,
- receive date,
- optional edit action later.

The card should feel stable and definitive.

#### 2. Allocation Order Card

Purpose:

- reinforce the product’s planning logic.

This card is simple but important because it makes the system understandable.

#### 3. Distribution Card

This is the central component on the screen.

Must show:

- every top-level bucket,
- exact assigned amount,
- visual distribution,
- actions to recalculate or adjust.

Interaction:

- `Recalcular` applies rules again,
- `Ajustar` opens a lightweight edit sheet.

#### 4. Rules Card

Purpose:

- make the logic transparent.

The user should always be able to understand why the system allocated money the way it did.

Recommended row pattern:

- label,
- mode tag (`fijo`, `%`, `manual`),
- value.

#### 5. Result Card

Purpose:

- emotionally reassure the user.

This is where the app says:

- your money has a plan,
- this is what is truly free to use.

This card should be clean, warm, and confidence-building.

### Quincena States

#### State A: Before Income Is Added

```text
+----------------------------------------------+
| Quincena                                     |
| Aun no registras el ingreso de este periodo  |
| [ Registrar ingreso ]                        |
+----------------------------------------------+
```

#### State B: Fully Planned

- show all cards,
- `Resultado` card highlighted,
- quick sense of control.

#### State C: Income Too Tight

If fixed bills + TDC + savings exceed the paycheck:

- show a soft warning card,
- indicate shortfall amount,
- offer `Ajustar reglas`.

Example:

```text
+----------------------------------------------+
| Esta quincena esta justa                      |
| Te faltan $650 para cubrir todo lo asignado  |
| [ Ajustar reglas ]                           |
+----------------------------------------------+
```

Use warm muted tones, not aggressive error styling.

### Quincena Desktop Adaptation

Recommended layout:

- left column: income, order, distribution
- right column: rules, result, history

This creates a natural flow from input to outcome.

## Shared Components Spec

### 1. Money Summary Card

Use for:

- available balance,
- free amount,
- income,
- debt total.

Rules:

- one key amount per card,
- one explanatory label,
- optional status chip,
- avoid mixing too many numbers in one hero card.

### 2. Section Card

Use for:

- upcoming payments,
- rules,
- accounts preview,
- history preview.

Structure:

- title,
- content rows,
- optional footer CTA.

### 3. Row Item

Structure:

- left: label + optional sublabel,
- right: amount or date + amount.

Rows must be highly legible and evenly spaced.

### 4. Status Chip

Examples:

- `Estable`
- `Pendiente`
- `Por vencer`
- `Ajustar`

Style:

- small pill,
- muted background,
- medium text weight.

## Copy Direction

The product copy should sound:

- clear,
- calm,
- direct,
- quietly helpful.

Preferred copy examples:

- `Tu dinero disponible`
- `Ya asignaste lo importante antes de gastar`
- `Quincena actual`
- `Libre restante`
- `Proximos pagos`

Avoid:

- corporate financial jargon,
- overly cheerful gamification language,
- alarmist debt messaging.

## Implementation Priorities

If building these two screens first, do this order:

1. app shell and navigation
2. Home hero balance card
3. Home quincena summary
4. Quincena distribution card
5. reusable card and row components
6. desktop responsive layout pass

## Recommended Next Step

After this document, the best next move is:

1. create a mini design system spec,
2. or start coding the mobile-first `Home` and `Quincena` screens directly.

For speed, coding these screens directly is a good option now because the structure is already concrete.
