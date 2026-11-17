import { DEDUCTION_KEYS } from './columns';
import { round2, toNumber } from './format';

/**
 * Returns the deduction keys that are active for the current column setup.
 */
export function activeDeductions(visibility = {}) {
  return DEDUCTION_KEYS.filter((key) => visibility[key] !== false);
}

/**
 * Computes the money values of a single employee row.
 *
 * Net Pay       = Basic Pay - (Deduction + Cash Advance)
 * Net Pay Total = Net Pay, unless the user overrides the row value
 *                 (for example to add a previous period's net pay)
 */
export function computeRow(row, visibility = {}) {
  const basicPay = round2(row?.basicPay);
  const deduction = round2(row?.deduction);
  const cashAdvance = round2(row?.cashAdvance);

  const deductions = activeDeductions(visibility).reduce(
    (total, key) => total + toNumber(row?.[key]),
    0,
  );

  const netPay = round2(basicPay - deductions);
  const override = String(row?.netPayTotalOverride ?? '').trim();
  const netPayTotal = override ? round2(override) : netPay;

  return {
    ...row,
    basicPayValue: basicPay,
    deductionValue: deduction,
    cashAdvanceValue: cashAdvance,
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
    cashAdvance: 0,
    netPay: 0,
    netPayTotal: 0,
    count: 0,
  };

  rows.forEach((row) => {
    totals.count += 1;

    if (visibility.basicPay !== false) totals.basicPay += row.basicPayValue;
    if (visibility.deduction !== false) totals.deduction += row.deductionValue;
    if (visibility.cashAdvance !== false)
      totals.cashAdvance += row.cashAdvanceValue;

    totals.netPay += row.netPay;
    totals.netPayTotal += row.netPayTotal;
  });

  totals.basicPay = round2(totals.basicPay);
  totals.deduction = round2(totals.deduction);
  totals.cashAdvance = round2(totals.cashAdvance);
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
 * True when a row carries any printable content.
 */
export function hasEmployeeContent(row) {
  if (!row) return false;

  return Boolean(
    String(row.name ?? '').trim() ||
    toNumber(row.basicPay) > 0 ||
    toNumber(row.deduction) > 0 ||
    toNumber(row.cashAdvance) > 0 ||
    String(row.deductionReason ?? '').trim() ||
    String(row.netPayTotalOverride ?? '').trim(),
  );
}
