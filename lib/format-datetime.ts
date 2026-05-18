/** e.g. 18/05/2026@2:50pm (Asia/Kolkata) */
export function formatDateTimeIST(input: Date | string | number | null | undefined): string {
  if (input == null || input === '') return '—';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '—';

  const parts = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  const day = get('day');
  const month = get('month');
  const year = get('year');
  const hour = get('hour');
  const minute = get('minute');
  const dayPeriod = get('dayPeriod').toLowerCase();

  return `${day}/${month}/${year}@${hour}:${minute}${dayPeriod}`;
}
