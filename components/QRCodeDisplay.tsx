'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import {
  extractMobileFromUpiId,
  resolveDisplayUpiId,
  resolvePayButtonHref,
  type UpiAppTab,
} from '@/lib/upi-intent';
import { upiSlotAppLabel, type UpiQrTargetApp } from '@/lib/qr-defaults';

interface QRCodeDisplayProps {
  qrCode: {
    code: number;
    displayName?: string;
    imageUrl?: string;
    cloudinaryUrl?: string;
    /** Matches admin “UPI app” (ANY or a specific app). */
    upiTargetApp?: UpiQrTargetApp;
    bankName?: string;
    upiId?: string;
    upiString?: string;
  };
  /** Full `upi://pay?...&am=...` link when amount is valid; omit if amount missing or no base UPI string */
  payHref?: string | null;
  /** Rupees for button label (e.g. 5000) */
  payAmountRupees?: number;
  /** Legacy: tabs map to preferred app; href stays plain `upi://` for reliability on Android */
  preferredUpiApp?: UpiAppTab | 'ANY';
  onPayClick?: () => void;
  onQRScanned?: (codeNumber: number) => void;
  /** Laptop / desktop: do not use upi:// link (opens wrong app, e.g. WhatsApp on Mac) */
  blockDesktopPay?: boolean;
}

export default function QRCodeDisplay({
  qrCode,
  payHref,
  payAmountRupees,
  preferredUpiApp = 'ANY',
  onPayClick,
  onQRScanned,
  blockDesktopPay = false,
}: QRCodeDisplayProps) {
  const ta = qrCode.upiTargetApp;
  const typeLabel = ta && ta !== 'ANY' ? upiSlotAppLabel(ta) : '';
  const bankLine = (qrCode.bankName || '').trim();
  const displayUpiId = useMemo(
    () => resolveDisplayUpiId({ upiId: qrCode.upiId, upiString: qrCode.upiString }),
    [qrCode.upiId, qrCode.upiString]
  );
  const mobileFromUpi = useMemo(() => extractMobileFromUpiId(displayUpiId), [displayUpiId]);
  const href = useMemo(
    () => (payHref ? resolvePayButtonHref(payHref, preferredUpiApp) : ''),
    [payHref, preferredUpiApp]
  );

  useEffect(() => {
    onQRScanned?.(qrCode.code);
  }, [qrCode.code, onQRScanned]);

  const amountOk = typeof payAmountRupees === 'number' && payAmountRupees >= 100;
  const canPay = Boolean(payHref && amountOk);
  const showPayLink = canPay && Boolean(href) && !blockDesktopPay;

  /**
   * Start UPI navigation first. Calling `onPayClick` (parent setState) before `location.assign`
   * re-renders the page and can cancel the custom-scheme handoff — user only sees "finish payment"
   * with no app opening. Defer the follow-up UI until after the browser has tried to leave.
   */
  const activatePay = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!href) return;
      e.preventDefault();
      window.location.assign(href);
      window.setTimeout(() => onPayClick?.(), 600);
    },
    [href, onPayClick]
  );

  return (
    <div className="flex w-full max-w-[min(100%,20rem)] flex-col items-center mx-auto">
      <div className="mb-4 w-full rounded-xl border border-border bg-white p-3 sm:p-4 shadow-sm">
        {qrCode.cloudinaryUrl || qrCode.imageUrl ? (
          <div className="mx-auto aspect-square max-h-[min(70vmin,18rem)] w-full max-w-[min(100%,18rem)] bg-white flex items-center justify-center">
            {showPayLink && href ? (
              <a
                href={href}
                target="_top"
                onClick={activatePay}
                className="block h-full w-full rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary touch-manipulation"
                aria-label={
                  amountOk && payAmountRupees
                    ? `Pay ${payAmountRupees.toLocaleString('en-IN')} rupees with UPI`
                    : 'Pay with UPI'
                }
              >
                <img
                  src={qrCode.cloudinaryUrl || qrCode.imageUrl}
                  alt={`UPI QR code, slot ${qrCode.code} — tap to pay`}
                  className="h-full w-full object-contain cursor-pointer"
                  loading="lazy"
                  sizes="(max-width: 640px) 85vw, 288px"
                />
              </a>
            ) : (
              <img
                src={qrCode.cloudinaryUrl || qrCode.imageUrl}
                alt={`UPI QR code, slot ${qrCode.code}`}
                className="h-full w-full object-contain"
                loading="lazy"
                sizes="(max-width: 640px) 85vw, 288px"
              />
            )}
          </div>
        ) : (
          <div className="mx-auto aspect-square max-h-[min(70vmin,18rem)] w-full max-w-[min(100%,18rem)] bg-white flex items-center justify-center">
            <p className="text-muted-foreground text-sm text-center px-2 text-pretty">QR Code will be displayed here</p>
          </div>
        )}

        {displayUpiId ? (
          <div
            className="mt-3 w-full rounded-lg border-2 border-primary/40 bg-primary/10 px-3 py-3 text-center shadow-sm"
            role="status"
            aria-label={`UPI ID ${displayUpiId}`}
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-primary/80 mb-1">
              UPI ID
            </p>
            <p className="text-base sm:text-lg font-bold font-mono text-primary break-all select-all leading-snug">
              {displayUpiId}
            </p>
            <p className="mt-1.5 text-[0.7rem] text-muted-foreground text-pretty">
              Copy this ID or scan the QR above to pay
            </p>
          </div>
        ) : null}

        {displayUpiId ? (
          <div className="mt-3 w-full rounded-lg border border-amber-200/90 bg-amber-50/90 px-3 py-3 text-left text-xs text-amber-950">
            <p className="font-semibold text-amber-900 mb-2">Having trouble paying?</p>
            <ul className="space-y-2 list-disc pl-4 text-pretty leading-relaxed marker:text-amber-700">
              <li>
                If the <strong className="font-semibold">QR scan does not work</strong>, open PhonePe, Google Pay, or
                Paytm and pay using the <strong className="font-semibold">UPI ID</strong> shown above (paste it in Pay
                to UPI ID).
              </li>
              <li>
                If the <strong className="font-semibold">UPI ID also fails</strong>, use the{' '}
                <strong className="font-semibold">10-digit mobile</strong> at the start of the ID (ignore any{' '}
                <strong className="font-semibold">-2</strong> or similar suffix before @) — pay to that number directly
                in your UPI app.
                {mobileFromUpi ? (
                  <>
                    {' '}
                    For this account:{' '}
                    <span className="inline-block font-bold font-mono text-base text-amber-900 bg-amber-100/80 border border-amber-300/80 rounded px-1.5 py-0.5 select-all">
                      {mobileFromUpi}
                    </span>
                  </>
                ) : null}
              </li>
            </ul>
          </div>
        ) : null}
      </div>

      {(typeLabel || bankLine) && (
        <div className="mb-3 w-full text-center text-xs text-muted-foreground space-y-0.5 text-pretty">
          {typeLabel ? (
            <p>
              <span className="text-foreground/80 font-medium">UPI app:</span> {typeLabel}
            </p>
          ) : null}
          {bankLine ? (
            <p>
              <span className="text-foreground/80 font-medium">Bank:</span> {bankLine}
            </p>
          ) : null}
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground mb-4 text-pretty">
        Tap the QR on your phone to pay, or use the button below — both open your UPI app with this amount.
      </p>

      {blockDesktopPay && canPay ? (
        <div className="w-full max-w-[min(100%,20rem)] space-y-2 rounded-xl border border-border bg-muted/50 px-3 py-3 text-center">
          <p className="text-sm font-medium text-foreground">Pay works on your phone</p>
          <p className="text-xs text-muted-foreground text-pretty leading-relaxed">
            Laptop browsers don&apos;t run UPI. Chrome on Mac may even open the wrong app (e.g. WhatsApp). Open this
            page on <strong className="text-foreground">Android or iPhone</strong> and tap Pay, or scan the QR with
            PhonePe / any UPI app on your phone.
          </p>
        </div>
      ) : showPayLink ? (
        <a
          href={href}
          target="_top"
          onClick={activatePay}
          className="flex items-center justify-center gap-2 min-h-12 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-95 transition-opacity text-sm font-semibold w-full max-w-[min(100%,20rem)] touch-manipulation shadow-sm"
        >
          <ExternalLink className="w-4 h-4 shrink-0" aria-hidden />
          Pay ₹{payAmountRupees!.toLocaleString('en-IN')}
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 min-h-12 px-4 py-3 rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground text-sm font-medium w-full max-w-[min(100%,20rem)] cursor-not-allowed"
        >
          Pay (enter ₹100+ and set UPI ID or full link in admin)
        </button>
      )}
    </div>
  );
}
