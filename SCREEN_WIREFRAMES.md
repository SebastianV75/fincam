# Screen Wireframes

## Goal

Define the main screens for the MVP with a mobile-first structure that also adapts cleanly to laptop.

Design principles for every screen:

- fast to scan,
- low friction,
- calm layout,
- clear money hierarchy,
- one primary action per screen,
- Notion-like simplicity with subtle olive accents.

## Navigation Structure

### Mobile Bottom Navigation

1. Home
2. Quincena
3. Add
4. Cuentas
5. Metas

### Desktop Navigation

- left sidebar with the same sections,
- content area centered,
- right rail optional later for reminders or summaries.

---

## 1. Home

### Purpose

Show the current financial state in one quick glance.

### Priority Order

1. saldo disponible
2. resumen de quincena actual
3. proximos pagos
4. ahorro apartado
5. deuda TDC
6. acceso rapido para registrar movimiento

### Mobile Wireframe

```text
+--------------------------------------------------+
| Hola, Camila                              [icon] |
| Tu dinero hoy                                     |
|                                                  |
| $12,450.00                                        |
| Saldo disponible                                  |
|                                                  |
| [ Registrar gasto ]   [ Registrar abono ]        |
|                                                  |
| ---------------- Quincena actual --------------- |
| Ingreso:             $8,000                      |
| Asignado:            $6,250                      |
| Libre restante:      $1,750                      |
| [ Ver detalle ]                                  |
|                                                  |
| ---------------- Proximos pagos ---------------- |
| Internet                         May 08  $500    |
| Spotify                          May 10  $129    |
| TDC Banamex                      May 14  $2,300  |
| [ Ver recurrentes ]                              |
|                                                  |
| ---------------- Distribucion ------------------ |
| Pagos fijos                    $2,100            |
| TDC                            $2,300            |
| Ahorro                         $1,000            |
| Libre                          $1,750            |
|                                                  |
| ---------------- Cuentas ----------------------- |
| Debito                         $4,800            |
| Efectivo                       $650              |
| Ahorro                         $5,000            |
| TDC                            -$2,300           |
+--------------------------------------------------+
| Home | Quincena | + | Cuentas | Metas           |
+--------------------------------------------------+
```

### Desktop Adaptation

- top summary row with 3 or 4 cards,
- left column for quincena and accounts,
- right column for upcoming payments and quick actions.

### Notes

- The top card must be the calmest and clearest component in the app.
- "Saldo disponible" should never compete visually with totals that are not free to spend.

---

## 2. Quincena

### Purpose

Help the user plan the current pay period and understand where the paycheck was assigned.

### Priority Order

1. ingreso de la quincena
2. asignacion automatica
3. reglas de distribucion
4. resumen restante
5. historial de quincenas pasadas

### Mobile Wireframe

```text
+--------------------------------------------------+
| Quincena                                         |
|                                                  |
| Quincena actual                                  |
| 01 May - 15 May                                  |
|                                                  |
| Ingreso recibido                                 |
| [ $8,000.00                            ]         |
|                                                  |
| Orden automatico                                 |
| 1. Pagos fijos                                   |
| 2. TDC                                           |
| 3. Ahorro                                        |
| 4. Libre                                         |
|                                                  |
| ---------------- Asignacion -------------------- |
| Pagos fijos                    $2,100            |
| TDC                            $2,300            |
| Ahorro                         $1,000            |
| Libre                          $2,600            |
|                                                  |
| [ Recalcular ]      [ Ajustar manualmente ]      |
|                                                  |
| ---------------- Reglas ------------------------ |
| Renta                        fijo   $1,500       |
| Internet                     fijo   $500         |
| Ahorro meta                  %      12%          |
| [ Editar reglas ]                                |
|                                                  |
| ---------------- Historial --------------------- |
| 16 Abr - 30 Abr        Libre final: $1,200       |
| 01 Abr - 15 Abr        Libre final: $900         |
| [ Ver quincenas pasadas ]                        |
+--------------------------------------------------+
```

### Desktop Adaptation

- left side for current period setup,
- right side for rule summary and historical periods.

### Notes

- This screen is the heart of the product.
- The user should feel that every paycheck gets a plan immediately.

---

## 3. Add Transaction

### Purpose

Capture movements as fast as possible with minimal fields.

### Priority Order

1. tipo de movimiento
2. monto
3. categoria
4. fecha
5. cuenta opcional

### Mobile Wireframe

```text
+--------------------------------------------------+
| Nuevo movimiento                                 |
|                                                  |
| Tipo                                              |
| [ Gasto ] [ Ingreso ] [ Abono TDC ] [ Transfer ] |
|                                                  |
| Monto                                            |
| [ $0.00                                  ]       |
|                                                  |
| Categoria                                        |
| [ Comida v ]                                     |
|                                                  |
| Fecha                                            |
| [ 06 May 2026 ]                                  |
|                                                  |
| Cuenta                                           |
| [ Debito principal v ]                           |
|                                                  |
| Nota opcional                                    |
| [                                        ]       |
|                                                  |
| [ Guardar movimiento ]                           |
+--------------------------------------------------+
```

### Fast Entry Behavior

- remember last used account,
- default date to today,
- show common categories first,
- keep the form on one screen,
- avoid extra confirmation screens.

### Desktop Adaptation

- centered narrow form,
- keyboard-friendly input flow.

---

## 4. Cuentas

### Purpose

Give a quick overview of all money containers, then allow drilling into each one.

### Priority Order

1. total resumen
2. tarjetas por cuenta
3. detalle individual
4. movimientos recientes por cuenta

### Mobile Wireframe

```text
+--------------------------------------------------+
| Cuentas                                          |
|                                                  |
| Resumen total                                    |
| $10,450.00                                       |
|                                                  |
| ---------------- Lista de cuentas -------------- |
| Debito principal                                 |
| $4,800.00                                        |
| [ Ver detalle ]                                  |
|                                                  |
| Efectivo                                         |
| $650.00                                          |
| [ Ver detalle ]                                  |
|                                                  |
| Ahorro                                           |
| $5,000.00                                        |
| [ Ver detalle ]                                  |
|                                                  |
| TDC Banamex                                      |
| -$2,300.00                                       |
| Fecha limite: 14 May                             |
| [ Ver detalle ]                                  |
+--------------------------------------------------+
```

### Account Detail View

Should include:

- current balance,
- recent movements,
- optional edit account action,
- for credit cards: due amount and due date.

### Desktop Adaptation

- account list on left,
- selected account detail on right.

---

## 5. Metas

### Purpose

Track savings goals without adding complexity.

### Priority Order

1. active goals
2. progress amount
3. next contribution action

### Mobile Wireframe

```text
+--------------------------------------------------+
| Metas                                            |
|                                                  |
| Fondo de emergencia                              |
| $6,000 / $20,000                                 |
| [=========-------]                               |
| [ Aportar ]                                      |
|                                                  |
| Viaje                                            |
| $2,500 / $10,000                                 |
| [=====-----------]                               |
| [ Aportar ]                                      |
|                                                  |
| [ Nueva meta ]                                   |
+--------------------------------------------------+
```

### Desktop Adaptation

- card grid with clean spacing,
- side panel for selected goal later if needed.

---

## 6. Credit Card Detail

### Purpose

Keep the TDC understandable and actionable.

### Priority Order

1. total que debo
2. fecha limite
3. pagos realizados
4. registrar abono

### Mobile Wireframe

```text
+--------------------------------------------------+
| TDC Banamex                                      |
|                                                  |
| Total pendiente                                  |
| $2,300.00                                        |
|                                                  |
| Fecha limite                                     |
| 14 May 2026                                      |
|                                                  |
| [ Registrar abono ]                              |
|                                                  |
| ---------------- Historial de pagos ------------ |
| 30 Abr                  Abono        $800        |
| 15 Abr                  Abono        $1,000      |
|                                                  |
| ---------------- Movimientos ------------------- |
| Supermercado             02 May      $650        |
| Gasolina                 01 May      $900        |
+--------------------------------------------------+
```

### Notes

- This should feel simpler than a banking app.
- Focus on "what do I owe and when", not advanced card analytics.

---

## 7. Recurrentes

### Purpose

Manage repeating financial commitments that shape each pay period.

### Priority Order

1. active recurring items
2. amount
3. next due date
4. reminder status

### Mobile Wireframe

```text
+--------------------------------------------------+
| Recurrentes                                      |
|                                                  |
| Internet                 $500       08 May       |
| Recordatorio: 2 dias antes                        |
|                                                  |
| Spotify                  $129       10 May       |
| Recordatorio: 1 dia antes                         |
|                                                  |
| Ahorro fondo             $1,000     15 May       |
| Recordatorio: al caer quincena                   |
|                                                  |
| [ Nuevo recurrente ]                             |
+--------------------------------------------------+
```

---

## 8. Historial de Quincenas

### Purpose

Review previous periods and compare outcomes at a glance.

### Priority Order

1. period dates
2. income
3. spent
4. saved
5. free balance left

### Mobile Wireframe

```text
+--------------------------------------------------+
| Historial                                        |
|                                                  |
| 16 Abr - 30 Abr                                  |
| Ingreso: $8,000                                  |
| Gastado: $4,700                                  |
| Ahorrado: $1,000                                 |
| Libre final: $1,200                              |
| [ Ver detalle ]                                  |
|                                                  |
| 01 Abr - 15 Abr                                  |
| Ingreso: $8,000                                  |
| Gastado: $5,100                                  |
| Ahorrado: $1,000                                 |
| Libre final: $900                                |
| [ Ver detalle ]                                  |
+--------------------------------------------------+
```

---

## Component Priorities

These components will be reused across the app:

- summary money card,
- pay period allocation card,
- quick action buttons,
- account card,
- recurring payment row,
- savings goal progress bar,
- transaction row,
- empty state block.

## Visual Recommendations

### Colors

- warm off-white background,
- soft gray borders,
- olive green for highlights and positive states,
- muted red only for debt or overdue items,
- dark neutral text.

### Typography

- clean and understated,
- strong size contrast for money,
- calm labels,
- avoid noisy bold text everywhere.

### Layout Behavior

- comfortable padding,
- rounded cards,
- clear section spacing,
- sticky bottom nav on mobile,
- sticky page title or action on longer screens if needed.

## UX Rules

- available money should always be obvious,
- the user should never need more than a few taps to add a movement,
- totals should be consistent across screens,
- quincena planning must feel trustworthy and transparent,
- account detail should remain optional, not mandatory for basic use.

## Recommended Next Design Step

Turn these wireframes into:

1. a design system mini-spec,
2. high-fidelity mockups for Home and Quincena first,
3. then an interactive prototype or directly the coded UI.
