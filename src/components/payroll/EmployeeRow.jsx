import { formatNumber } from '../../lib/format';
import NumericInput from '../ui/NumericInput';
import TextInput from '../ui/TextInput';

function renderCell(column, row, index, colIndex, onUpdate) {
  const { key } = column;

  if (key === 'name') {
    return (
      <TextInput
        value={row.name}
        placeholder="Name of employee"
        ariaLabel={`Name of employee row ${index + 1}`}
        data-grid-row={index}
        data-grid-col={colIndex}
        onChange={(value) => onUpdate(row.id, 'name', value)}
      />
    );
  }

  if (key === 'netPay') {
    return (
      <div className="amount-cell cell-readonly">
        {formatNumber(row.netPay)}
      </div>
    );
  }

  if (key === 'netPayTotal') {
    return (
      <NumericInput
        value={row.netPayTotalOverride}
        placeholder={formatNumber(row.netPay)}
        ariaLabel={`Net pay total row ${index + 1}`}
        data-grid-row={index}
        data-grid-col={colIndex}
        onChange={(value) => onUpdate(row.id, 'netPayTotalOverride', value)}
      />
    );
  }

  if (key === 'signature') {
    return <div className="signature-cell" aria-hidden="true" />;
  }

  return (
    <NumericInput
      value={row[key]}
      placeholder="0.00"
      ariaLabel={`${column.label} row ${index + 1}`}
      data-grid-row={index}
      data-grid-col={colIndex}
      onChange={(value) => onUpdate(row.id, key, value)}
    />
  );
}

/**
 * One editable employee row of the payroll grid.
 */
export default function EmployeeRow({
  row,
  index,
  columns,
  colIndexes,
  onUpdate,
  onRemove,
}) {
  return (
    <tr>
      {columns.map((column) => (
        <td key={column.key} className={column.key === 'name' ? '' : 'td-num'}>
          {renderCell(
            column,
            row,
            index,
            colIndexes[column.key] ?? 0,
            onUpdate,
          )}
        </td>
      ))}
      <td className="row-action no-print">
        <button
          type="button"
          className="row-remove"
          title="Remove employee"
          aria-label={`Remove employee row ${index + 1}`}
          onClick={() => onRemove(row.id)}
        >
          <i className="bi bi-x-lg" />
        </button>
      </td>
    </tr>
  );
}
