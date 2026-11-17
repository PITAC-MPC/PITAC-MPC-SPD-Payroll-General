import { formatNumber } from '../../lib/format';
import NumericInput from '../ui/NumericInput';
import TextInput from '../ui/TextInput';

/**
 * The Deduction cell of one employee: a list of (reason, amount) entries,
 * the employee's deduction total, and a control to add another entry.
 */
export default function DeductionCell({
  row,
  index,
  gridCol,
  onAdd,
  onUpdate,
  onRemove,
}) {
  const deductions = row.deductions ?? [];

  return (
    <div className="deduction-cell">
      <div className="deduction-lines">
        {deductions.map((item, itemIndex) => (
          <div className="deduction-line" key={item.id}>
            <TextInput
              value={item.reason}
              placeholder="Reason"
              className="deduction-reason-input"
              ariaLabel={`Deduction reason row ${index + 1} line ${itemIndex + 1}`}
              data-grid-row={itemIndex === 0 ? index : undefined}
              data-grid-col={itemIndex === 0 ? gridCol : undefined}
              onChange={(value) => onUpdate(row.id, item.id, 'reason', value)}
            />
            <NumericInput
              value={item.amount}
              placeholder="0.00"
              className="deduction-amount-input"
              ariaLabel={`Deduction amount row ${index + 1} line ${itemIndex + 1}`}
              onChange={(value) => onUpdate(row.id, item.id, 'amount', value)}
            />
            <button
              type="button"
              className="deduction-remove"
              title="Remove deduction"
              aria-label={`Remove deduction ${itemIndex + 1} of row ${index + 1}`}
              onClick={() => onRemove(row.id, item.id)}
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        ))}
      </div>

      <div className="deduction-total">
        <span className="deduction-total-label">Total</span>
        <span className="deduction-total-value">
          {formatNumber(row.deductionValue)}
        </span>
      </div>

      <button
        type="button"
        className="deduction-add"
        onClick={() => onAdd(row.id)}
      >
        <i className="bi bi-plus-lg" /> Add new deduction
      </button>
    </div>
  );
}
