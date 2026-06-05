import { isUnconfiguredPlaceholderUpi } from '@/lib/qr-defaults';

/** Loose VPA check: local-part@psp-handle (dots/plus common in bank VPAs) */
const UPI_ID_RE = /^[\w.+\-]{2,99}@[\w.\-]{2,99}$/i;

/** `pa` from a stored `upi://pay?…` string, when present and valid. */
export function extractVpaFromUpiPayUri(uri: string | undefined | null): string | null {
  const s = (uri || '').trim();
  if (!s || !/^upi:\/\/pay/i.test(s)) return null;
  const qIndex = s.indexOf('?');
  const qs = qIndex >= 0 ? s.slice(qIndex + 1) : '';
  const pa = new URLSearchParams(qs).get('pa')?.trim();
  if (pa && UPI_ID_RE.test(pa) && !/configure-in-admin/i.test(pa)) return pa;
  return null;
}

/**
 * Admin saves sometimes put a VPA in the UPI-string field, or paste a full URI into UPI ID.
 * Normalize before validation so toggling active / re-saving does not fail on field mix-ups.
 */
export function normalizeQrUpiPatch(input: {
  upiId?: string;
  upiString?: string;
}): { upiId: string; upiString: string } {
  let upiId = (input.upiId ?? '').trim();
  let upiString = (input.upiString ?? '').trim();

  if (/^upi:\/\//i.test(upiId)) {
    if (!/^upi:\/\//i.test(upiString)) upiString = upiId;
    upiId = extractVpaFromUpiPayUri(upiId) || '';
  }

  if (upiString && !/^upi:\/\//i.test(upiString) && UPI_ID_RE.test(upiString)) {
    if (!upiId) upiId = upiString;
    upiString = '';
  }

  return { upiId, upiString };
}

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

/** VPA to show donors (plain UPI ID field, or `pa` from a full UPI string). */
export function resolveDisplayUpiId(qr: {
  upiId?: string | null;
  upiString?: string | null;
}): string | null {
  const id = (qr.upiId || '').trim();
  if (id && UPI_ID_RE.test(id) && !/configure-in-admin/i.test(id)) return id;

  const s = (qr.upiString || '').trim();
  if (!s || isUnconfiguredPlaceholderUpi(s) || !/^upi:\/\/pay/i.test(s)) return null;

  const qIndex = s.indexOf('?');
  const qs = qIndex >= 0 ? s.slice(qIndex + 1) : '';
  const pa = new URLSearchParams(qs).get('pa')?.trim();
  if (pa && UPI_ID_RE.test(pa) && !/configure-in-admin/i.test(pa)) return pa;

  return null;
}

/**
 * Indian mobile from a VPA local part, e.g. `8500669989@ybl`, `8500669989-2@ybl`, `918500669989-1@paytm`.
 * Ignores common `-1` / `-2` suffixes after the 10-digit number.
 */
export function extractMobileFromUpiId(upiId: string | null | undefined): string | null {
  const id = (upiId || '').trim();
  if (!id) return null;
  const local = id.split('@')[0]?.trim();
  if (!local) return null;

  const tenWithOptionalSuffix = local.match(/^(\d{10})(?:-\d+)?$/);
  if (tenWithOptionalSuffix) return tenWithOptionalSuffix[1];

  const with91 = local.match(/^91(\d{10})(?:-\d+)?$/);
  if (with91) return with91[1];

  if (/^\d+$/.test(local)) {
    if (local.length === 10) return local;
    if (local.length === 12 && local.startsWith('91')) return local.slice(2);
  }

  return null;
}

/** Unique UPI IDs across all configured QR slots (for donor selection). */
export function collectUpiIdsFromQrSlots(
  slots: Array<{ upiId?: string | null; upiString?: string | null }>
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const slot of slots) {
    const id = resolveDisplayUpiId(slot);
    if (id && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

/** Unique 10-digit mobiles derived from slot UPI IDs (for donor selection). */
export function collectMobilesFromQrSlots(
  slots: Array<{ upiId?: string | null; upiString?: string | null }>
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const slot of slots) {
    const id = resolveDisplayUpiId(slot);
    const mobile = extractMobileFromUpiId(id);
    if (mobile && !seen.has(mobile)) {
      seen.add(mobile);
      out.push(mobile);
    }
  }
  return out;
}

/** Android package names (reference for native apps; donate page uses manual pay, not deep links). */
export const UPI_ANDROID_PACKAGES = {
  PHONEPE: 'com.phonepe.app',
  GOOGLE_PAY: 'com.google.android.apps.nbu.paisa.user',
  PAYTM: 'net.one97.paytm',
} as const;

export type UpiAppTab = keyof typeof UPI_ANDROID_PACKAGES;

/** Whether a QR slot has a real VPA donors can pay to manually (UPI ID field or `pa` in UPI string). */
export function qrSlotHasPayableUpiId(qr: {
  upiId?: string | null;
  upiString?: string | null;
}): boolean {
  return resolveDisplayUpiId(qr) !== null;
}

export type UpiManualPayApp = UpiAppTab | 'ANY';

const MANUAL_PAY_STEPS: Record<UpiAppTab, string[]> = {
  PHONEPE: [
    'Open PhonePe → Pay / Send → UPI ID (or scan the QR above with PhonePe).',
    'Paste the UPI ID, enter the amount shown here, note “Donation”, then pay.',
    'If UPI ID is blocked, pay to the mobile number shown (same account).',
  ],
  GOOGLE_PAY: [
    'Open Google Pay → New payment → UPI ID (or scan the QR above).',
    'Paste the UPI ID, enter the amount shown here, note “Donation”, then pay.',
  ],
  PAYTM: [
    'Open Paytm → Scan & Pay (QR above) or Pay → UPI ID.',
    'Paste the UPI ID, enter the amount shown here, note “Donation”, then pay.',
  ],
};

/** Step-by-step copy for personal (non-merchant) VPAs — avoids blocked `upi://pay` intents. */
export function getManualUpiPaySteps(app: UpiManualPayApp): string[] {
  if (app === 'ANY') {
    return [
      'Scan the QR with your UPI app, or copy the UPI ID and pay manually inside the app.',
      'Enter the amount shown on this page and add note “Donation”.',
      'Website “Pay” links are not used — PhonePe and other apps block them for personal accounts.',
    ];
  }
  return MANUAL_PAY_STEPS[app];
}

/** Clipboard text donors can paste into notes or share with family. */
export function buildManualPaymentClipboardText(input: {
  upiId: string;
  amountRupees?: number;
  mobile?: string | null;
  payeeName?: string;
}): string {
  const lines = [
    input.payeeName ? `Payee: ${input.payeeName}` : '',
    `UPI ID: ${input.upiId}`,
    input.mobile ? `Mobile: ${input.mobile}` : '',
    input.amountRupees && input.amountRupees >= 1
      ? `Amount: ₹${input.amountRupees.toLocaleString('en-IN')}`
      : '',
    'Note: Donation',
  ].filter(Boolean);
  return lines.join('\n');
}

/**
 * @deprecated Personal VPAs are blocked by PhonePe/GPay for unsigned `upi://pay` intents.
 * Donors should scan QR or copy UPI ID instead. Kept for admin/reference only.
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
  const original = new URLSearchParams(qs);

  /**
   * IMPORTANT:
   * Many QR-generated UPI URIs contain fixed `tr`/`tid`/`sign`/`mode` fields.
   * Reusing those across multiple payments is a common trigger for “declined for security reasons”
   * in some apps (notably PhonePe). So we rebuild a minimal URI with only safe fields.
   */
  const pa = original.get('pa')?.trim() || '';
  if (!pa || /configure-in-admin/i.test(pa)) return null;

  const pn = (original.get('pn') || '').trim().slice(0, 80) || 'Payee';
  const cu = (original.get('cu') || '').trim() || 'INR';
  const tn = transactionNote.trim().slice(0, 80) || 'Donation';

  const params = new URLSearchParams();
  params.set('pa', pa);
  params.set('pn', pn);
  params.set('cu', cu);
  params.set('am', String(Math.round(amountRupees)));
  params.set('tn', tn);

  return `${path}?${params.toString()}`;
}
