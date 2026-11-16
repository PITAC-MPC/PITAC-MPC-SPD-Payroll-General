import { formatNumber } from '../../lib/format';

/**
 * Totals row of the on-screen payroll grid.
 */
export default function TotalRow({ totals, columns }) {
  return (
    <tr className="total-row">
      {columns.map((column) => {
        const { key } = column;

        if (key === 'name') {
          return (
            <td key={key} className="total-label">
              Total
            </td>
          );
        }

        if (key === 'signature') {
          return (
            <td key={key} className="td-num">
              {totals.count > 0 ? `${totals.count} employee(s)` : ''}
            </td>
          );
        }

        return (
          <td key={key} className="td-num total-value">
            {formatNumber(totals[key])}
          </td>
        );
      })}
      <td className="row-action no-print" />
    </tr>
  );
}
