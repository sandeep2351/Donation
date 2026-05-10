'use client';

import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

type Settings = {
  emailContact?: string;
  phoneContact?: string;
  hospitalName?: string;
  campaignTitle?: string;
};

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
        setError(data.error || 'Could not send. Check SMTP settings on the server.');
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
    <div className="bg-gradient-to-br from-stone-50 via-background to-emerald-50/30 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 text-center text-balance">
          Contact the family
        </h1>
        <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto text-pretty leading-relaxed">
          Messages go to the admin inbox by email when SMTP is configured. The address below comes from your
          campaign settings.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-card rounded-xl border border-border p-6 border-t-4 border-t-primary shadow-sm">
            <div className="flex items-start gap-4">
              <Mail className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Email</h3>
                <a href={`mailto:${email}`} className="text-primary hover:underline font-medium break-all">
                  {email}
                </a>
                <p className="text-sm text-muted-foreground mt-2">Usually within a day or two.</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 border-t-4 border-t-primary/70 shadow-sm">
            <div className="flex items-start gap-4">
              <Phone className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-primary hover:underline font-medium">
                  {phone}
                </a>
                <p className="text-sm text-muted-foreground mt-2">Reasonable daytime hours, IST.</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 border-t-4 border-t-muted-foreground/30 shadow-sm">
            <div className="flex items-start gap-4">
              <MapPin className="w-6 h-6 text-primary shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Location</h3>
                <p className="text-foreground font-medium">{cityLine}</p>
                <p className="text-sm text-muted-foreground mt-2">Update hospital or city in admin settings.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Write to us</h2>

            {submitted && (
              <div className="mb-6 p-4 bg-secondary border border-border rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Sent</p>
                  <p className="text-sm text-muted-foreground">If SMTP is set up, the admin already has your note.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex gap-2">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                  Full name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/30 outline-none"
                >
                  <option value="">Choose…</option>
                  <option value="Donation question">Donation question</option>
                  <option value="Volunteering">Volunteering</option>
                  <option value="Medical question">Medical question</option>
                  <option value="Press / media">Press / media</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-foreground mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/30 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-95 disabled:opacity-50 font-semibold transition-opacity"
              >
                {loading ? 'Sending…' : 'Send message'}
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <Clock className="w-6 h-6 text-primary shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Timing</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed text-pretty">
                    This is a family-run page, not a call centre. A short delay before a reply is normal.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-secondary/60 rounded-xl border border-border p-6 text-sm text-muted-foreground leading-relaxed text-pretty">
              <p className="font-medium text-foreground mb-2">Email delivery</p>
              <p>
                Set <code className="text-xs bg-background px-1 py-0.5 rounded">SMTP_HOST</code>,{' '}
                <code className="text-xs bg-background px-1 py-0.5 rounded">SMTP_PORT</code>,{' '}
                <code className="text-xs bg-background px-1 py-0.5 rounded">SMTP_USER</code>, and{' '}
                <code className="text-xs bg-background px-1 py-0.5 rounded">SMTP_PASS</code> in your environment. Messages
                are addressed to <span className="text-foreground">sandeepkalyan299@gmail.com</span> unless you override{' '}
                <code className="text-xs bg-background px-1 py-0.5 rounded">ADMIN_INBOX_EMAIL</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
