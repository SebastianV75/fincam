export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShortDate(value: string | Date) {
  const date = typeof value === 'string' ? new Date(`${value}T12:00:00`) : value;

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function formatMonthYear(value: string | Date) {
  const date = typeof value === 'string' ? new Date(`${value}T12:00:00`) : value;

  return new Intl.DateTimeFormat('es-MX', {
    month: 'short',
    year: 'numeric',
  }).format(date);
}
