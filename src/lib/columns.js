/**
 * Print widths are in millimetres and must add up to the printable width of
 * A4 landscape with 12mm margins (297mm - 24mm = 273mm):
 *
 *   name 65 + basic pay 32 + deduction 68
 *       + net pay 34 + net pay total 38 + signature 36 = 273mm
 *
 * `Deduction` is the widest money column: each employee's cell holds a small
 * list of (reason, amount) entries plus that employee's deduction total.
 *
 * The money columns are wide enough for the large, bold header labels used
 * in `src/print/print.css` to sit on one line.
 */
export const MONEY_COLUMNS = [
  {
    key: 'basicPay',
    label: 'Basic Pay',
    shortLabel: 'Basic Pay',
    printWidth: '32mm',
    toggleable: true,
  },
  {
    key: 'deduction',
    label: 'Deduction',
    shortLabel: 'Deduction',
    printWidth: '68mm',
    toggleable: true,
  },
];

export const NET_PAY_COLUMN = {
  key: 'netPay',
  label: 'Net Pay',
  shortLabel: 'Net Pay',
  printWidth: '34mm',
  toggleable: false,
};

export const NET_PAY_TOTAL_COLUMN = {
  key: 'netPayTotal',
  label: 'Net Pay Total',
  shortLabel: 'Net Pay Total',
  printWidth: '38mm',
  toggleable: false,
};

export const SIGNATURE_COLUMN = {
  key: 'signature',
  label: 'Signature',
  shortLabel: 'Signature',
  printWidth: '36mm',
  toggleable: false,
};

export const NAME_COLUMN = {
  key: 'name',
  label: 'Name of Employee',
  shortLabel: 'Name of Employee',
  printWidth: '65mm',
  toggleable: false,
};

/**
 * Builds the ordered list of visible columns for the payroll grid.
 * `Net Pay`, `Net Pay Total` and `Signature` are always present so the
 * printed sheet always matches the official payroll form.
 */
export function buildVisibleColumns(visibility = {}) {
  const money = MONEY_COLUMNS.filter(
    (column) => visibility[column.key] !== false,
  );

  return [
    NAME_COLUMN,
    ...money,
    NET_PAY_COLUMN,
    NET_PAY_TOTAL_COLUMN,
    SIGNATURE_COLUMN,
  ];
}
