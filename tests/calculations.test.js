import { describe, expect, it } from 'vitest';
import {
  computePayroll,
  computeRow,
  computeTotals,
  hasEmployeeContent,
  sumDeductions,
} from '../src/lib/calculations';
import {
  buildPdfFileName,
  formatNumber,
  round2,
  sanitizeDecimalString,
  toNumber,
} from '../src/lib/format';

const allColumns = {
  basicPay: true,
  deduction: true,
};

function deduction(reason, amount) {
  return { id: `${reason}-${amount}`, reason, amount };
}

function row(overrides = {}) {
  return {
    id: 'r1',
    name: '',
    basicPay: '',
    deductions: [],
    netPayTotalOverride: '',
    ...overrides,
  };
}

describe('sumDeductions', () => {
  it('adds the amounts of every entry', () => {
    expect(
      sumDeductions([
        deduction('Rice', '500'),
        deduction('Chicken', '200'),
        deduction('Cash Advance', '300'),
      ]),
    ).toBe(1000);
  });

  it('treats blank amounts as zero and an empty list as zero', () => {
    expect(sumDeductions([deduction('Rice', '')])).toBe(0);
    expect(sumDeductions([])).toBe(0);
    expect(sumDeductions(undefined)).toBe(0);
  });
});

describe('computeRow', () => {
  it('computes net pay from basic pay minus every deduction entry', () => {
    const result = computeRow(
      row({
        basicPay: '7000',
        deductions: [
          deduction('Rice', '500'),
          deduction('Chicken', '200'),
          deduction('Cash Advance', '300'),
        ],
      }),
      allColumns,
    );

    expect(result.deductionValue).toBe(1000);
    expect(result.netPay).toBe(6000);
  });

  it('treats blank inputs as zero', () => {
    const result = computeRow(row({ basicPay: '5000' }), allColumns);

    expect(result.netPay).toBe(5000);
  });

  it('ignores the deduction column when it is hidden', () => {
    const result = computeRow(
      row({ basicPay: '7000', deductions: [deduction('Rice', '600')] }),
      { ...allColumns, deduction: false },
    );

    expect(result.deductionValue).toBe(0);
    expect(result.netPay).toBe(7000);
  });

  it('uses the net pay total override when provided', () => {
    const result = computeRow(
      row({
        basicPay: '7000',
        deductions: [deduction('Rice', '600')],
        netPayTotalOverride: '6500',
      }),
      allColumns,
    );

    expect(result.netPay).toBe(6400);
    expect(result.netPayTotal).toBe(6500);
    expect(result.hasOverride).toBe(true);
  });

  it('falls back to net pay when there is no override', () => {
    const result = computeRow(row({ basicPay: '1000' }), allColumns);

    expect(result.netPayTotal).toBe(1000);
    expect(result.hasOverride).toBe(false);
  });

  it('rounds to two decimals', () => {
    const result = computeRow(
      row({ basicPay: '1000.55', deductions: [deduction('Rice', '0.10')] }),
      allColumns,
    );

    expect(result.netPay).toBe(1000.45);
  });
});

describe('computeTotals', () => {
  it('sums every visible column', () => {
    const rows = [
      computeRow(
        row({
          id: 'a',
          basicPay: '7000',
          deductions: [deduction('Rice', '600')],
        }),
        allColumns,
      ),
      computeRow(
        row({ id: 'b', basicPay: '5000', deductions: [] }),
        allColumns,
      ),
    ];

    const totals = computeTotals(rows, allColumns);

    expect(totals.basicPay).toBe(12000);
    expect(totals.deduction).toBe(600);
    expect(totals.netPay).toBe(11400);
    expect(totals.netPayTotal).toBe(11400);
    expect(totals.count).toBe(2);
  });

  it('skips totals for hidden columns', () => {
    const rows = [
      computeRow(
        row({ basicPay: '7000', deductions: [deduction('Rice', '600')] }),
        allColumns,
      ),
    ];

    const totals = computeTotals(rows, { ...allColumns, deduction: false });

    expect(totals.deduction).toBe(0);
    expect(totals.basicPay).toBe(7000);
  });
});

describe('computePayroll', () => {
  it('returns enriched rows and totals', () => {
    const result = computePayroll({
      columns: allColumns,
      employees: [row({ id: 'a', name: 'Balaquit', basicPay: '7000' })],
    });

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].netPay).toBe(7000);
    expect(result.totals.basicPay).toBe(7000);
  });

  it('handles an empty payroll', () => {
    const result = computePayroll({ columns: allColumns, employees: [] });

    expect(result.rows).toHaveLength(0);
    expect(result.totals.netPay).toBe(0);
  });
});

describe('hasEmployeeContent', () => {
  it('detects rows with any printable content', () => {
    expect(hasEmployeeContent(row({ name: 'Balaquit' }))).toBe(true);
    expect(hasEmployeeContent(row({ basicPay: '7000' }))).toBe(true);
    expect(
      hasEmployeeContent(row({ deductions: [deduction('Rice', '600')] })),
    ).toBe(true);
    expect(hasEmployeeContent(row({ netPayTotalOverride: '100' }))).toBe(true);
    expect(hasEmployeeContent(row())).toBe(false);
  });

  it('ignores a reason that has no amount', () => {
    expect(
      hasEmployeeContent(row({ deductions: [deduction('Rice', '')] })),
    ).toBe(false);
  });
});

describe('format helpers', () => {
  it('converts values to numbers', () => {
    expect(toNumber('1,200.50')).toBe(1200.5);
    expect(toNumber('')).toBe(0);
    expect(toNumber('abc')).toBe(0);
  });

  it('rounds values to two decimals', () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2('2.344')).toBe(2.34);
  });

  it('formats numbers with two decimals', () => {
    expect(formatNumber(7000)).toBe('7,000.00');
  });

  it('sanitizes decimal input', () => {
    expect(sanitizeDecimalString('7,000.005')).toBe('7000.00');
    expect(sanitizeDecimalString('abc')).toBe('');
    expect(sanitizeDecimalString('.5')).toBe('0.5');
  });

  it('builds a safe pdf file name', () => {
    expect(buildPdfFileName('September 14-30, 2026')).toBe(
      'Payroll - September 14-30, 2026.pdf',
    );
    expect(buildPdfFileName('')).toBe('Payroll.pdf');
  });
});
