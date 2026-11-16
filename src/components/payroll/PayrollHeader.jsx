import TextInput from '../ui/TextInput';

/**
 * Company, division and pay period metadata shown above the payroll grid.
 */
export default function PayrollHeader({ meta, onChange }) {
  return (
    <header className="payroll-header">
      <div className="payroll-header-center">
        <TextInput
          className="header-input header-input-company"
          value={meta.company}
          ariaLabel="Company name"
          onChange={(value) => onChange('company', value)}
        />
        <TextInput
          className="header-input header-input-address"
          value={meta.address}
          ariaLabel="Company address"
          onChange={(value) => onChange('address', value)}
        />
        <TextInput
          className="header-input header-input-division"
          value={meta.division}
          ariaLabel="Division"
          onChange={(value) => onChange('division', value)}
        />
      </div>

      <div className="payroll-period">
        <TextInput
          className="header-input header-input-period-label"
          value={meta.periodLabel}
          ariaLabel="Payroll period label"
          onChange={(value) => onChange('periodLabel', value)}
        />
        <TextInput
          className="header-input header-input-period"
          value={meta.period}
          ariaLabel="Payroll period"
          onChange={(value) => onChange('period', value)}
        />
      </div>
    </header>
  );
}
