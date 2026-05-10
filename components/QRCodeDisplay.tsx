'use client';

import { useState, useEffect } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';

interface QRCodeDisplayProps {
  qrCode: {
    code: number;
    displayName: string;
    provider: string;
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
    <div className="flex flex-col items-center">
      <div className="mb-4 rounded-xl border border-border bg-white p-4 shadow-sm">
        {qrCode.cloudinaryUrl || qrCode.imageUrl ? (
          <div className="w-64 h-64 bg-white flex items-center justify-center">
            <img
              src={qrCode.cloudinaryUrl || qrCode.imageUrl}
              alt={`${qrCode.displayName} QR Code`}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-64 h-64 bg-white flex items-center justify-center">
            <p className="text-muted-foreground text-sm text-center px-2">QR Code will be displayed here</p>
          </div>
        )}
      </div>

      <div className="text-center mb-4">
        <p className="text-lg font-semibold text-foreground mb-1">{qrCode.displayName}</p>
        <p className="text-sm text-muted-foreground mb-3">Scan to donate quickly and securely</p>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-lg hover:bg-secondary/80 transition-colors text-foreground text-sm font-medium"
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
