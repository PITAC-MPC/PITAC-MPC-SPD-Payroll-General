# PITAC-MPC SPD Payroll General — App Plan

Desktop app for producing the cooperative's monthly **General Payroll** sheet: employees on the
rows, the money columns across, the net pay worked out for you, and a **portrait A4** print / PDF
output that mirrors the existing paper form.

---

## 1. What the paper form actually is

From the sample (`eaa2aa2c-...jfif`):

| Part       | Contents                                                                                                                          |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Org header | Pitac Multipurpose Cooperative / San Victores St., Brgy. 9, Malaybalay City                                                       |
| Division   | `SPECIAL PROJECT DIVISION`                                                                                                        |
| Title      | `PAYROLL FOR THE MONTH OF SEPTEMBER 14-30, 2026`                                                                                  |
| Grid       | `Name of Employee` / `BASIC PAY` / `RICE` / `CHICKEN` / `CASH ADVANCE` / `NET PAY` / `NET PAY` / `SIGNATURE`                      |
| Totals     | `TOTAL` row — one sum per money column                                                                                            |
| Signatures | `Prepared by` (Logistic Manager) / `Certified Correct by` (SPD-Division head) / `Approved by` (COO) / `Paid by` (Finance Manager) |

Two modelling consequences worth calling out early:

1. **The sheet carries two net-pay columns.** The left one is the take-home of the period; the
   right one is the total for the employee. The paper does not say how the right-hand figure is
   reached, so the app treats it as an **editable value that is filled in with the computed net
   pay** and can be corrected by hand — which is what a half-month payroll needs (a payroll that
   covers only part of the month has to add the previous period's net). The `TOTAL` row sums the
   two columns separately.
2. **Deductions are free-form per employee.** Rice, Chicken and Cash Advance are no longer fixed
   columns: each employee carries a list of `(reason, amount)` entries, so any deduction can be
   added or removed. On the sample, basic pay minus those entries lands on the net pay figure, so
   `Net Pay = Basic Pay − sum(Deduction entries)`. The whole Deduction column can be switched off;
   a hidden column is not subtracted, so the grid can be trimmed without the arithmetic changing
   meaning.

---

## 2. Stack

| Concern     | Choice                                                           | Why                                                                                             |
| ----------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Shell       | Electron                                                         | Offline desktop, direct printer access, file storage without a server                           |
| Build       | Vite + `@vitejs/plugin-react`                                    | Fast HMR for the renderer, one output folder (`dist/`) that Electron loads from a `file://` URL |
| UI          | React 19 + **Bootstrap 5.3** + `bootstrap-icons`                 | Bootstrap utilities for the editor forms; a small amount of custom CSS for the print table      |
| State       | React hooks + `useReducer`-style helpers                         | The sheet is small; plain hooks keep it readable                                                |
| Persistence | `localStorage` in the Electron profile                           | One draft, no server, no native modules                                                         |
| Packaging   | `electron-builder` → NSIS installer + portable exe (Windows x64) | Standard for this kind of in-house app                                                          |
| Testing     | Vitest + jsdom                                                   | The risky logic is the net-pay arithmetic and the print layout                                  |

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
  last-save-folder                                EmployeeRow, DeductionCell, TotalRow,
  memory                                          SignaturesSection
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

| Channel            | Direction | Payload → Result                                                           |
| ------------------ | --------- | -------------------------------------------------------------------------- |
| `payroll:print`    | invoke    | `{}` → `{ success, failureReason }` — opens the system print dialog        |
| `payroll:save-pdf` | invoke    | `suggestedName` → `{ success, filePath }` or `{ canceled }` or `{ error }` |

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
  columns: { basicPay: true, deduction: true },
  employees: [
    {
      id: 'uuid',
      name: 'Balaquit, Vernel L.',
      basicPay: '7000',          // text, so a half-typed number is never lost
      deductions: [
        { id: 'uuid', reason: 'Rice', amount: '500' },
        { id: 'uuid', reason: 'Chicken', amount: '200' },
        { id: 'uuid', reason: 'CA', amount: '300' },
      ],
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
- The **grid** is one row per employee: `Name of Employee`, `Basic Pay`, `Deduction`, `Net Pay`,
  `Signature`. The Deduction cell is a list of `(reason, amount)` lines with a
  per-employee total, a `×` on each line and **Add new deduction** underneath.
- **Net Pay** is worked out and shown in a read-only cell: basic pay minus that row's deductions.
  There is no second net-pay column and no override.
- The **Signature** cell is deliberately empty — it is for the wet signature on the printed sheet.
- The **TOTAL** row sums every column and counts the employees.
- The **signatory blocks** are typed on the screen and printed in one band of four.
- **Columns** (top bar) switches the optional money columns on and off.
- **New Payroll** clears the sheet; **Print** and **Save as PDF** are the two output actions.
- Keyboard: ↑ / ↓ move between rows, Enter moves to the next cell, Ctrl+Enter adds a row.

### 5.2 Print view

A second copy of the same sheet, hidden on screen, printed on A4 portrait.

---

## 6. Print / A4 portrait specification

**Page:** A4 portrait = `210mm × 297mm`. With 12mm margins the usable box is `186mm × 273mm`.

```css
@page {
  size: A4 portrait;
  margin: 12mm;
}
@media print {
  .app-shell,
  .toast-container,
  .no-print {
    display: none !important;
  }
  .print-document {
    display: flex !important;
    flex-direction: column;
    width: 100%;
    min-height: 271mm; /* 273mm usable - 2mm safety so no blank page */
  }
  .print-footer {
    margin-top: auto; /* signatories sit at the bottom of the sheet */
    padding-top: 10mm;
  }
  .print-table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }
  thead {
    display: table-header-group;
  } /* headers repeat on page 2 */
  tr,
  .print-footer {
    break-inside: avoid;
  }
}
```

Layout decisions:

- **Columns in millimetres, totalling exactly 186mm**: name 38, basic pay 22, deduction 48,
  net pay 50, signature 28. Net pay keeps the width of the old net pay + net pay total pair.
  They live in `src/lib/columns.js` so the paper and the code cannot drift apart.
- **The deduction list prints as its own mini table**: reason on the left, amount beside it, then
  the employee's total in bold with a rule above it. Only entries with an amount print.
- **Everything left-aligned.** The uppercase headers carry `letter-spacing`, which also pushes
  the last letter away from the edge; `text-indent: -0.06em` cancels that so a header sits exactly
  above its figures.
- **Empty means empty.** A zero deduction prints as a blank cell (as on the paper), not as `0.00`.
- **Signature lines**: a rule with the name and the position under it, in four columns.
- **Signatories sit at the foot of the page**: the print document is a flex column at least one
  page tall (`min-height: 271mm`), and `.print-footer` uses `margin-top: auto`, so a payroll that
  does not fill the sheet still has its signatory band on the bottom edge of the usable box. A
  longer sheet pushes the band onto the end of the last page.
- **Header and signatories use the v0.1.0 type scale**: company 14pt/700, address 9pt dark grey,
  division 10pt/700, title 11pt/700; signatory role 9pt/600, name 9pt/700, position 8.5pt.
- **Both output paths agree**: `printToPDF` and `webContents.print` run with `landscape: false`
  and `preferCSSPageSize: true`, so the saved PDF and the print dialog produce the same page.

---

## 7. Pure logic to unit-test (Vitest)

- `computeRow()` — net pay from basic pay minus the sum of the row's deduction entries; blank
  amounts count as zero; rounding to two decimals.
- `computeTotals()` — one sum per visible column; a hidden column is not summed.
- `computePayroll()` — rows and totals together; an empty payroll is not an error.
- `hasEmployeeContent()` — only rows with something on them are printed.
- `sanitizeDecimalString()` / `sanitizeIntegerString()` — what a keyboard may type into a field.
- `buildPdfFileName()` — a safe file name for the export.
- The grid navigation helpers — clamping at the first and last row.

---

## 8. Confirmed decisions

| #   | Decision                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------ |
| 1   | **One net-pay column**: computed from basic pay minus deductions, with no manual override.                   |
| 2   | **English labels only** — `Basic Pay`, `Deduction`, `Net Pay`.                                               |
| 3   | **The signature column is blank** on the paper — signed by hand after printing.                              |
| 4   | **The signatories are editable fields**, prefilled with the four names and positions from the paper form.    |
| 5   | **A4 portrait** for both the print dialog and the PDF export.                                                |
| 6   | **The optional money columns can be switched off** so the sheet can be trimmed to a form with fewer columns. |
| 7   | **One draft, kept locally**; **New Payroll** clears it.                                                      |
| 8   | **Deductions are a per-employee list** of reason/amount entries — any deduction can be added or removed.     |

### Still worth deciding

- **The pay period is free text.** It is printed exactly as typed, so the default still reads
  `INPUT MONTH HERE (ie September 16-30, 2026)`. An empty field with a real placeholder might be
  cleaner.
- **Default amounts.** The rows start empty; a payroll that is always the same basic pay could
  pre-fill `createEmployee()`.
- **How many rows to start with.** The sheet opens with two blank rows; the paper form has four.
