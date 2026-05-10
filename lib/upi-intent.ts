import { isUnconfiguredPlaceholderUpi } from '@/lib/qr-defaults';

/** Loose VPA check: local-part@psp-handle (dots/plus common in bank VPAs) */
const UPI_ID_RE = /^[\w.+\-]{2,99}@[\w.\-]{2,99}$/i;

/**
 * Build a minimal `upi://pay?pa=&pn=&cu=INR` base (no amount) from VPA + payee label.
 */
export function buildBaseUpiUriFromVpa(
  upiId: string | undefined | null,
  payeeDisplayName: string | undefined | null
): string | null {
  const id = (upiId || '').trim();
  if (!id || !UPI_ID_RE.test(id)) return null;
  if (/configure-in-admin/i.test(id)) return null;
  const pn = (payeeDisplayName || '').trim().slice(0, 80) || 'Payee';
  return `upi://pay?pa=${encodeURIComponent(id)}&pn=${encodeURIComponent(pn)}&cu=INR`;
}

/**
 * Prefer a stored full UPI string when valid; otherwise synthesize from {@link upiId} + {@link displayName}.
 */
export function resolveQrBaseUpiForPayment(qr: {
  upiString?: string | null;
  upiId?: string | null;
  displayName?: string | null;
}): string | null {
  const s = (qr.upiString || '').trim();
  if (s && !isUnconfiguredPlaceholderUpi(s) && /^upi:\/\/pay/i.test(s)) return s;
  return buildBaseUpiUriFromVpa(qr.upiId, qr.displayName);
}

/**
 * Build an NPCI UPI intent URI with amount and note for deep-linking into UPI apps (PhonePe, GPay, Paytm, etc.).
 * @param baseUpiString Stored value from DB, e.g. `upi://pay?pa=merchant@upi&pn=Name&cu=INR`
 * @param amountRupees Whole rupees (not paise)
 */
export function buildUpiPayUri(
  baseUpiString: string | undefined | null,
  amountRupees: number,
  transactionNote = 'Donation'
): string | null {
  const base = (baseUpiString || '').trim();
  if (isUnconfiguredPlaceholderUpi(base)) return null;
  if (!/^upi:\/\/pay/i.test(base)) return null;
  if (!Number.isFinite(amountRupees) || amountRupees < 1) return null;

  const qIndex = base.indexOf('?');
  const path = qIndex >= 0 ? base.slice(0, qIndex) : base;
  const qs = qIndex >= 0 ? base.slice(qIndex + 1) : '';
  const params = new URLSearchParams(qs);

  params.set('am', String(Math.round(amountRupees)));
  if (!params.get('cu')) params.set('cu', 'INR');
  const tn = transactionNote.trim().slice(0, 80) || 'Donation';
  params.set('tn', tn);

  return `${path}?${params.toString()}`;
}

/** Android package names to bias the system toward opening a specific UPI app (optional). */
export const UPI_ANDROID_PACKAGES = {
  PHONEPE: 'com.phonepe.app',
  GOOGLE_PAY: 'com.google.android.apps.nbu.paisa.user',
  PAYTM: 'net.one97.paytm',
} as const;

export type UpiAppTab = keyof typeof UPI_ANDROID_PACKAGES;

/**
 * Returns the href used for Pay / QR tap. We keep plain `upi://pay?…` everywhere: packaged
 * `intent:#Intent;…;package=…` links often do nothing in Chrome, Samsung Internet, and in-app
 * browsers. The OS still shows PhonePe / GPay / Paytm in the chooser for the same link.
 */
export function resolvePayButtonHref(
  upiPayHref: string,
  _preferredApp: UpiAppTab | 'ANY'
): string {
  void _preferredApp;
  return upiPayHref;
}
