/**
 * Plain text input used for names, titles and header metadata.
 */
export default function TextInput({
  value,
  onChange,
  placeholder = '',
  className = '',
  disabled = false,
  ariaLabel,
  ...rest
}) {
  return (
    <input
      type="text"
      autoComplete="off"
      className={`form-control table-input ${className}`.trim()}
      value={value ?? ''}
      placeholder={placeholder}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(event) => onChange?.(event.target.value)}
      onFocus={(event) => event.target.select?.()}
      {...rest}
    />
  );
}
