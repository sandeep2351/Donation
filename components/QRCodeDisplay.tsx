'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { ClipboardList } from 'lucide-react';
import CopyValueButton from '@/components/CopyValueButton';
import {
  extractMobileFromUpiId,
  getManualUpiPaySteps,
  resolveDisplayUpiId,
  type UpiAppTab,
} from '@/lib/upi-intent';
import { upiSlotAppLabel, type UpiQrTargetApp } from '@/lib/qr-defaults';
import { toast } from '@/hooks/use-toast';

interface QRCodeDisplayProps {
  qrCode: {
    code: number;
    displayName?: string;
    imageUrl?: string;
    cloudinaryUrl?: string;
    upiTargetApp?: UpiQrTargetApp;
    bankName?: string;
    upiId?: string;
    upiString?: string;
  };
  /** Rupees for copy / instructions (minimum ₹100 on donate page) */
  payAmountRupees?: number;
  /** Which UPI app tab the donor selected — drives step-by-step copy */
  preferredUpiApp?: UpiAppTab | 'ANY';
  onPaymentStarted?: () => void;
  onQRScanned?: (codeNumber: number) => void;
}

export default function QRCodeDisplay({
  qrCode,
  payAmountRupees,
  preferredUpiApp = 'ANY',
  onPaymentStarted,
  onQRScanned,
}: QRCodeDisplayProps) {
  const ta = qrCode.upiTargetApp;
  const typeLabel = ta && ta !== 'ANY' ? upiSlotAppLabel(ta) : '';
  const bankLine = (qrCode.bankName || '').trim();
  const displayUpiId = useMemo(
    () => resolveDisplayUpiId({ upiId: qrCode.upiId, upiString: qrCode.upiString }),
    [qrCode.upiId, qrCode.upiString]
  );
  const mobileFromUpi = useMemo(() => extractMobileFromUpiId(displayUpiId), [displayUpiId]);
  const amountOk = typeof payAmountRupees === 'number' && payAmountRupees >= 100;
  const amountLabel =
    amountOk && payAmountRupees ? payAmountRupees.toLocaleString('en-IN') : null;
  const steps = useMemo(() => getManualUpiPaySteps(preferredUpiApp), [preferredUpiApp]);

  useEffect(() => {
    onQRScanned?.(qrCode.code);
  }, [qrCode.code, onQRScanned]);

  const copyUpiId = useCallback(async () => {
    if (!displayUpiId) return;
    try {
      await navigator.clipboard.writeText(displayUpiId);
      toast({
        title: 'UPI ID copied',
        description: 'Paste it in PhonePe / GPay → Pay → UPI ID, then enter the amount.',
        duration: 5000,
      });
      onPaymentStarted?.();
    } catch {
      toast({
        title: 'Could not copy',
        description: 'Select the UPI ID above and copy manually.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [displayUpiId, onPaymentStarted]);

  const qrImage = qrCode.cloudinaryUrl || qrCode.imageUrl;

  return (
    <div className="flex w-full max-w-full flex-col items-stretch mx-auto">
      <div className="mb-4 w-full rounded-xl border border-border bg-white p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-stretch gap-3">
          <div className="shrink-0 mx-auto sm:mx-0 flex items-center justify-center">
            {qrImage ? (
              <div className="aspect-square w-[min(42vw,9.5rem)] sm:w-[9.5rem] bg-white flex items-center justify-center">
                <img
                  src={qrImage}
                  alt={`UPI QR code, slot ${qrCode.code} — scan with PhonePe, GPay, or any UPI app`}
                  className="h-full w-full object-contain"
                  loading="lazy"
                  sizes="152px"
                />
              </div>
            ) : (
              <div className="aspect-square w-[min(42vw,9.5rem)] sm:w-[9.5rem] flex items-center justify-center border border-dashed border-border rounded-lg">
                <p className="text-muted-foreground text-xs text-center px-2 text-pretty">QR will appear here</p>
              </div>
            )}
          </div>

          {displayUpiId ? (
            <div className="flex flex-col gap-2 flex-1 min-w-0 justify-center">
              {amountLabel ? (
                <div
                  className="rounded-lg border-2 border-emerald-500/40 bg-emerald-50/80 px-3 py-2.5 text-center shadow-sm min-w-0"
                  role="status"
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-emerald-800/80 mb-0.5">
                    Amount to pay
                  </p>
                  <div className="flex items-center justify-center gap-2 min-w-0">
                    <p className="text-lg font-bold text-emerald-900">₹{amountLabel}</p>
                    <CopyValueButton
                      value={String(payAmountRupees)}
                      label="amount"
                      className="border-emerald-400/60 text-emerald-900 hover:bg-emerald-100/80"
                    />
                  </div>
                  <p className="mt-1 text-[0.65rem] text-emerald-900/70 text-pretty">
                    Enter this amount manually in your UPI app
                  </p>
                </div>
              ) : null}

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
                <p className="mt-1 text-[0.65rem] text-muted-foreground text-pretty">
                  Copy and pay inside your UPI app — safest for PhonePe
                </p>
              </div>

              {mobileFromUpi ? (
                <div className="rounded-lg border border-amber-200/90 bg-amber-50/90 px-3 py-2.5 text-left text-[0.65rem] text-amber-950 min-w-0">
                  <p className="font-semibold text-amber-900 mb-1 text-xs">Or pay by mobile</p>
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-amber-900 bg-amber-100/80 border border-amber-300/80 rounded px-1.5 py-0.5 select-all">
                      {mobileFromUpi}
                    </span>
                    <CopyValueButton
                      value={mobileFromUpi}
                      label="mobile number"
                      className="border-amber-300/80 text-amber-900 hover:bg-amber-100/80"
                    />
                  </div>
                </div>
              ) : null}
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
        <strong className="text-foreground font-medium">Scan the QR</strong> with your UPI app, or{' '}
        <strong className="text-foreground font-medium">copy the UPI ID</strong> and pay inside PhonePe / GPay / Paytm.
        Website payment links are not used — apps block them for personal accounts.
      </p>

      {displayUpiId ? (
        <button
          type="button"
          onClick={() => void copyUpiId()}
          className="flex items-center justify-center gap-2 min-h-12 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-95 transition-opacity text-sm font-semibold w-full touch-manipulation shadow-sm"
        >
          <ClipboardList className="w-4 h-4 shrink-0" aria-hidden />
          Copy UPI ID
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 min-h-12 px-4 py-3 rounded-xl border border-dashed border-border bg-muted/40 text-muted-foreground text-sm font-medium w-full cursor-not-allowed"
        >
          UPI ID not configured — add it in admin
        </button>
      )}

      {displayUpiId && amountOk ? (
        <div className="mt-4 rounded-xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground/90">
          <p className="font-semibold text-foreground mb-2">How to pay</p>
          <ol className="space-y-1.5 list-decimal list-inside text-pretty text-muted-foreground leading-relaxed">
            {steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
