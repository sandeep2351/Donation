/** Normalize user input to a paypal.me handle, e.g. `sanddepp`. */
export function normalizePayPalHandle(raw: string): string {
  let s = (raw || '').trim();
  if (!s) return '';
  s = s.replace(/^https?:\/\//i, '');
  s = s.replace(/^www\./i, '');
  s = s.replace(/^paypal\.me\//i, '');
  s = s.replace(/[/?#].*$/, '');
  s = s.replace(/^@/, '');
  return s.slice(0, 80);
}

/** Public PayPal.Me link; optional amount in INR. */
export function buildPayPalMeUrl(handle: string, amountRupees?: number): string {
  const h = normalizePayPalHandle(handle);
  if (!h) return 'https://paypal.me/';
  if (amountRupees != null && Number.isFinite(amountRupees) && amountRupees >= 1) {
    return `https://paypal.me/${encodeURIComponent(h)}/${Math.round(amountRupees)}INR`;
  }
  return `https://paypal.me/${encodeURIComponent(h)}`;
}

export function formatPayPalMeLabel(handle: string): string {
  const h = normalizePayPalHandle(handle);
  return h ? `paypal.me/${h}` : '';
}
