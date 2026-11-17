# Structure.md — how this app is put together

A plain-language guide to the project for someone new to the codebase.
Read this first, then open the files it points at.

---

## 1. What this app is

PITAC Payroll General is a **desktop app** for the cooperative's monthly
*General Payroll* sheet.

- It is a **Electron** app: Electron is a browser (Chromium) wrapped in a
  desktop window. The screen part of the app is a normal React web page.
- The sheet is printed on **A4 landscape** paper (297mm wide × 210mm tall).
- Everything you type is saved **on the computer**, in the browser's
  `localStorage` (see `src/hooks/usePayroll.js`). There is no server and no
  database.

The screen shows **the actual paper**: the same header, table, totals row and
signature blocks that come out of the printer — and every field on it is
editable. The chrome around it (top bar, buttons, toasts) is just decoration
for the app; none of it is printed.

---

## 2. Running it

```bash
npm install     # once
npm run dev     # development: Vite + Electron with hot reload
npm start       # production: builds the page, then opens Electron
npm run dist    # builds the Windows installer into release/
npm test        # runs the test suite
```

`npm run dev` starts the Vite dev server, waits for it, and only then starts
Electron pointed at the dev server. Doing it this way means Electron can never
load a half-built page.

---

## 3. The big picture

```
        ┌──────────────────────── Electron (electron/main.cjs) ───────────────────────┐
        │  Creates the window, handles "Print" and "Save as PDF" (via IPC)               │
        └───────────────┬──────────────────────────────────────────┬─────────────────────┘
                        │ loads the page                          │ exposes 2 functions
                        ▼                                          ▼
   ┌────────────────────────────────────────────┐      ┌────────────────────────────┐
   │  The React app (src/)                      │      │  window.payrollApi.print() │
   │                                            │      │  window.payrollApi.savePdf()│
   │  App.jsx ── usePayroll() ── EmployeesSection│     └────────────────────────────┘
   │      │            │             │          │
   │      │            │             └── EmployeeRow / TotalRow / Signatures │
   │      │            │                                             │
   │      │            └── lib/calculations.js (net pay, totals)      │
   │      │                                                          │
   │      └── useGridNavigation.js (arrow keys inside the grid)       │
   │                                                                 │
   │  PrintPayroll.jsx  ── the hidden print copy of the same sheet   │
   └────────────────────────────────────────────────────────────────┘
```

**The one idea to understand:** there are **two copies** of the sheet.

| Copy | Where it is | What it is |
|------|-------------|------------|
| Editing copy | the main screen | real `<input>` elements you can click and type in |
| Paper copy | bottom of the DOM, hidden with CSS | plain text, millimetre widths, black rules |

The paper copy lives in `src/print/PrintPayroll.jsx` and is hidden on screen
with `display: none`; the `@media print` block in `src/print/print.css` makes
it visible and hides everything else. Both copies read the same state, so the
printed sheet always matches what is on the screen.

---

## 4. The files, one by one

### 4.1 Root files

| File | What it does |
|------|--------------|
| `package.json` | The project manifest: name, version, scripts (`dev`, `build`, `start`, `dist`, `test`) and the list of dependencies. The `build` section here is read by **electron-builder** and decides the installer's name, icon and shortcuts. |
| `index.html` | The one HTML page Electron loads. It contains an empty `<div id="root">`, the page title and a Content Security Policy. |
| `vite.config.js` | Settings for **Vite** (the build tool) and **Vitest** (the test runner). `base: './'` makes the built files work from a `file://` URL, which is how Electron loads them. |
| `README.md` | The user-facing manual: how to install, how to use the app, what is saved. |
| `PLAN.md` | The original design document for the app (written before the code). Useful background; the code has moved on since. |
| `Structure.md` | This file. |
| `build/icon.ico` | The Windows application and installer icon, drawn by `scripts/make-icon.cjs`. |

### 4.2 `electron/` — the desktop shell

| File | What it does |
|------|--------------|
| `electron/main.cjs` | The Electron "main process". It creates the window (1360×900, minimised sizes, `contextIsolation: true`, `sandbox: true` so the page cannot touch the system), removes the application menu, blocks navigation away from the app, and handles the two printing actions. It also grabs a **single-instance lock**: running the app twice would mean two copies fighting over the same saved draft. It remembers the folder the last PDF was saved in. |
| `electron/preload.cjs` | The tiny bridge between the page and Electron. `contextBridge` exposes exactly two functions on `window.payrollApi`: `print()` and `savePdf(name)`. The React app checks `window.payrollApi?.print` and shows a message when it runs in a plain browser. |

**Printing, in detail**

- `payroll:print` → `webContents.print({ pageSize: 'A4', landscape: true, preferCSSPageSize: true })` —
  opens the system print dialog with A4 landscape already chosen.
- `payroll:save-pdf` → asks the user where to save the file, then
  `webContents.printToPDF({ preferCSSPageSize: true, landscape: true })` and writes the bytes to disk.
  `preferCSSPageSize` means the PDF obeys the `@page` rule in `src/print/print.css`
  (A4 landscape, 12mm margins).

### 4.3 `scripts/` — helpers that are not part of the app

| File | What it does |
|------|--------------|
| `scripts/print-sample.cjs` | Renders a reference PDF of a filled payroll sheet into `sample/`. |
| `scripts/capture-print.cjs` | Captures the print view and the screen UI as PNG files into `sample/`. |
| `scripts/sample-draft.json` | The sample payroll data used by the two scripts above. |
| `scripts/make-icon.cjs` | Draws `build/icon.ico` (16–256 px) in plain pixel math and writes a PNG preview. |

### 4.4 `src/` — the React app

| File | What it does |
|------|--------------|
| `src/main.jsx` | The entry point. Mounts `<App />` into `#root` and imports Bootstrap (buttons, layout helpers) plus the two stylesheets that are actually ours. |
| `src/App.jsx` | The screen composition: the app bar, the editable sheet, the signatory blocks, the toast — and the **hidden print copy** (`PrintPayroll`), which is the only thing that is printed. |
| `src/hooks/usePayroll.js` | The brain of the app: all the state (header, columns, employees, signatories), the draft in `localStorage`, and every action the UI can trigger. |
| `src/hooks/useGridNavigation.js` | Arrow Up / Arrow Down move between rows, Enter moves to the next cell, Ctrl+Enter adds a row. |
| `src/lib/calculations.js` | Pure helpers: `computeRow` (net pay, net pay total), `computeTotals` (the TOTAL row), `hasEmployeeContent` (which rows are printed). |
| `src/lib/columns.js` | The columns of the sheet, their labels and their **print widths in millimetres**. |
| `src/lib/format.js` | Formatting and validation: peso numbers, decimal sanitising, PDF file names. |
| `src/lib/navigation.js` | Small helpers behind the grid keyboard movement. |
| `src/print/PrintPayroll.jsx` | The paper copy: company header, the grid, the totals row and the signature band. |
| `src/print/print.css` | Print-only styling — A4 landscape, millimetres, black rules. |
| `src/styles/theme.css` | The colour variables and the Bootstrap primary override. |
| `src/styles/layout.css` | The screen layout: app bar, sheet card, section headings, header block, signatories, columns panel. |
| `src/styles/table.css` | The grid: table wrapper, inputs, cells, row actions, totals row. |
| `src/styles/app.css` | The file that pulls the three style files above together. |

#### `src/hooks/usePayroll.js` — the data

Think of this as the app's "model layer". It holds:

- **The header** — company name, address, division and the pay period (`DEFAULT_META`).
- **The columns** — which optional money columns are visible (`DEFAULT_COLUMNS`).
- **The employees** — one row each: name, basic pay, deduction (a single amount plus a short reason), cash advance and the net pay total override.
- **The signatories** — the four blocks with their roles, names and positions (`DEFAULT_SIGNATORIES`).
- **Saving and loading** — the draft is written to `localStorage` under the key
  `pitac-payroll-general-draft-v1`, a fraction of a second after every change.

**Two rules worth knowing as a junior dev:**

1. **Money is stored as text.** A field holds `"7000"`, not `7000`, so a half-typed
   number is never thrown away while it is being typed. `sanitizeDecimalString`
   keeps it to digits and one decimal point.
2. **The printed sheet is a copy, not a second source of truth.** The paper copy
   is built from the same rows, so a value only has to be changed in one place.

#### `src/components/` — the pieces on screen

They are grouped in folders by role.

**`components/app/` — the app's own furniture (never printed)**

| File | What it does |
|------|--------------|
| `AppBar.jsx` | The sticky top bar: the brand on the left, and the buttons *Columns*, *New Payroll*, *Print* and *Save as PDF* on the right. |
| `ColumnsPanel.jsx` | The little drop-down that switches the optional money columns on and off. |
| `StatusToast.jsx` | The small message that slides in at the bottom-right corner ("Payroll saved as a PDF."). It disappears by itself after a few seconds. |

**`components/ui/` — small reusable bits**

| File | What it does |
|------|--------------|
| `NumericInput.jsx` | A money field: digits and one decimal point only. |
| `TextInput.jsx` | A plain text field for names, titles and the header. |
| `SectionHeading.jsx` | The small "eyebrow + title + optional button on the right" heading used above each section. |

**`components/payroll/` — the sheet itself**

| File | What it does |
|------|--------------|
| `PayrollHeader.jsx` | The company name, the address, the division and the `PAYROLL FOR THE MONTH OF …` line. |
| `EmployeesSection.jsx` | The grid: the headings, the *Add Employee* button, the rows and the totals row. |
| `EmployeeRow.jsx` | One employee: name, the money columns, the worked-out net pay, the net pay total and the empty signature cell. |
| `TotalRow.jsx` | The `TOTAL` row of the on-screen grid. |
| `SignaturesSection.jsx` | The four signatory blocks (*Prepared by*, *Certified Correct by*, *Approved by*, *Paid by*), each with a name and a position. |

---

## 5. How data flows

```
user types / clicks
        │
        ▼
AppBar / EmployeeRow / SignaturesSection   (components — they only call callbacks)
        │
        ▼
usePayroll  (hook — holds state, decides what the action means)
        │
        ▼
lib/calculations.js  (pure functions — work out net pay and the totals)
        │
        ▼
setState  →  React re-renders  →  useEffect writes the draft  →  localStorage
```

**Rules of thumb when you change something**

- Components should stay "dumb": they show data and call the callbacks they
  were given. Logic belongs in `usePayroll.js` or `lib/`.
- Anything that changes the saved draft must go through `usePayroll`, otherwise
  it will not be saved and will disappear when the app is closed.
- If you add a field to a row, add it to `createEmployee()` in
  `src/hooks/usePayroll.js` too, so a brand-new sheet has it.

---

## 6. How the CSS is organised

The screen styles are split into four small files, each with one job:

| File | What it styles |
|------|----------------|
| `styles/theme.css` | The colour variables (`--payslip-accent` is the cooperative's maroon), the radius and the shadow. Change a value here and it changes everywhere. |
| `styles/layout.css` | The app bar, the white rounded card the app sits in, the section headings, the header block, the signatory cards, the columns panel, the toast and the small-screen tweaks. |
| `styles/table.css` | The grid: the table wrapper, the inputs, the cells, the row remove button and the totals row. |
| `styles/app.css` | The file that imports the three files above (one `@import` per line). |
| `print/print.css` | Everything that only matters on paper. |

### How the print layout works

- The page is **A4 landscape with 12mm margins**, so the usable box is
  273mm × 186mm.
- The printed sheet is deliberately **bigger and darker than a normal form**
  because it is read by people in their senior years: body text is 11.5pt in
  weight 600, headers 9.5pt in weight 800, and every rule is **solid black**.
  Never switch the print styles back to pale grey text, light grey separators
  or hairline borders — cheap printers drop them out, and older eyes need the
  contrast.
- The table is `width: 100%` with `table-layout: fixed`. The column widths are
  written in **millimetres** in `src/lib/columns.js` and add up to exactly
  273mm — name 62, basic pay 30, deduction 42, cash advance 32,
  net pay 31, net pay total 35, signature 41. Keep that sum at 273mm or the
  table will overflow the page; widen a money column by taking the space from
  the name column, which has the most slack.
- The **Deduction** column is the old Rice and Chicken columns folded into one.
  A row prints the amount, and underneath it the short free-text reason
  (`.print-deduction-reason`, 9pt). That second line is why it is the widest
  money column (42mm) and why a row with a reason is a little taller.
- Row padding is **5pt**, not 7pt, because the big type made each row tall: at
  7pt only 5 employees fitted on one page. 5pt keeps a full page at **6 rows
  with reasons (181.6mm) or 9 rows without (183.4mm)** of the 186mm printable
  height. Check the total height before growing the type, padding or footer
  gap again.
- `thead { display: table-header-group }` makes the column headers print again
  on a second page, and `break-inside: avoid` keeps a row and the signature
  band from being split in half.
- The header labels use `letter-spacing`, which also pushes the last letter of a
  label away from the edge. `text-indent: -0.05em` cancels that, so a header
  sits exactly above its figures.
- The money columns are wide enough for the enlarged, bold header labels
  (*Cash Advance*, *Net Pay Total*) to stay on one line. If a label ever wraps,
  widen its column rather than shrinking the font.

---

## 7. Where to change what

| I want to change… | Go to |
|-------------------|-------|
| The colours, spacing or the look of the app | `src/styles/theme.css` and `src/styles/layout.css` |
| The layout of the printed sheet | `src/print/print.css` and the widths in `src/lib/columns.js` |
| A field on the sheet (add/remove/rename) | `src/components/payroll/*.jsx` + `createEmployee()` in `src/hooks/usePayroll.js` |
| How net pay or the totals are worked out | `src/lib/calculations.js` |
| The default header text or the default signatories | `DEFAULT_META` / `DEFAULT_SIGNATORIES` in `src/hooks/usePayroll.js` |
| A new button in the top bar | `src/components/app/AppBar.jsx` + `src/App.jsx` |
| The window size, the print dialog or the PDF file | `electron/main.cjs` |
| The installer's name, icon or shortcuts | the `build` section of `package.json` + `scripts/make-icon.cjs` |

---

## 8. A few words you will see

| Word | Meaning here |
|------|--------------|
| **Component** | A `.jsx` file that returns some UI. Bigger ones are split into smaller ones (`EmployeesSection` → `EmployeeRow`). |
| **Hook** | A function named `use…` that can hold React state (e.g. `usePayroll`). |
| **Props** | The values a component receives from its parent, written as `function Thing({ a, b })`. |
| **IPC** | "Inter-process communication": the way the page asks Electron to print. |
| **`localStorage`** | A small key/value store inside the browser. Here it holds the payroll draft. |
| **`@page`** | CSS that describes the paper: size and margins for printing. |
| **`mm`** | Millimetres. The print styles use them so the output is a real size on real paper. |

---

## 9. Things that are easy to get wrong

- **The hidden print copy is always in the DOM.** It is `display: none` on
  screen and `display: block` when printing. Do not delete it from `src/App.jsx`
  — that is what gets printed.
- **The whole draft is saved.** Header, columns, employees and signatories all
  go to `localStorage`. A change that skips `usePayroll` is lost when the app
  closes.
- **Millimetres on paper, pixels on screen.** Do not mix them in one rule.
- **Changing a default does not change an existing draft.** A saved draft keeps
  the values it was saved with; **New Payroll** (or a new `STORAGE_KEY`) is what
  brings the new defaults back.
