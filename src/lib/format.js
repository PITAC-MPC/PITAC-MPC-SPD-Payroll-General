const pesoFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function toNumber(value) {
  if (value === null || value === undefined || value === '') return 0;

  const number =
    typeof value === 'number'
      ? value
      : Number(String(value).replace(/,/g, '').trim());

  return Number.isFinite(number) ? number : 0;
}

export function round2(value) {
  return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
}

export function formatPeso(value) {
  return pesoFormatter.format(toNumber(value));
}

export function formatNumber(value) {
  return toNumber(value).toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function todayISO() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function sanitizeIntegerString(value) {
  return String(value ?? '').replace(/\D+/g, '');
}

export function sanitizeDecimalString(value) {
  const cleaned = String(value ?? '').replace(/[^\d.]/g, '');

  if (!cleaned) return '';

  const [whole, ...decimalParts] = cleaned.split('.');
  const normalizedWhole = whole.replace(/^0+(?=\d)/, '');

  if (decimalParts.length === 0) {
    return normalizedWhole;
  }

  const decimals = decimalParts.join('').slice(0, 2);
  return `${normalizedWhole || '0'}.${decimals}`;
}

export function sanitizeText(value, maxLength = 80) {
  return String(value ?? '').slice(0, maxLength);
}

export function buildPdfFileName(period) {
  const safePeriod = sanitizeText(period)
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);

  return `Payroll${safePeriod ? ` - ${safePeriod}` : ''}.pdf`;
}
