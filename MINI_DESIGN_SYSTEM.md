# Mini Design System

## Goal

Define a lightweight visual system for the MVP so the product feels consistent, calm, and easy to build.

This system is meant to be:

- simple,
- elegant,
- practical,
- mobile-first,
- implementation-friendly.

## Brand Feel

The app should feel like:

- a personal financial planner,
- calm and trustworthy,
- simple but intentional,
- modern without feeling trendy,
- soft and organized like Notion, but warmer.

## Design Principles

1. Clarity over decoration
2. Available money should always be obvious
3. Every screen should feel breathable
4. Olive is an accent, not the whole interface
5. Debt should be clear, but not visually aggressive
6. Inputs and actions should feel fast on iPhone

## Color System

### Core Palette

- `bg-app`: `#F6F4EE`
- `bg-surface`: `#FBFAF7`
- `bg-soft`: `#F1EEE6`
- `border-soft`: `#E7E2D8`
- `border-strong`: `#D7D0C2`
- `text-strong`: `#2F312B`
- `text-body`: `#4C4F47`
- `text-muted`: `#6E7168`
- `olive-600`: `#5F6D43`
- `olive-500`: `#6F7C4F`
- `olive-300`: `#B8C39C`
- `olive-200`: `#DCE3CF`
- `olive-100`: `#EEF2E5`
- `danger-500`: `#A85E56`
- `danger-100`: `#F3E3E0`
- `success-500`: `#657B57`

### Usage Rules

- App background uses `bg-app`
- Cards use `bg-surface`
- Subtle grouped areas use `bg-soft`
- Main text uses `text-strong`
- Secondary text uses `text-muted`
- Primary actions use `olive-500` or `olive-600`
- Olive soft backgrounds can highlight useful areas
- Danger colors should only appear in debt or warning contexts

### Recommended Balance

- 75% warm neutrals
- 20% soft gray-beige structure
- 5% olive accent

This keeps the app calm and avoids making it feel too green or too “theme-heavy”.

## Typography

## Font Direction

Use a clean, human, editorial sans.

Recommended options:

- `Instrument Sans`
- `Plus Jakarta Sans`
- `Manrope`

Best fit for this product:

- `Instrument Sans` for headings and UI

Fallback:

- `ui-sans-serif, system-ui, sans-serif`

### Type Scale

- `text-display`: 40px / 2.5rem / semibold
- `text-h1`: 28px / 1.75rem / semibold
- `text-h2`: 22px / 1.375rem / semibold
- `text-h3`: 18px / 1.125rem / medium
- `text-body-lg`: 16px / 1rem / regular
- `text-body`: 15px / 0.9375rem / regular
- `text-sm`: 13px / 0.8125rem / medium
- `text-xs`: 12px / 0.75rem / medium

### Type Usage

- Main available balance uses `text-display`
- Screen titles use `text-h1`
- Card titles use `text-h3`
- Body copy uses `text-body`
- Helper labels use `text-sm` or `text-xs`

### Typography Rules

- Avoid too many bold labels
- Let size contrast do most of the work
- Monetary values should be visually prominent
- Secondary labels should stay quiet

## Spacing System

Use a compact but breathable spacing scale.

- `space-4`: 4px
- `space-8`: 8px
- `space-12`: 12px
- `space-16`: 16px
- `space-20`: 20px
- `space-24`: 24px
- `space-32`: 32px

### Screen Layout Spacing

- mobile page padding: `20px`
- desktop page padding: `24px` to `32px`
- section gap: `16px`
- card internal padding: `16px` to `18px`
- button horizontal padding: `14px` to `16px`
- input height: `48px` minimum

## Radius System

- `radius-sm`: 12px
- `radius-md`: 16px
- `radius-lg`: 20px
- `radius-xl`: 24px
- `radius-pill`: 999px

### Usage

- buttons: `radius-md`
- inputs: `radius-md`
- cards: `radius-lg`
- chips: `radius-pill`

## Border and Shadow

### Borders

- default border: `1px solid border-soft`
- emphasized border: `1px solid border-strong`

### Shadows

Keep shadows extremely subtle.

Suggested shadow:

```css
box-shadow: 0 1px 2px rgba(47, 49, 43, 0.04), 0 8px 24px rgba(47, 49, 43, 0.03);
```

### Rules

- prefer borders before shadows
- never use heavy floating-card shadows
- hero surfaces can have slightly more depth than regular cards

## Layout System

## Mobile

- bottom navigation fixed
- single-column layout
- key actions reachable with thumb
- no dense tables

### Desktop

- left sidebar navigation
- centered content max width
- 2-column dashboard layouts where useful

Suggested content widths:

- standard content max width: `1200px`
- reading/narrow forms: `560px` to `680px`

## Components

## 1. App Shell

### Mobile

- top safe spacing
- page title area
- scrollable content
- sticky bottom nav

### Desktop

- sidebar with section links
- main content region
- optional right-side summary area later

## 2. Money Hero Card

Use for:

- `Tu dinero disponible`
- `Dinero libre`
- `Ingreso recibido`

### Anatomy

- eyebrow label
- large amount
- short supporting line
- optional status chip

### Style

- `bg-surface`
- thin border
- soft olive detail or badge
- very clear number hierarchy

### Example Copy

- `Tu dinero disponible`
- `Lo que puedes usar sin afectar lo asignado`

## 3. Standard Card

Use for:

- quincena summary
- próximos pagos
- cuentas
- metas
- historial

### Anatomy

- title
- content body
- optional footer action

### Rules

- keep content grouped in simple rows
- avoid more than one main CTA inside the same card

## 4. Buttons

### Primary Button

Use for:

- main confirm actions
- create or save

Style:

- olive background
- warm white text
- subtle darkening on press

### Secondary Button

Use for:

- non-primary but important actions

Style:

- transparent or soft background
- border-soft outline
- dark text

### Tertiary Button / Text Action

Use for:

- `Ver todos`
- `Editar reglas`
- `Ver historial`

Style:

- text only
- olive or strong neutral text

### Button Sizing

- height: `44px` to `48px`
- mobile tap target should feel comfortable

## 5. Inputs

### Text / Amount Input

Style:

- `bg-surface`
- border-soft
- rounded medium corners
- 48px min height

Focus state:

- olive border
- soft outer ring using olive-100

### Select / Picker

Should visually match the input.

### Input Rules

- labels above field
- placeholders muted
- no overly decorative icons unless they help

## 6. Row Items

Used in:

- upcoming payments
- account lists
- rules
- transaction items

### Structure

- left: title + optional subtitle
- right: amount, date, or compact status

### Rules

- align numbers cleanly
- use enough vertical spacing to avoid crowding
- keep repeated rows visually quiet

## 7. Chips

Used for:

- `Estable`
- `Por vencer`
- `Pendiente`
- `Fijo`
- `%`

### Style

- pill shape
- small text
- subtle tint background

Examples:

- olive tint for stable or active
- beige tint for neutral tags
- muted clay tint for warning

## 8. Stacked Allocation Bar

Use in:

- quincena distribution

### Segments

- Pagos fijos: neutral beige
- TDC: muted clay
- Ahorro: olive
- Libre: soft charcoal/stone accent

### Rules

- must be simple and readable
- no labels inside tiny segments
- labels stay outside in rows

## 9. Bottom Navigation

### Items

- Home
- Quincena
- Add
- Cuentas
- Metas

### Style

- soft surface background
- thin top border
- active item highlighted with olive
- center add action can have slightly stronger emphasis

## State Styles

## Positive / Stable

Use for:

- healthy free balance
- completed setup
- savings progress

Style:

- olive text or pale olive tint

## Neutral

Use for:

- summaries
- historical items
- inactive areas

Style:

- beige-gray structure

## Warning

Use for:

- tight quincena
- due soon
- low free balance

Style:

- warm muted tint
- strong text, not harsh red alarms

## Empty States

Empty states should feel helpful, never cold.

### Pattern

- short title
- one-line explanation
- one primary CTA

Example:

- `Aun no registras tu primera quincena`
- `Empieza agregando el ingreso para organizar tu dinero`
- `Crear quincena`

## Content Tone

The interface copy should be:

- short,
- clear,
- helpful,
- low drama.

Prefer:

- `Saldo disponible`
- `Libre restante`
- `Proximos pagos`
- `Ya asignaste lo importante antes de gastar`

Avoid:

- technical finance language,
- pushy productivity phrases,
- overly playful microcopy.

## Responsive Rules

### Mobile First

- every main action should work comfortably on a narrow screen,
- important money info should appear before supporting detail,
- cards stack vertically.

### Laptop

- turn stacked cards into balanced grids,
- preserve breathing room,
- avoid stretching cards too wide,
- maintain mobile information priority.

## Suggested CSS Token Structure

```css
:root {
  --bg-app: #F6F4EE;
  --bg-surface: #FBFAF7;
  --bg-soft: #F1EEE6;
  --border-soft: #E7E2D8;
  --border-strong: #D7D0C2;
  --text-strong: #2F312B;
  --text-body: #4C4F47;
  --text-muted: #6E7168;
  --olive-600: #5F6D43;
  --olive-500: #6F7C4F;
  --olive-300: #B8C39C;
  --olive-200: #DCE3CF;
  --olive-100: #EEF2E5;
  --danger-500: #A85E56;
  --danger-100: #F3E3E0;
  --radius-md: 16px;
  --radius-lg: 20px;
  --shadow-soft: 0 1px 2px rgba(47, 49, 43, 0.04), 0 8px 24px rgba(47, 49, 43, 0.03);
}
```

## Suggested Tailwind Translation

If using Tailwind, map these into:

- custom colors
- border radius tokens
- box shadow token
- spacing usage through default Tailwind scale where possible

## MVP Component Starter List

Build these first:

1. `AppShell`
2. `BottomNav`
3. `MoneyHeroCard`
4. `SectionCard`
5. `SummaryRow`
6. `PrimaryButton`
7. `SecondaryButton`
8. `TextInput`
9. `StatusChip`
10. `AllocationBar`

## Recommended Next Step

The best next move now is to start coding the UI foundation using this design system and the mockups from:

- [DETAILED_MOCKUPS.md](/Users/camil/Documents/New%20project/DETAILED_MOCKUPS.md)
- [SCREEN_WIREFRAMES.md](/Users/camil/Documents/New%20project/SCREEN_WIREFRAMES.md)

That would let us build the first screens with a clear visual language from day one.
