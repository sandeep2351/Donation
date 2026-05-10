/** New installs & cleared UPI fields — not a real VPA; Pay stays disabled until admin pastes a real `upi://pay?pa=…` from their bank/app QR. */
export const DEFAULT_UPI_PLACEHOLDER =
  'upi://pay?pa=configure-in-admin.invalid&pn=Replace+in+Admin&cu=INR';

/** Slots that work with every app tab (rotation pool). */
export const UPI_TARGET_ANY = 'ANY' as const;
export const UPI_TARGET_APPS = ['GOOGLE_PAY', 'PHONEPE', 'PAYTM', UPI_TARGET_ANY] as const;
export type UpiQrTargetApp = (typeof UPI_TARGET_APPS)[number];

export function isUnconfiguredPlaceholderUpi(s: string | undefined | null): boolean {
  const t = (s || '').trim().toLowerCase();
  if (!t || !/^upi:\/\//i.test(t)) return true;
  if (t.includes('configure-in-admin')) return true;
  /** Legacy demo seed — not a real address */
  if (t.includes('family@paytm')) return true;
  return false;
}
