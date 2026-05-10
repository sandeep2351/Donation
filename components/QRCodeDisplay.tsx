'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { resolvePayButtonHref, type UpiAppTab } from '@/lib/upi-intent';

interface QRCodeDisplayProps {
  qrCode: {
    code: number;
    displayName?: string;
    imageUrl?: string;
    cloudinaryUrl?: string;
  };
  /** Full `upi://pay?...&am=...` link when amount is valid; omit if amount missing or no base UPI string */
  payHref?: string | null;
  /** Rupees for button label (e.g. 5000) */
  payAmountRupees?: number;
  /** When set on Android, tries to open this app directly via intent:// */
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const href = useMemo(() => {
    if (!payHref || !mounted) return payHref ?? null;
    return resolvePayButtonHref(payHref, preferredUpiApp);
  }, [payHref, preferredUpiApp, mounted]);

  useEffect(() => {
    onQRScanned?.(qrCode.code);
  }, [qrCode.code, onQRScanned]);

  const amountOk = typeof payAmountRupees === 'number' && payAmountRupees >= 100;
  const canPay = Boolean(payHref && amountOk);
  const showPayLink = canPay && href && !blockDesktopPay;

  return (
    <div className="flex w-full max-w-[min(100%,20rem)] flex-col items-center mx-auto">
      <div className="mb-4 w-full rounded-xl border border-border bg-white p-3 sm:p-4 shadow-sm">
        {qrCode.cloudinaryUrl || qrCode.imageUrl ? (
          <div className="mx-auto aspect-square max-h-[min(70vmin,18rem)] w-full max-w-[min(100%,18rem)] bg-white flex items-center justify-center">
            {showPayLink && href ? (
              <a
                href={href}
                onClick={() => onPayClick?.()}
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
      </div>

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
          onClick={() => onPayClick?.()}
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
