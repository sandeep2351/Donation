'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import CopyValueButton from '@/components/CopyValueButton';
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

  const activatePay = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (!href) return;
      e.preventDefault();
      window.location.assign(href);
      window.setTimeout(() => onPayClick?.(), 600);
    },
    [href, onPayClick]
  );

  const qrImage = qrCode.cloudinaryUrl || qrCode.imageUrl;

  return (
    <div className="flex w-full max-w-full flex-col items-stretch mx-auto">
      <div className="mb-4 w-full rounded-xl border border-border bg-white p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
          <div className="shrink-0 mx-auto sm:mx-0 flex items-center justify-center">
            {qrImage ? (
              <div className="aspect-square w-[min(42vw,9.5rem)] sm:w-[9.5rem] bg-white flex items-center justify-center">
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
                      src={qrImage}
                      alt={`UPI QR code, slot ${qrCode.code} — tap to pay`}
                      className="h-full w-full object-contain cursor-pointer"
                      loading="lazy"
                      sizes="152px"
                    />
                  </a>
                ) : (
                  <img
                    src={qrImage}
                    alt={`UPI QR code, slot ${qrCode.code}`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                    sizes="152px"
                  />
                )}
              </div>
            ) : (
              <div className="aspect-square w-[min(42vw,9.5rem)] sm:w-[9.5rem] flex items-center justify-center border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground text-xs text-center px-2 text-pretty">QR will appear here</p>
              </div>
            )}
          </div>

          {displayUpiId ? (
            <div className="flex flex-col gap-2 flex-1 min-w-0 justify-center">
              <div
                className="rounded-lg border-2 border-primary/40 bg-primary/10 px-3 py-2.5 text-center shadow-sm min-w-0"
                role="status"
                aria-label={`UPI ID ${displayUpiId}`}
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-primary/80 mb-0.5">
                  UPI ID
                </p>
                <div className="flex items-center justify-center gap-2 min-w-0">
                  <p className="text-sm font-bold font-mono text-primary break-all select-all leading-snug">
                    {displayUpiId}
                  </p>
                  <CopyValueButton value={displayUpiId} label="UPI ID" />
                </div>
                <p className="mt-1 text-[0.65rem] text-muted-foreground text-pretty">Tap copy or scan QR on the left</p>
              </div>

              <div className="rounded-lg border border-amber-200/90 bg-amber-50/90 px-3 py-2.5 text-left text-[0.65rem] text-amber-950 min-w-0">
                <p className="font-semibold text-amber-900 mb-1 text-xs">Having trouble?</p>
                <ul className="space-y-1 list-disc pl-3.5 text-pretty leading-snug marker:text-amber-700">
                  <li>
                    QR failed? Pay via <strong className="font-semibold">UPI ID</strong> above.
                  </li>
                  <li>
                    UPI ID failed? Use mobile
                    {mobileFromUpi ? (
                      <span className="inline-flex items-center gap-1 align-middle ml-0.5">
                        <span className="font-bold font-mono text-amber-900 bg-amber-100/80 border border-amber-300/80 rounded px-1 select-all">
                          {mobileFromUpi}
                        </span>
                        <CopyValueButton
                          value={mobileFromUpi}
                          label="mobile number"
                          className="border-amber-300/80 text-amber-900 hover:bg-amber-100/80"
                        />
                      </span>
                    ) : (
                      ' (digits before @, ignore -2)'
                    )}
                    .
                  </li>
                </ul>
              </div>
            </div>
          ) : null}
        </div>
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
        <div className="w-full space-y-2 rounded-xl border border-border bg-muted/50 px-3 py-3 text-center">
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
          className="flex items-center justify-center gap-2 min-h-12 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-95 transition-opacity text-sm font-semibold w-full touch-manipulation shadow-sm"
        >
          <ExternalLink className="w-4 h-4 shrink-0" aria-hidden />
          Pay ₹{payAmountRupees!.toLocaleString('en-IN')}
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 min-h-12 px-4 py-3 rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground text-sm font-medium w-full cursor-not-allowed"
        >
          Pay (enter ₹100+ and set UPI ID or full link in admin)
        </button>
      )}
    </div>
  );
}
