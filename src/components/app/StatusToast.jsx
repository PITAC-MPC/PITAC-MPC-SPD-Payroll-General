/**
 * Floating status notification used for success, cancellation and error
 * feedback. It never appears in the printed output.
 */
export default function StatusToast({ status, onClose }) {
  if (!status) return null;

  const { variant = 'primary', message } = status;

  return (
    <div className="toast-container position-fixed bottom-0 end-0 p-3 no-print">
      <div
        className={`toast show align-items-center text-bg-${variant} border-0`}
        role="status"
        aria-live="polite"
      >
        <div className="d-flex">
          <div className="toast-body">{message}</div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            aria-label="Close"
            onClick={onClose}
          />
        </div>
      </div>
    </div>
  );
}
