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

  const providerColors: Record<string, string> = {
    GOOGLE_PAY: 'from-blue-400 to-blue-600',
    PHONEPE: 'from-purple-400 to-purple-600',
    PAYTM: 'from-cyan-400 to-blue-500',
  };

  const bgColor = providerColors[qrCode.provider] || 'from-gray-400 to-gray-600';

  return (
    <div className="flex flex-col items-center">
      <div className={`bg-gradient-to-br ${bgColor} rounded-xl p-8 mb-4 shadow-lg`}>
        {qrCode.cloudinaryUrl || qrCode.imageUrl ? (
          <div className="w-64 h-64 bg-white rounded-lg p-3 flex items-center justify-center">
            <img 
              src={qrCode.cloudinaryUrl || qrCode.imageUrl} 
              alt={`${qrCode.displayName} QR Code`}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center">
            <p className="text-gray-500 text-sm">QR Code will be displayed here</p>
          </div>
        )}
      </div>

      <div className="text-center mb-4">
        <p className="text-lg font-semibold text-gray-900 mb-1">
          {qrCode.displayName}
        </p>
        <p className="text-sm text-gray-600 mb-3">
          Scan to donate quickly and securely
        </p>
      </div>

      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors text-emerald-700 text-sm font-medium"
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
