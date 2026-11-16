export const MONEY_COLUMNS = [
  {
    key: 'basicPay',
    label: 'Basic Pay',
    shortLabel: 'Basic Pay',
    printWidth: '28mm',
    toggleable: true,
  },
  {
    key: 'rice',
    label: 'Rice',
    shortLabel: 'Rice',
    printWidth: '22mm',
    toggleable: true,
  },
  {
    key: 'chicken',
    label: 'Chicken',
    shortLabel: 'Chicken',
    printWidth: '24mm',
    toggleable: true,
  },
  {
    key: 'cashAdvance',
    label: 'Cash Advance',
    shortLabel: 'Cash Advance',
    printWidth: '34mm',
    toggleable: true,
  },
];

export const NET_PAY_COLUMN = {
  key: 'netPay',
  label: 'Net Pay',
  shortLabel: 'Net Pay',
  printWidth: '30mm',
  toggleable: false,
};

export const NET_PAY_TOTAL_COLUMN = {
  key: 'netPayTotal',
  label: 'Net Pay Total',
  shortLabel: 'Net Pay Total',
  printWidth: '32mm',
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

export const DEDUCTION_KEYS = ['rice', 'chicken', 'cashAdvance'];
