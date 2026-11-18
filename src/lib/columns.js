/**
 * Print widths are in millimetres and must add up to the printable width of
 * A4 portrait with 12mm margins (210mm - 24mm = 186mm):
 *
 *   name 38 + basic pay 22 + deduction 48
 *       + net pay 50 + signature 28 = 186mm
 *
 * `Net Pay` takes the width of the old net pay + net pay total columns: it is
 * the only net-pay column now, and its computed figure is never overridden.
 * `Deduction` is the other wide money column: each employee's cell holds a
 * small list of (reason, amount) entries plus that employee's deduction total.
 *
 * The money columns are wide enough for the large, bold header labels used
 * in `src/print/print.css` to sit on one line.
 */
export const MONEY_COLUMNS = [
  {
    key: 'basicPay',
    label: 'Basic Pay',
    shortLabel: 'Basic Pay',
    printWidth: '22mm',
    toggleable: true,
  },
  {
    key: 'deduction',
    label: 'Deduction',
    shortLabel: 'Deduction',
    printWidth: '48mm',
    toggleable: true,
  },
];

export const NET_PAY_COLUMN = {
  key: 'netPay',
  label: 'Net Pay',
  shortLabel: 'Net Pay',
  printWidth: '50mm',
  toggleable: false,
};

export const SIGNATURE_COLUMN = {
  key: 'signature',
  label: 'Signature',
  shortLabel: 'Signature',
  printWidth: '28mm',
  toggleable: false,
};

export const NAME_COLUMN = {
  key: 'name',
  label: 'Name of Employee',
  shortLabel: 'Name of Employee',
  printWidth: '38mm',
  toggleable: false,
};

/**
 * Builds the ordered list of visible columns for the payroll grid.
 * `Net Pay` and `Signature` are always present so the printed sheet always
 * matches the official payroll form.
 */
export function buildVisibleColumns(visibility = {}) {
  const money = MONEY_COLUMNS.filter(
    (column) => visibility[column.key] !== false,
  );

  return [NAME_COLUMN, ...money, NET_PAY_COLUMN, SIGNATURE_COLUMN];
}
