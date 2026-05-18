'use client';

import { useCallback, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type CopyValueButtonProps = {
  value: string;
  label: string;
  className?: string;
};

export default function CopyValueButton({ value, label, className = '' }: CopyValueButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({ title: 'Copied', description: `${label} copied to clipboard.`, duration: 3000 });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Could not copy',
        description: 'Select the text and copy manually, or allow clipboard access.',
        variant: 'destructive',
        duration: 5000,
      });
    }
  }, [value, label]);

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={`inline-flex items-center justify-center shrink-0 rounded-md border border-primary/30 bg-background/80 p-1.5 text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
    >
      {copied ? <Check className="w-3.5 h-3.5" aria-hidden /> : <Copy className="w-3.5 h-3.5" aria-hidden />}
    </button>
  );
}
