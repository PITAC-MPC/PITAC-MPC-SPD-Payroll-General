import { round2, toNumber } from './format';

/**
 * Adds up the amounts of one employee's deduction entries.
 */
export function sumDeductions(deductions = []) {
  if (!Array.isArray(deductions)) return 0;

  return round2(
    deductions.reduce((total, item) => total + toNumber(item?.amount), 0),
  );
}

/**
 * Computes the money values of a single employee row.
 *
 * Net Pay       = Basic Pay - the sum of the row's deduction entries
 * Net Pay Total = Net Pay, unless the user overrides the row value
 *                 (for example to add a previous period's net pay)
 */
export function computeRow(row, visibility = {}) {
  const basicPay = round2(row?.basicPay);
  const deductionValue =
    visibility.deduction === false ? 0 : sumDeductions(row?.deductions);

  const netPay = round2(basicPay - deductionValue);
  const override = String(row?.netPayTotalOverride ?? '').trim();
  const netPayTotal = override ? round2(override) : netPay;

  return {
    ...row,
    basicPayValue: basicPay,
    deductionValue,
    netPay,
    netPayTotal,
    hasOverride: Boolean(override),
  };
}

/**
 * Sums the visible money columns across every employee row.
 */
export function computeTotals(rows = [], visibility = {}) {
  const totals = {
    basicPay: 0,
    deduction: 0,
    netPay: 0,
    netPayTotal: 0,
    count: 0,
  };

  rows.forEach((row) => {
    totals.count += 1;

    if (visibility.basicPay !== false) totals.basicPay += row.basicPayValue;
    if (visibility.deduction !== false) totals.deduction += row.deductionValue;

    totals.netPay += row.netPay;
    totals.netPayTotal += row.netPayTotal;
  });

  totals.basicPay = round2(totals.basicPay);
  totals.deduction = round2(totals.deduction);
  totals.netPay = round2(totals.netPay);
  totals.netPayTotal = round2(totals.netPayTotal);

  return totals;
}

/**
 * Full payroll computation: enriched rows plus column totals.
 */
export function computePayroll(state) {
  const visibility = state?.columns ?? {};
  const rows = (state?.employees ?? []).map((row) =>
    computeRow(row, visibility),
  );

  return {
    rows,
    totals: computeTotals(rows, visibility),
  };
}

/**
 * True when a row carries any printable content. A deduction reason on its
 * own does not count: the default rows already carry the usual reasons
 * (*Rice*, *Chicken*, *Cash Advance*) with no amount, and those must not
 * print as blank employees.
 */
export function hasEmployeeContent(row) {
  if (!row) return false;

  return Boolean(
    String(row.name ?? '').trim() ||
    toNumber(row.basicPay) > 0 ||
    sumDeductions(row.deductions) > 0 ||
    String(row.netPayTotalOverride ?? '').trim(),
  );
}
