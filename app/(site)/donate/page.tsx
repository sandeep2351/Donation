'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { buildUpiPayUri, resolveQrBaseUpiForPayment } from '@/lib/upi-intent';
import type { UpiAppTab } from '@/lib/upi-intent';
import {
  isEmbeddedBrowserLikelyBreakingUpi,
  isLikelyDesktopWithoutNativeUpi,
} from '@/lib/in-app-browser';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

type QrRow = {
  _id: string;
  code: number;
  displayName: string;
  provider: string;
  upiString?: string;
  /** Admin: which Pay tab uses this slot’s UPI (ANY = all tabs / shared pool). */
  upiTargetApp?: 'GOOGLE_PAY' | 'PHONEPE' | 'PAYTM' | 'ANY';
  /** Plain VPA when full upiString is not used, e.g. name@ybl */
  upiId?: string;
  imageUrl?: string | null;
  isActive?: boolean;
};

/** All three UPI lanes share one timer; each lane uses a fixed offset into the pool so slots can differ at the same moment. */
const ROTATE_POOL_MS = 30_000;

const UPI_APP_CHOICES = [
  { id: 'GOOGLE_PAY', label: 'Google Pay' },
  { id: 'PHONEPE', label: 'PhonePe' },
  { id: 'PAYTM', label: 'Paytm' },
] as const;

type UpiAppId = (typeof UPI_APP_CHOICES)[number]['id'];

const TAB_TO_PREFERRED: Record<UpiAppId, UpiAppTab | 'ANY'> = {
  GOOGLE_PAY: 'GOOGLE_PAY',
  PHONEPE: 'PHONEPE',
  PAYTM: 'PAYTM',
};

/** Stagger: Google Pay → pool[i], PhonePe → pool[i+1], Paytm → pool[i+2] (mod pool size). */
const APP_SLOT_OFFSET: Record<UpiAppId, number> = {
  GOOGLE_PAY: 0,
  PHONEPE: 1,
  PAYTM: 2,
};

export default function DonatePage() {
  const [customAmount, setCustomAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCodes, setQrCodes] = useState<QrRow[]>([]);
  const [qrLoading, setQrLoading] = useState(true);
  /** Increments every 30s when the pool has more than one slot; each app uses (tick + offset) % pool size. */
  const [rotationTick, setRotationTick] = useState(0);
  const [selectedUpiApp, setSelectedUpiApp] = useState<UpiAppId>('GOOGLE_PAY');
  const [payLinkOpened, setPayLinkOpened] = useState(false);
  const [badInAppBrowser, setBadInAppBrowser] = useState(false);
  const [desktopNoUpi, setDesktopNoUpi] = useState(false);

  useEffect(() => {
    setBadInAppBrowser(isEmbeddedBrowserLikelyBreakingUpi());
    setDesktopNoUpi(isLikelyDesktopWithoutNativeUpi());
  }, []);

  const predefinedAmounts = [1000, 5000, 10000, 25000, 50000];

  const qrPool = useMemo(() => {
    return [...qrCodes]
      .filter((q) => q.isActive !== false)
      .sort((a, b) => a.code - b.code);
  }, [qrCodes]);

  const poolLen = qrPool.length;

  const poolForTab = useMemo(() => {
    const tab = selectedUpiApp;
    const tagged = qrPool.filter((q) => {
      const t = q.upiTargetApp || 'ANY';
      return t === 'ANY' || t === tab;
    });
    return tagged.length > 0 ? tagged : qrPool;
  }, [qrPool, selectedUpiApp]);

  const poolForTabLen = poolForTab.length;

  const loadQr = useCallback(async () => {
    setQrLoading(true);
    try {
      const res = await fetch('/api/qr-codes');
      const data = await res.json();
      const list: QrRow[] = data.qrCodes || [];
      setQrCodes(list);
    } catch {
      setQrCodes([]);
    } finally {
      setQrLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQr();
  }, [loadQr]);

  useEffect(() => {
    if (poolLen <= 1) return;
    const t = setInterval(() => {
      setRotationTick((x) => x + 1);
    }, ROTATE_POOL_MS);
    return () => clearInterval(t);
  }, [poolLen]);

  const parsedAmount = customAmount.trim() === '' ? NaN : parseInt(customAmount, 10);
  const finalAmount = Number.isFinite(parsedAmount) ? parsedAmount : 0;

  const slotIndexForApp = (app: UpiAppId) =>
    poolForTabLen === 0 ? 0 : (rotationTick + APP_SLOT_OFFSET[app]) % poolForTabLen;

  const activeQr = poolForTabLen === 0 ? null : poolForTab[slotIndexForApp(selectedUpiApp)];

  const upiPayHref = useMemo(() => {
    if (!activeQr || finalAmount < 100) return null;
    const base = resolveQrBaseUpiForPayment(activeQr);
    if (!base) return null;
    return buildUpiPayUri(base, finalAmount, 'Donation');
  }, [activeQr, finalAmount]);

  useEffect(() => {
    setPayLinkOpened(false);
  }, [upiPayHref, selectedUpiApp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!finalAmount || finalAmount < 100) {
      setError('Please enter a valid donation amount (minimum ₹100)');
      setLoading(false);
      return;
    }

    if (!isAnonymous && !donorName.trim()) {
      setError('Please enter your name, or mark the gift as anonymous');
      setLoading(false);
      return;
    }

    if (!activeQr) {
      setError('Payment QR codes are not configured yet. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: isAnonymous ? 'Anonymous' : donorName.trim(),
          donorEmail,
          donorPhone,
          amount: finalAmount,
          paymentMethod: 'UPI',
          upiCode: activeQr.code,
          isAnonymous,
        }),
      });

      if (!response.ok) {
        const j = await response.json().catch(() => ({}));
        throw new Error(j.error || 'Failed to process donation');
      }

      setSubmitted(true);
      setTimeout(() => {
        setDonorName('');
        setDonorEmail('');
        setDonorPhone('');
        setCustomAmount('');
        setIsAnonymous(false);
        setSubmitted(false);
      }, 3200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to process donation. Please try again.');
      console.error('Donation error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-emerald-50/40 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6 sm:p-12 text-center">
            <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-serif font-bold text-foreground mb-3">Thank you</h2>
            <p className="text-muted-foreground mb-2 text-pretty">
              Your gift of ₹{finalAmount.toLocaleString('en-IN')} is recorded as confirmed for this demo flow.
            </p>
            <p className="text-sm text-muted-foreground">
              In production you would match each UPI payment manually or via a gateway webhook.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-emerald-50/40 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-[env(safe-area-inset-bottom,0px)]">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-4 text-center text-balance px-1">
          Donate
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground text-center mb-8 sm:mb-12 max-w-2xl mx-auto text-pretty leading-relaxed px-1">
          Choose an amount and a payment app. In admin, set each QR slot&apos;s <strong className="text-foreground">Pay tab</strong>{' '}
          so Google Pay, PhonePe, and Paytm use the correct <code className="text-xs">upi://</code> string from your real
          QR. Slots marked <strong className="text-foreground">Any app</strong> share one rotation pool (staggered every
          30s per tab when you have several).
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="lg:col-span-1 bg-card rounded-xl border border-border p-4 sm:p-8 h-fit shadow-sm">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Amount</h2>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-foreground mb-3">Quick amounts</label>
                <div className="grid grid-cols-2 gap-3">
                  {predefinedAmounts.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setCustomAmount(String(amount))}
                      className={`p-3 rounded-lg border-2 font-semibold transition-all ${
                        finalAmount === amount && customAmount === String(amount)
                          ? 'border-primary bg-secondary text-primary'
                          : 'border-border bg-background text-foreground hover:border-primary/40'
                      }`}
                    >
                      ₹{(amount / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="customAmount" className="block text-sm font-medium text-foreground mb-2">
                  Custom amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground font-semibold">₹</span>
                  <input
                    id="customAmount"
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full pl-8 pr-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                    min={100}
                  />
                </div>
              </div>

              <div className="mb-6 space-y-3">
                <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded border-border"
                  />
                  Give anonymously on the public list
                </label>

                {!isAnonymous && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                      Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Your name"
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/30 outline-none"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/30 outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    placeholder="+91 …"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/30 outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !finalAmount || qrLoading}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity font-semibold"
              >
                {loading ? 'Saving…' : 'Confirm donation'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 min-w-0">
            <div className="bg-card rounded-xl border border-border p-4 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <h2 className="text-2xl font-serif font-bold text-foreground">Scan to pay</h2>
                {poolLen > 1 && (
                  <p className="text-xs text-muted-foreground text-right max-w-xs sm:max-w-none">
                    {poolForTabLen < poolLen ? (
                      <>
                        Tab pool: {poolForTabLen} of {poolLen} slots · full list rotates every {ROTATE_POOL_MS / 1000}s.
                      </>
                    ) : (
                      <>
                        Pool: {poolLen} slots · each app advances every {ROTATE_POOL_MS / 1000}s (lanes staggered).
                      </>
                    )}
                  </p>
                )}
              </div>

              {qrLoading ? (
                <p className="text-center text-muted-foreground py-16">Loading payment options…</p>
              ) : !activeQr ? (
                <p className="text-center text-muted-foreground py-16 text-pretty">
                  No QR codes yet. Sign in to the admin dashboard, open &quot;QR codes&quot;, and add slots plus image
                  URLs.
                </p>
              ) : (
                <>
                  {desktopNoUpi && (
                    <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-950">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
                      <div className="text-sm text-pretty">
                        <strong className="font-semibold">You&apos;re on a laptop or desktop.</strong> The green Pay
                        button is disabled here — UPI is built for phones. If you already clicked Pay and saw
                        WhatsApp or another wrong app, that&apos;s normal on Mac/PC: the browser doesn&apos;t have UPI.
                        Open this same page on your <strong>phone</strong> (or scan the QR with your phone).
                      </div>
                    </div>
                  )}
                  {badInAppBrowser && !desktopNoUpi && (
                    <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-950">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
                      <div className="text-sm text-pretty">
                        <strong className="font-semibold">Opened from WhatsApp or another in-app browser?</strong>{' '}
                        <code className="text-xs bg-amber-100/80 px-1 rounded">upi://</code> links often open the wrong
                        app here (e.g. WhatsApp). Use{' '}
                        <strong className="font-semibold">Open in browser</strong> (menu ⋮ or share → Chrome / Safari),
                        then tap <strong className="font-semibold">Pay</strong> again. Or open this donate page
                        directly in Chrome or PhonePe&apos;s browser.
                      </div>
                    </div>
                  )}
                  <div className="mb-6">
                    <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-foreground text-pretty">
                        These QR codes work with <strong>any UPI app</strong>—Google Pay, PhonePe, Paytm, BHIM, your
                        bank app, and more. Pick the one you prefer below.
                      </p>
                    </div>
                    <p className="text-sm font-medium text-foreground mb-3">Pay with</p>
                    <div
                      className="flex flex-wrap gap-2"
                      role="tablist"
                      aria-label="Choose UPI app"
                    >
                      {UPI_APP_CHOICES.map((app) => {
                        const selected = selectedUpiApp === app.id;
                        return (
                          <button
                            key={app.id}
                            type="button"
                            role="tab"
                            aria-selected={selected}
                            onClick={() => setSelectedUpiApp(app.id)}
                            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                              selected
                                ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary/30'
                                : 'border-border bg-background text-foreground hover:bg-secondary/80'
                            }`}
                          >
                            {app.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground text-pretty">
                      Use <strong className="text-foreground font-medium">Pay with UPI</strong> below to open your UPI
                      app with this amount, or scan the QR. This tab uses the UPI string from slot{' '}
                      <strong className="text-foreground">{activeQr.code}</strong>
                      {activeQr.displayName ? ` (${activeQr.displayName})` : ''}. If your phone asks which app to use,
                      pick {UPI_APP_CHOICES.find((a) => a.id === selectedUpiApp)?.label ?? 'your app'}.
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <QRCodeDisplay
                      qrCode={{
                        code: activeQr.code,
                        imageUrl: activeQr.imageUrl || undefined,
                        cloudinaryUrl: activeQr.imageUrl || undefined,
                      }}
                      payHref={upiPayHref}
                      payAmountRupees={finalAmount}
                      preferredUpiApp={TAB_TO_PREFERRED[selectedUpiApp]}
                      onPayClick={() => setPayLinkOpened(true)}
                      blockDesktopPay={desktopNoUpi}
                    />
                  </div>

                  <div className="mt-6 w-full max-w-md mx-auto space-y-4">
                    {finalAmount >= 100 && !upiPayHref && activeQr && (
                      <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200/90 rounded-lg px-3 py-2 text-pretty">
                        This slot (QR #{activeQr.code}) needs a real <strong>UPI ID</strong> (e.g.{' '}
                        <code className="text-xs">name@ybl</code>) or a full <strong>UPI string</strong> in admin → QR
                        codes. Use <strong>Label</strong> for the payee name when using UPI ID only. Save changes, then
                        refresh.
                      </p>
                    )}
                    {upiPayHref && finalAmount >= 100 && !desktopNoUpi && (
                      <p className="text-xs text-center text-muted-foreground text-pretty">
                        On Android, Pay tries to open{' '}
                        <strong className="text-foreground">{UPI_APP_CHOICES.find((a) => a.id === selectedUpiApp)?.label}</strong>
                        ; you can still pick another app if shown. On iPhone you may get a list of UPI apps. Confirm the
                        amount before paying.
                      </p>
                    )}
                    {payLinkOpened && upiPayHref && !desktopNoUpi && (
                      <div className="rounded-xl border border-border bg-secondary/60 px-4 py-3 text-sm text-foreground/90 space-y-2">
                        <p className="text-pretty">
                          Finish payment in the UPI app, then return to this tab in your browser.
                        </p>
                        <Link
                          href="/donate/thank-you"
                          className="inline-flex font-medium text-primary hover:underline"
                        >
                          I&apos;m done — go to thank you page
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="mt-8 p-6 bg-secondary/80 border border-border rounded-lg">
                <h3 className="font-semibold text-foreground mb-3">How paying works</h3>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside text-pretty">
                  <li>
                    Enter your amount on the left, then tap <strong className="text-foreground">Pay with UPI</strong>{' '}
                    or scan the QR.
                  </li>
                  <li>Confirm ₹{finalAmount > 0 ? finalAmount.toLocaleString('en-IN') : '…'} in your UPI app.</li>
                  <li>
                    Tap <strong className="text-foreground">Confirm donation</strong> on the form when you&apos;re
                    ready so we can record your gift (verify payments in admin if needed).
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 sm:p-8">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Transparency</h2>
          <p className="text-muted-foreground text-sm leading-relaxed text-pretty max-w-3xl">
            Totals on the home page are calculated from confirmed donations in the database. Medical files and QR
            artwork are ordinary URLs—Cloudinary is a good fit, but any HTTPS link the admin saves will work.
          </p>
        </div>
      </div>
    </div>
  );
}
