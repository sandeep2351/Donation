import Link from 'next/link';
import { Heart, CheckCircle2 } from 'lucide-react';

export default function DonateThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-emerald-50/40 py-12 sm:py-20 px-4">
      <div className="max-w-lg mx-auto text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary mb-6">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground mb-3 text-balance">
          Thank you
        </h1>
        <p className="text-muted-foreground text-pretty leading-relaxed mb-8">
          If you just paid in PhonePe or another UPI app, your support means a lot. This page does not verify the
          payment automatically—when you&apos;re ready, you can head back to the site.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/donate"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-95 transition-opacity"
          >
            <Heart className="h-4 w-4" aria-hidden />
            Donate page
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-border bg-card text-foreground font-medium text-sm hover:bg-secondary transition-colors"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
