import { useCallback, useEffect, useMemo, useState } from 'react';
import AppBar from './components/app/AppBar';
import ColumnsPanel from './components/app/ColumnsPanel';
import StatusToast from './components/app/StatusToast';
import EmployeesSection from './components/payroll/EmployeesSection';
import PayrollHeader from './components/payroll/PayrollHeader';
import SignaturesSection from './components/payroll/SignaturesSection';
import useGridNavigation from './hooks/useGridNavigation';
import usePayroll from './hooks/usePayroll';
import { computePayroll } from './lib/calculations';
import { buildVisibleColumns } from './lib/columns';
import { buildPdfFileName } from './lib/format';
import PrintPayroll from './print/PrintPayroll';

export default function App() {
  const {
    state,
    updateMeta,
    toggleColumn,
    updateEmployee,
    addEmployee,
    removeEmployee,
    addDeduction,
    updateDeduction,
    removeDeduction,
    updateSignatory,
    reset,
  } = usePayroll();

  const [status, setStatus] = useState(null);
  const [savingPdf, setSavingPdf] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);

  const { rows, totals } = useMemo(() => computePayroll(state), [state]);
  const columns = useMemo(
    () => buildVisibleColumns(state.columns),
    [state.columns],
  );

  useEffect(() => {
    if (!status) return undefined;

    const timer = setTimeout(() => setStatus(null), 6000);
    return () => clearTimeout(timer);
  }, [status]);

  const getRowCount = useCallback(() => rows.length, [rows.length]);
  const getColumnCount = useCallback(
    () =>
      columns.filter(
        (column) => column.key !== 'netPay' && column.key !== 'signature',
      ).length,
    [columns],
  );

  useGridNavigation({
    getRowCount,
    getColumnCount,
    onAddRow: addEmployee,
  });

  const handleNewPayroll = () => {
    const shouldReset = window.confirm(
      'Start a new payroll? The current draft will be cleared.',
    );

    if (!shouldReset) return;

    reset();
    setStatus({ variant: 'primary', message: 'New payroll started.' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrint = async () => {
    if (!window.payrollApi?.print) {
      setStatus({
        variant: 'danger',
        message: 'Printing is only available in the desktop app.',
      });
      return;
    }

    try {
      const result = await window.payrollApi.print();
      const failureReason = String(result?.failureReason || '');

      if (result?.success) {
        setStatus({
          variant: 'success',
          message: 'Payroll sent to the printer.',
        });
      } else if (failureReason.toLowerCase().includes('cancel')) {
        setStatus({ variant: 'secondary', message: 'Printing canceled.' });
      } else {
        setStatus({
          variant: 'danger',
          message: failureReason || 'Unable to print the payroll.',
        });
      }
    } catch (error) {
      setStatus({
        variant: 'danger',
        message: error?.message || 'Unable to print the payroll.',
      });
    }
  };

  const handleSavePdf = async () => {
    if (savingPdf) return;

    if (!window.payrollApi?.savePdf) {
      setStatus({
        variant: 'danger',
        message: 'PDF saving is only available in the desktop app.',
      });
      return;
    }

    setSavingPdf(true);

    try {
      const result = await window.payrollApi.savePdf(
        buildPdfFileName(state.meta.period),
      );

      if (result?.canceled) {
        setStatus({ variant: 'secondary', message: 'PDF save canceled.' });
      } else if (result?.success) {
        setStatus({
          variant: 'success',
          message: 'Payroll saved as a PDF.',
        });
      } else {
        setStatus({
          variant: 'danger',
          message: result?.error || 'Unable to save the PDF.',
        });
      }
    } catch (error) {
      setStatus({
        variant: 'danger',
        message: error?.message || 'Unable to save the PDF.',
      });
    } finally {
      setSavingPdf(false);
    }
  };

  return (
    <>
      <div className="app-shell">
        <AppBar
          onNew={handleNewPayroll}
          onPrint={handlePrint}
          onSavePdf={handleSavePdf}
          savingPdf={savingPdf}
          columnsOpen={columnsOpen}
          onToggleColumns={() => setColumnsOpen((open) => !open)}
        />

        <main className="payslip-wrap">
          <article className="payslip-sheet">
            <PayrollHeader meta={state.meta} onChange={updateMeta} />

            <hr className="payslip-divider" />

            <EmployeesSection
              rows={rows}
              totals={totals}
              columns={columns}
              onUpdate={updateEmployee}
              onAdd={addEmployee}
              onRemove={removeEmployee}
              onAddDeduction={addDeduction}
              onUpdateDeduction={updateDeduction}
              onRemoveDeduction={removeDeduction}
            />

            <SignaturesSection
              signatories={state.signatories}
              onUpdate={updateSignatory}
            />
          </article>
        </main>

        <ColumnsPanel
          open={columnsOpen}
          visibility={state.columns}
          onToggle={toggleColumn}
          onClose={() => setColumnsOpen(false)}
        />

        <StatusToast status={status} onClose={() => setStatus(null)} />
      </div>

      <PrintPayroll
        meta={state.meta}
        rows={rows}
        totals={totals}
        columns={columns}
        signatories={state.signatories}
      />
    </>
  );
}
