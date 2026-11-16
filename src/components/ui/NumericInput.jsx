import { sanitizeDecimalString } from '../../lib/format';

/**
 * Numeric text input that only accepts two-decimal currency values.
 */
export default function NumericInput({
  value,
  onChange,
  placeholder = '',
  className = '',
  disabled = false,
  ariaLabel,
  ...rest
}) {
  const handleChange = (event) => {
    onChange?.(sanitizeDecimalString(event.target.value));
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      className={`form-control table-input ${className}`.trim()}
      value={value ?? ''}
      placeholder={placeholder}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={handleChange}
      onFocus={(event) => event.target.select?.()}
      {...rest}
    />
  );
}
