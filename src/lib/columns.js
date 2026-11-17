/**
 * Print widths are in millimetres and must add up to the printable width of
 * A4 landscape with 12mm margins (297mm - 24mm = 273mm):
 *
 *   name 62 + basic pay 30 + deduction 42 + cash advance 32
 *       + net pay 31 + net pay total 35 + signature 41 = 273mm
 *
 * `Deduction` replaced the old Rice and Chicken columns. It holds one amount
 * plus a short free-text reason, which prints underneath the amount, so it
 * gets the widest money column.
 *
 * The money columns are wide enough for the large, bold header labels used
 * in `src/print/print.css` to sit on one line.
 */
export const MONEY_COLUMNS = [
  {
    key: 'basicPay',
    label: 'Basic Pay',
    shortLabel: 'Basic Pay',
    printWidth: '30mm',
    toggleable: true,
  },
  {
    key: 'deduction',
    label: 'Deduction',
    shortLabel: 'Deduction',
    printWidth: '42mm',
    toggleable: true,
  },
  {
    key: 'cashAdvance',
    label: 'Cash Advance',
    shortLabel: 'Cash Advance',
    printWidth: '32mm',
    toggleable: true,
  },
];

export const NET_PAY_COLUMN = {
  key: 'netPay',
  label: 'Net Pay',
  shortLabel: 'Net Pay',
  printWidth: '31mm',
  toggleable: false,
};

export const NET_PAY_TOTAL_COLUMN = {
  key: 'netPayTotal',
  label: 'Net Pay Total',
  shortLabel: 'Net Pay Total',
  printWidth: '35mm',
  toggleable: false,
};

export const SIGNATURE_COLUMN = {
  key: 'signature',
  label: 'Signature',
  shortLabel: 'Signature',
  printWidth: '41mm',
  toggleable: false,
};

export const NAME_COLUMN = {
  key: 'name',
  label: 'Name of Employee',
  shortLabel: 'Name of Employee',
  printWidth: '62mm',
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

export const DEDUCTION_KEYS = ['deduction', 'cashAdvance'];
