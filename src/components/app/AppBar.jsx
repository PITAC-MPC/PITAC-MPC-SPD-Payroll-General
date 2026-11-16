/**
 * Top application toolbar with the payroll actions.
 */
export default function AppBar({
  onNew,
  onPrint,
  onSavePdf,
  savingPdf,
  columnsOpen,
  onToggleColumns,
}) {
  return (
    <header className="app-bar">
      <div className="app-bar-inner">
        <div className="app-brand">
          <span className="app-brand-icon" aria-hidden="true">
            <i className="bi bi-receipt" />
          </span>
          <span className="app-brand-copy">
            <span className="app-brand-title">PITAC Payroll General</span>
            <span className="app-brand-subtitle">
              PITAC-MPC Special Project Division
            </span>
          </span>
        </div>

        <div className="app-actions">
          <div className="dropdown">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm dropdown-toggle"
              aria-expanded={columnsOpen}
              onClick={onToggleColumns}
            >
              <i className="bi bi-layout-three-columns" /> Columns
            </button>
          </div>

          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={onNew}
          >
            <i className="bi bi-file-earmark-plus" /> New Payroll
          </button>

          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={onPrint}
          >
            <i className="bi bi-printer" /> Print
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={savingPdf}
            onClick={onSavePdf}
          >
            {savingPdf ? (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              />
            ) : (
              <i className="bi bi-file-earmark-pdf" />
            )}{' '}
            Save as PDF
          </button>
        </div>
      </div>
    </header>
  );
}
