import { isUnconfiguredPlaceholderUpi } from '@/lib/qr-defaults';

/** Loose VPA check: local-part@psp-handle */
const UPI_ID_RE = /^[\w.\-]{2,80}@[\w.\-]{2,80}$/i;

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
 * On Android Chrome, prefer `ACTION_VIEW` with the full `upi://pay?…` URI as `data`.
 * The older `intent://pay?…#Intent;scheme=upi;package=…` form often fails for Google Pay
 * and can fall back to the Play Store even when the app is installed.
 */
export function resolvePayButtonHref(
  upiPayHref: string,
  preferredApp: UpiAppTab | 'ANY'
): string {
  if (typeof navigator === 'undefined' || !/Android/i.test(navigator.userAgent)) {
    return upiPayHref;
  }
  if (preferredApp === 'ANY') return upiPayHref;
  if (!/^upi:\/\/pay\?/i.test(upiPayHref)) return upiPayHref;
  const pkg = UPI_ANDROID_PACKAGES[preferredApp];
  const encoded = encodeURIComponent(upiPayHref);
  return `intent:#Intent;action=android.intent.action.VIEW;data=${encoded};package=${pkg};end`;
}
