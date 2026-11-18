import { hasEmployeeContent } from '../lib/calculations';
import { formatNumber, toNumber } from '../lib/format';

function cellValue(column, row) {
  const { key } = column;

  if (key === 'name') return row.name;
  if (key === 'basicPay') return formatNumber(row.basicPayValue);
  if (key === 'netPay') return formatNumber(row.netPay);

  return '';
}

/**
 * The Deduction column prints the employee's entries as a small
 * (reason, amount) list with that employee's deduction total underneath.
 */
function deductionCell(row) {
  const items = (row.deductions ?? []).filter(
    (item) => toNumber(item?.amount) > 0,
  );

  if (items.length === 0) return null;

  return (
    <div className="print-deduction">
      {items.map((item) => (
        <div className="print-deduction-line" key={item.id}>
          <span className="print-deduction-reason">{item.reason}</span>
          <span className="print-deduction-amount">
            {formatNumber(item.amount)}
          </span>
        </div>
      ))}
      <div className="print-deduction-line print-deduction-subtotal">
        <span>Total</span>
        <span>{formatNumber(row.deductionValue)}</span>
      </div>
    </div>
  );
}

function renderCell(column, row) {
  if (column.key === 'signature') return '';
  if (column.key === 'deduction') return deductionCell(row);

  return cellValue(column, row);
}

function cellClass(column) {
  if (column.key === 'name') return 'print-name';
  if (column.key === 'signature') return 'print-signature';
  if (column.key === 'deduction') return 'print-num print-deduction-cell';
  return 'print-num';
}

/**
 * Hidden A4 print document of the general payroll.
 */
export default function PrintPayroll({
  meta,
  rows,
  totals,
  columns,
  signatories = [],
}) {
  const employees = rows.filter(hasEmployeeContent);

  return (
    <article className="print-document">
      <header className="print-header">
        <div className="print-header-main">
          <div className="print-company">{meta.company}</div>
          <div className="print-address">{meta.address}</div>
          <div className="print-division">{meta.division}</div>
        </div>
        <div className="print-title">
          {meta.periodLabel} {meta.period}
        </div>
      </header>

      <table className="print-table">
        <colgroup>
          {columns.map((column) => (
            <col key={column.key} style={{ width: column.printWidth }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={column.key === 'name' ? '' : 'print-num'}
              >
                {column.shortLabel ?? column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key} className={cellClass(column)}>
                  {renderCell(column, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="print-total">
            {columns.map((column) => {
              const { key } = column;

              if (key === 'name') {
                return (
                  <td key={key} className="print-total-label">
                    Total
                  </td>
                );
              }

              if (key === 'signature') {
                return <td key={key} className="print-num" />;
              }

              return (
                <td key={key} className="print-num print-total-value">
                  {formatNumber(totals[key])}
                </td>
              );
            })}
          </tr>
        </tfoot>
      </table>

      <footer className="print-footer">
        {signatories.map((signatory) => (
          <div className="print-signatory" key={signatory.id ?? signatory.role}>
            <div className="print-signatory-role">{signatory.role}</div>
            <div className="print-signatory-line" />
            <div className="print-signatory-name">{signatory.name}</div>
            <div className="print-signatory-title">{signatory.title}</div>
          </div>
        ))}
      </footer>
    </article>
  );
}
