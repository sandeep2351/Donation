'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

type Settings = {
  emailContact?: string;
  phoneContact?: string;
  hospitalName?: string;
  campaignTitle?: string;
};

const fieldClass =
  'w-full border border-border rounded-lg px-3 py-2 bg-background text-sm focus:ring-2 focus:ring-primary/30 outline-none';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setSettings(d.settings || null))
      .catch(() => setSettings(null));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'We could not send your message. Please try again or use email or phone above.');
        return;
      }
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const email = settings?.emailContact || 'sandeepkalyan299@gmail.com';
  const phone = settings?.phoneContact || '+91-0000000000';
  const cityLine = settings?.hospitalName ? `Near ${settings.hospitalName}` : 'India';

  return (
    <div className="bg-gradient-to-br from-stone-50 via-background to-emerald-50/30 min-h-screen pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24">
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground mb-3 text-balance">
            Contact the family
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl text-pretty leading-relaxed mx-auto sm:mx-0">
            Reach out with a question, a kind word, or anything on your mind. Use the form below or the details on the
            cards — every message is read with care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mb-8">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm border-t-4 border-t-primary">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground mb-1">Email</h3>
                <a
                  href={`mailto:${email}`}
                  className="text-sm text-primary hover:underline font-medium break-all"
                  suppressHydrationWarning
                >
                  {email}
                </a>
                <p className="text-xs text-muted-foreground mt-2">Usually within a day or two.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm border-t-4 border-t-primary/70">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground mb-1">Phone</h3>
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="text-sm text-primary hover:underline font-medium"
                  suppressHydrationWarning
                >
                  {phone}
                </a>
                <p className="text-xs text-muted-foreground mt-2">Reasonable daytime hours, IST.</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm border-t-4 border-t-muted-foreground/30">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground mb-1">Location</h3>
                <p className="text-sm text-foreground font-medium">{cityLine}</p>
                <p className="text-xs text-muted-foreground mt-2">Shown from your campaign details.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-foreground">Write to us</h2>
              <p className="text-sm text-muted-foreground mt-1 text-pretty max-w-2xl">
                We read every message. Fields marked <span className="text-destructive">*</span> are required.
              </p>
            </div>
          </div>

          {submitted && (
            <div className="mb-6 p-4 bg-secondary border border-border rounded-xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Sent</p>
                <p className="text-sm text-muted-foreground">Thank you — we&apos;ll get back to you when we can.</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive text-pretty">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
            <div className="lg:col-span-2 space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
                    Full name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={fieldClass}
                    suppressHydrationWarning
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={fieldClass}
                    suppressHydrationWarning
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1.5">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={fieldClass}
                    suppressHydrationWarning
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1.5">
                    Subject <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className={fieldClass}
                    suppressHydrationWarning
                  >
                    <option value="">Choose…</option>
                    <option value="Donation question">Donation question</option>
                    <option value="Volunteering">Volunteering</option>
                    <option value="Medical question">Medical question</option>
                    <option value="Press / media">Press / media</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1.5">
                  Message <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className={`${fieldClass} min-h-[140px] resize-y`}
                  suppressHydrationWarning
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-95 disabled:opacity-50 text-sm font-medium shadow-sm transition-opacity sm:w-auto min-h-11"
                  suppressHydrationWarning
                >
                  {loading ? 'Sending…' : 'Send message'}
                </button>
              </div>
            </div>

            <div className="lg:col-span-1 lg:pt-1">
              <aside className="lg:sticky lg:top-24 self-start rounded-2xl border border-primary/20 bg-gradient-to-br from-secondary/90 via-card to-primary/[0.06] p-5 shadow-sm ring-1 ring-border/60">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
                    aria-hidden
                  >
                    <Clock className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground leading-tight">When we reply</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">No rush — we’re grateful you wrote.</p>
                  </div>
                </div>
                <p className="text-sm text-foreground/85 leading-relaxed text-pretty border-t border-border/60 pt-4">
                  This page is run by family, not a support desk. If it takes a day or two to hear back, that’s normal —
                  we read everything and answer as soon as we can.
                </p>
              </aside>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
