import { hasEmployeeContent } from '../lib/calculations';
import { formatNumber } from '../lib/format';

function cellValue(column, row) {
  const { key } = column;

  if (key === 'name') return row.name;
  if (key === 'basicPay') return formatNumber(row.basicPayValue);
  if (key === 'rice') return row.riceValue ? formatNumber(row.riceValue) : '';
  if (key === 'chicken')
    return row.chickenValue ? formatNumber(row.chickenValue) : '';
  if (key === 'cashAdvance')
    return row.cashAdvanceValue ? formatNumber(row.cashAdvanceValue) : '';
  if (key === 'netPay') return formatNumber(row.netPay);
  if (key === 'netPayTotal') return formatNumber(row.netPayTotal);

  return '';
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
                <td
                  key={column.key}
                  className={
                    column.key === 'name'
                      ? 'print-name'
                      : column.key === 'signature'
                        ? 'print-signature'
                        : 'print-num'
                  }
                >
                  {column.key === 'signature' ? '' : cellValue(column, row)}
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
