'use client';

import { useEffect, useState } from 'react';
import StableLink from '@/components/StableLink';
import { Heart, Mail, Phone } from 'lucide-react';

const DEFAULT_EMAIL = 'sandeepkalyan299@gmail.com';
const DEFAULT_PHONE = '+91 00000 00000';

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [phone, setPhone] = useState(DEFAULT_PHONE);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d?.settings) return;
        if (d.settings.emailContact) setEmail(d.settings.emailContact);
        if (d.settings.phoneContact) setPhone(d.settings.phoneContact);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <footer className="bg-foreground text-background border-t border-border pb-[env(safe-area-inset-bottom,0px)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
              </div>
              <h3 className="font-serif font-bold text-xl text-background">Family fundraiser</h3>
            </div>
            <p className="text-background/80 text-sm leading-relaxed text-pretty">
              Thank you for reading. If you donate, your name appears only when you ask us to show it.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4 text-sm uppercase tracking-wide">Navigate</h4>
            <ul className="space-y-2">
              <li>
                <StableLink href="/" className="text-background/70 hover:text-background transition-colors text-sm">
                  Home
                </StableLink>
              </li>
              <li>
                <StableLink href="/donate" className="text-background/70 hover:text-background transition-colors text-sm">
                  Donate
                </StableLink>
              </li>
              <li>
                <StableLink href="/medical" className="text-background/70 hover:text-background transition-colors text-sm">
                  Medical
                </StableLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4 text-sm uppercase tracking-wide">Support</h4>
            <ul className="space-y-2">
              <li>
                <StableLink href="/contact" className="text-background/70 hover:text-background transition-colors text-sm">
                  Contact
                </StableLink>
              </li>
              <li>
                <StableLink href="/privacy" className="text-background/70 hover:text-background transition-colors text-sm">
                  Privacy
                </StableLink>
              </li>
              <li>
                <StableLink href="/terms" className="text-background/70 hover:text-background transition-colors text-sm">
                  Terms
                </StableLink>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-background mb-4 text-sm uppercase tracking-wide">Reach us</h4>
            <div className="space-y-3">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-background/70 hover:text-background transition-colors text-sm break-all"
                suppressHydrationWarning
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>{email}</span>
              </a>
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-background/70 hover:text-background transition-colors text-sm"
                suppressHydrationWarning
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>{phone}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/70 text-sm text-center md:text-left">
              &copy; {year} Campaign site. Built for clarity, not noise.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
