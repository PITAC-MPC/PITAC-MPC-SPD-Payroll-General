# PITAC-MPC SPD Payroll General — App Plan

Desktop app for producing the cooperative's monthly **General Payroll** sheet: employees on the
rows, the money columns across, the net pay worked out for you, and a **landscape A4** print / PDF
output that mirrors the existing paper form.

---

## 1. What the paper form actually is

From the sample (`eaa2aa2c-...jfif`):

| Part | Contents |
|---|---|
| Org header | Pitac Multipurpose Cooperative / San Victores St., Brgy. 9, Malaybalay City |
| Division | `SPECIAL PROJECT DIVISION` |
| Title | `PAYROLL FOR THE MONTH OF SEPTEMBER 14-30, 2026` |
| Grid | `Name of Employee` / `BASIC PAY` / `RICE` / `CHICKEN` / `CASH ADVANCE` / `NET PAY` / `NET PAY` / `SIGNATURE` |
| Totals | `TOTAL` row — one sum per money column |
| Signatures | `Prepared by` (Logistic Manager) / `Certified Correct by` (SPD-Division head) / `Approved by` (COO) / `Paid by` (Finance Manager) |

Two modelling consequences worth calling out early:

1. **The sheet carries two net-pay columns.** The left one is the take-home of the period; the
   right one is the total for the employee. The paper does not say how the right-hand figure is
   reached, so the app treats it as an **editable value that is filled in with the computed net
   pay** and can be corrected by hand — which is what a half-month payroll needs (a payroll that
   covers only part of the month has to add the previous period's net). The `TOTAL` row sums the
   two columns separately.
2. **Rice and Chicken are deductions, not earnings.** On the sample, basic pay minus rice, chicken
   and cash advance lands on the net pay figure, so the money columns are modelled as
   `Net Pay = Basic Pay − (Rice + Chicken + Cash Advance)`. A column that is switched off is not
   subtracted, so the grid can be trimmed to a form with fewer deductions without the arithmetic
   changing meaning.

---

## 2. Stack

| Concern | Choice | Why |
|---|---|---|
| Shell | Electron | Offline desktop, direct printer access, file storage without a server |
| Build | Vite + `@vitejs/plugin-react` | Fast HMR for the renderer, one output folder (`dist/`) that Electron loads from a `file://` URL |
| UI | React 19 + **Bootstrap 5.3** + `bootstrap-icons` | Bootstrap utilities for the editor forms; a small amount of custom CSS for the print table |
| State | React hooks + `useReducer`-style helpers | The sheet is small; plain hooks keep it readable |
| Persistence | `localStorage` in the Electron profile | One draft, no server, no native modules |
| Packaging | `electron-builder` → NSIS installer + portable exe (Windows x64) | Standard for this kind of in-house app |
| Testing | Vitest + jsdom | The risky logic is the net-pay arithmetic and the print layout |

> Deliberately **no** react-bootstrap: the editor only needs a handful of form controls and the
> print table has to be styled from scratch anyway. Plain Bootstrap classes keep the dependency
> surface small.

---

## 3. Process architecture

```
electron/main.cjs        preload/                 src/
  window + menu          contextBridge:           index.html → src/main.jsx
  print + printToPDF     window.payrollApi        app/  App.jsx, AppBar, ColumnsPanel, StatusToast
  single-instance lock   print(), savePdf()       payroll/  PayrollHeader, EmployeesSection,
  last-save-folder                                EmployeeRow, TotalRow, SignaturesSection
  memory                ui/  NumericInput, TextInput, SectionHeading
                        print/  PrintPayroll.jsx + print.css
                        styles/  theme.css, layout.css, table.css, app.css
                        hooks/  usePayroll.js, useGridNavigation.js
                        lib/  calculations.js, columns.js, format.js, navigation.js
```

Security baseline: `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`, a CSP in
`index.html`, and only two channels exposed. No remote content.
`app.requestSingleInstanceLock()` prevents two copies from writing the same draft; the second
launch focuses the existing window.

### IPC surface

| Channel | Direction | Payload → Result |
|---|---|---|
| `payroll:print` | invoke | `{}` → `{ success, failureReason }` — opens the system print dialog |
| `payroll:save-pdf` | invoke | `suggestedName` → `{ success, filePath }` or `{ canceled }` or `{ error }` |

---

## 4. Data model

```js
{
  meta: {
    company: 'Pitac Multipurpose Cooperative',
    address: 'San Victores St., Brgy. 9, Malaybalay City',
    division: 'Special Project Division',
    periodLabel: 'Payroll for the Month of',
    period: 'September 16-30, 2026',
  },
  columns: { basicPay: true, rice: true, chicken: true, cashAdvance: true },
  employees: [
    {
      id: 'uuid',
      name: 'Balaquit, Vernel L.',
      basicPay: '7000',          // text, so a half-typed number is never lost
      rice: '600',
      chicken: '',
      cashAdvance: '1500',
      netPayTotalOverride: '',   // empty → the computed net pay is used
    },
  ],
  signatories: [
    { id, role: 'Prepared by', name, title },
    { id, role: 'Certified Correct by', name, title },
    { id, role: 'Approved by', name, title },
    { id, role: 'Paid by', name, title },
  ],
}
```

Store on disk: the Electron profile's `localStorage`, key `pitac-payroll-general-draft-v1`,
written a fraction of a second after every change. **New Payroll** deletes it and starts a blank
sheet.

---

## 5. Screens & UX

### 5.1 The payroll sheet

- The **header** is the company name, the address, the division and the pay-period line — all four
  are typed on the sheet and printed as they are.
- The **grid** is one row per employee: `Name of Employee`, `Basic Pay`, `Rice`, `Chicken`,
  `Cash Advance`, `Net Pay`, `Net Pay Total`, `Signature`.
- **Net Pay** is worked out and shown in a read-only cell; **Net Pay Total** is an editable field
  pre-filled with the same figure.
- The **Signature** cell is deliberately empty — it is for the wet signature on the printed sheet.
- The **TOTAL** row sums every column and counts the employees.
- The **signatory blocks** are typed on the screen and printed in one band of four.
- **Columns** (top bar) switches the optional money columns on and off.
- **New Payroll** clears the sheet; **Print** and **Save as PDF** are the two output actions.
- Keyboard: ↑ / ↓ move between rows, Enter moves to the next cell, Ctrl+Enter adds a row.

### 5.2 Print view

A second copy of the same sheet, hidden on screen, printed on A4 landscape.

---

## 6. Print / A4 landscape specification

**Page:** A4 landscape = `297mm × 210mm`. With 12mm margins the usable box is `273mm × 186mm`.

```css
@page { size: A4 landscape; margin: 12mm; }
@media print {
  .app-shell, .toast-container, .no-print { display: none !important; }
  .print-document { display: block !important; width: 100%; }
  .print-table { width: 100%; table-layout: fixed; border-collapse: collapse; }
  thead { display: table-header-group; }   /* headers repeat on page 2 */
  tr, .print-footer { break-inside: avoid; }
}
```

Layout decisions:

- **Columns in millimetres, totalling exactly 273mm**: name 62, basic pay 28, rice 22, chicken 24,
  cash advance 34, net pay 30, net pay total 32, signature 41. They live in `src/lib/columns.js`
  so the paper and the code cannot drift apart.
- **Everything left-aligned.** The uppercase headers carry `letter-spacing`, which also pushes
  the last letter away from the edge; `text-indent: -0.06em` cancels that so a header sits exactly
  above its figures.
- **Empty means empty.** A zero deduction prints as a blank cell (as on the paper), not as `0.00`.
- **Signature lines**: a rule with the name and the position under it, in four columns.
- **Both output paths agree**: `printToPDF` and `webContents.print` run with `landscape: true` and
  `preferCSSPageSize: true`, so the saved PDF and the print dialog produce the same page.

---

## 7. Pure logic to unit-test (Vitest)

- `computeRow()` — net pay from basic pay minus the visible deductions; blank input counts as zero;
  the net pay total override wins over the computed figure; rounding to two decimals.
- `computeTotals()` — one sum per visible column; a hidden column is not summed.
- `computePayroll()` — rows and totals together; an empty payroll is not an error.
- `hasEmployeeContent()` — only rows with something on them are printed.
- `sanitizeDecimalString()` / `sanitizeIntegerString()` — what a keyboard may type into a field.
- `buildPdfFileName()` — a safe file name for the export.
- The grid navigation helpers — clamping at the first and last row.

---

## 8. Confirmed decisions

| # | Decision |
|---|---|
| 1 | **Two net-pay columns**: the left one is worked out, the right one is an editable value filled in with the same figure. |
| 2 | **English labels only** — `Basic Pay`, `Rice`, `Chicken`, `Cash Advance`, `Net Pay`, `Net Pay Total`. |
| 3 | **The signature column is blank** on the paper — signed by hand after printing. |
| 4 | **The signatories are editable fields**, prefilled with the four names and positions from the paper form. |
| 5 | **A4 landscape** for both the print dialog and the PDF export. |
| 6 | **The optional money columns can be switched off** so the sheet can be trimmed to a form with fewer columns. |
| 7 | **One draft, kept locally**; **New Payroll** clears it. |

### Still worth deciding

- **The pay period is free text.** It is printed exactly as typed, so the default still reads
  `INPUT MONTH HERE (ie September 16-30, 2026)`. An empty field with a real placeholder might be
  cleaner.
- **Default amounts.** The rows start empty; a payroll that is always the same basic pay could
  pre-fill `createEmployee()`.
- **How many rows to start with.** The sheet opens with two blank rows; the paper form has four.
