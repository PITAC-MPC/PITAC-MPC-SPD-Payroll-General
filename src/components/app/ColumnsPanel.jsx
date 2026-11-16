import { MONEY_COLUMNS } from '../../lib/columns';

/**
 * Dropdown panel that toggles the optional money columns of the payroll grid
 * so the sheet can be trimmed to match a specific payroll form.
 */
export default function ColumnsPanel({ open, visibility, onToggle, onClose }) {
  if (!open) return null;

  return (
    <>
      <div className="columns-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="columns-panel" role="dialog" aria-label="Column options">
        <div className="columns-panel-title">Visible columns</div>
        {MONEY_COLUMNS.map((column) => (
          <label className="columns-panel-item" key={column.key}>
            <input
              type="checkbox"
              className="form-check-input"
              checked={visibility[column.key] !== false}
              onChange={() => onToggle(column.key)}
            />
            <span>{column.label}</span>
          </label>
        ))}
        <p className="columns-panel-note">
          Net pay, net pay total and signature are always printed.
        </p>
      </div>
    </>
  );
}
