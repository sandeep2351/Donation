'use client';

import { useState, useEffect } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';

interface QRCodeDisplayProps {
  qrCode: {
    code: number;
    displayName?: string;
    imageUrl?: string;
    cloudinaryUrl?: string;
  };
  onQRScanned?: (codeNumber: number) => void;
}

export default function QRCodeDisplay({ qrCode, onQRScanned }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`UPI Code ${qrCode.code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect(() => {
    onQRScanned?.(qrCode.code);
  }, [qrCode.code, onQRScanned]);

  return (
    <div className="flex w-full max-w-[min(100%,20rem)] flex-col items-center mx-auto">
      <div className="mb-4 w-full rounded-xl border border-border bg-white p-3 sm:p-4 shadow-sm">
        {qrCode.cloudinaryUrl || qrCode.imageUrl ? (
          <div className="mx-auto aspect-square max-h-[min(70vmin,18rem)] w-full max-w-[min(100%,18rem)] bg-white flex items-center justify-center">
            <img
              src={qrCode.cloudinaryUrl || qrCode.imageUrl}
              alt={`UPI QR code, slot ${qrCode.code}`}
              className="h-full w-full object-contain"
              loading="lazy"
              sizes="(max-width: 640px) 85vw, 288px"
            />
          </div>
        ) : (
          <div className="mx-auto aspect-square max-h-[min(70vmin,18rem)] w-full max-w-[min(100%,18rem)] bg-white flex items-center justify-center">
            <p className="text-muted-foreground text-sm text-center px-2 text-pretty">QR Code will be displayed here</p>
          </div>
        )}
      </div>

      <p className="text-center text-sm text-muted-foreground mb-4">Scan to donate quickly and securely</p>

      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 min-h-11 px-4 py-2.5 bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition-colors text-foreground text-sm font-medium w-full max-w-[min(100%,20rem)] touch-manipulation"
      >
        {copied ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            <span>Code copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Copy UPI Code {qrCode.code}</span>
          </>
        )}
      </button>
    </div>
  );
}
