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
 * On Android Chrome, an `intent://` URL can open a specific UPI app instead of only the generic chooser.
 * Falls back to plain `upi://` on non-Android or if parsing fails.
 */
export function resolvePayButtonHref(
  upiPayHref: string,
  preferredApp: UpiAppTab | 'ANY'
): string {
  if (typeof navigator === 'undefined' || !/Android/i.test(navigator.userAgent)) {
    return upiPayHref;
  }
  if (preferredApp === 'ANY') return upiPayHref;
  const pkg = UPI_ANDROID_PACKAGES[preferredApp];
  const m = upiPayHref.match(/^upi:\/\/pay\?([\s\S]*)$/i);
  const query = m ? m[1] : '';
  if (!query) return upiPayHref;
  return `intent://pay?${query}#Intent;scheme=upi;package=${pkg};end`;
}
