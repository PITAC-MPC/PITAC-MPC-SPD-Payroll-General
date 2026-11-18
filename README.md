# PITAC Payroll General

Desktop app for the cooperative's monthly **General Payroll** sheet. Electron + React + Bootstrap, printing on **A4 portrait**.

The screen shows the actual paper — the same header, table, totals row and signature blocks that come out of the printer — and every field on it is editable. The chrome around it (bar, buttons, inputs, panels, toasts) follows the visual system of the [SPD Logistics Payslip Generator](https://github.com/PITAC-MPC/SPD-Logistics-Payslip-Generator).

## Download

[![Download PITAC Payroll General v0.3.0](https://img.shields.io/badge/%E2%AC%93%20Download-PITAC%20Payroll%20General%20v0.3.0-8d100e?style=for-the-badge&logo=github)](https://github.com/PITAC-MPC/PITAC-MPC-SPD-Payroll-General/releases/latest)

1. Click the button above and download the **Setup** file.

2. Open it and follow the installer (Next → Next → Install).

3. Launch **PITAC Payroll General** from the desktop or the Start menu.

The app works offline; everything is saved on the computer it is installed on.

## Run it

```
npm install
npm run dev      # development: Vite + Electron with hot reload
```

Production run (builds the renderer first):

```
npm start
```

## How to use it

Everything is on one screen.

1. **The sheet** is the working surface:

   - the **header** holds the company name, the address, the division and the line `PAYROLL FOR THE MONTH OF …` — the pay period is typed there (for example _September 16-30, 2026_);

   - every employee gets a **row**: type the name in _Name of Employee_ and the amount in _Basic Pay_; the **Deduction** cell holds that employee's own list of entries — type a reason (for example `Rice`, `Chicken`, `CA`) and an amount on each line, use **Add new deduction** for another entry, and the `×` on a line removes it;

   - each Deduction cell shows the employee's **Total** underneath their entries;

   - **Net Pay** is worked out for you — basic pay minus that employee's deduction total. It is the only net-pay column; the separate **Net Pay Total** column has been removed;

   - the **Signature** column is left empty — it is there for the wet signature on paper;

   - the **TOTAL** row sums every column for you;

   - the four **signatory blocks** at the bottom (_Prepared by_, _Certified Correct by_, _Approved by_, _Paid by_) are typed on the sheet and printed with the names and positions;

2. **Add Employee** (top bar) adds another row; the `×` on a row takes that employee off the sheet.

3. **Columns** (top bar) switches the optional money columns on and off — _Basic Pay_ and _Deduction_ — so the sheet can be trimmed to a form that has fewer columns. _Net Pay_ and _Signature_ are always printed.

4. **New Payroll** (top bar) clears everything written on the sheet and gives a blank one.

5. **Print** sends the sheet to the printer; **Save as PDF** writes a PDF file instead. Paper size is fixed to A4 portrait, the four signatory blocks are pinned to the bottom of the sheet, and a normal payroll prints as one page. The printed sheet uses **large, heavy type and solid black rules** so it stays readable for older readers — secondary lines stay a very dark grey, never pale grey text or hairline borders.

Only the sheet you are filling in is kept between sessions — the draft comes back the next time the app is opened. **New Payroll** clears it.

## Notes / current limits

- Single machine, one window at a time (single-instance lock).
- Data lives in the Electron profile (`localStorage`); no export/backup yet.
- The signature column is blank on paper — sign the printed sheet by hand.
- The print layout is large-type on purpose. Portrait A4 gives a tall page: with deductions entered, a page holds about **9 employees**; very long sheets spill onto a second page and the column headers repeat there.
- Old drafts saved before the deduction list opened with one deduction amount plus a reason and a separate cash advance. They now open with those figures carried into the employee's deduction list — no retyping needed.
- **Net Pay is now the only net-pay column** and is always computed (basic pay minus deductions). Amounts previously typed into the old **Net Pay Total** column are not carried over.
- The pay period is free text — type it exactly as it should be printed, e.g. `September 16-30, 2026`.

## Project layout

`Structure.md` explains every file in plain language — start there if the code is new to you.

```
electron/main.cjs              Electron window, print / save-as-PDF handlers
electron/preload.cjs           contextBridge for the print actions
src/main.jsx                   React entry point
src/App.jsx                    screen composition (bar, sheet, print copy)
src/hooks/
  usePayroll.js                all payroll state and actions
  useGridNavigation.js         arrow-key movement inside the grid
src/lib/
  calculations.js              net pay and column totals
  columns.js                   the columns of the sheet and their print widths
  format.js                    number, text and file-name helpers
  navigation.js                helpers behind the grid keyboard movement
src/components/
  app/AppBar.jsx               brand and print actions
  app/ColumnsPanel.jsx         switches the optional columns on and off
  app/StatusToast.jsx          status messages
  ui/NumericInput.jsx          a money field
  ui/TextInput.jsx             a name field
  ui/SectionHeading.jsx        eyebrow + title + action
  payroll/PayrollHeader.jsx    company, division and pay period
  payroll/EmployeesSection.jsx the grid and its headings
  payroll/EmployeeRow.jsx      one employee
  payroll/DeductionCell.jsx    one employee's deduction list, total and add button
  payroll/TotalRow.jsx         the TOTAL row
  payroll/SignaturesSection.jsx  Prepared by / Certified Correct by / Approved by / Paid by
src/print/PrintPayroll.jsx     the hidden A4 portrait print copy
src/print/print.css            print-only styling (A4 portrait, millimetres)
src/styles/                    screen styling, split into four files
```

## Build the installer

```
npm run dist       # builds the app and the Windows installer in release/
```

The installer is written to `release/PITAC.Payroll.General.Setup.0.3.0.exe`.

## Data model

One thing is written to disk — the draft of the sheet you are filling in:

- `meta` — company name, address, division and the pay period;
- `columns` — which optional money columns are visible;
- `employees` — one entry per row: name, basic pay and a list of deduction entries (reason + amount); net pay is computed, never stored;
- `signatories` — the four blocks: role, name and position.

It is saved in the Electron profile's `localStorage` under `pitac-payroll-general-draft-v1`, a fraction of a second after every change. **New Payroll** deletes it and starts a blank sheet.

## About

Payroll generator for PITAC-MPC Special Project Division.
