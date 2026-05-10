'use client';

import { useState } from 'react';
import StableLink from '@/components/StableLink';
import { Menu, X, Heart, Shield } from 'lucide-react';

export default function HeaderClient({ title, tagline }: { title: string; tagline: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/donate', label: 'Donate' },
    { href: '/medical', label: 'Medical' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <StableLink href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="font-serif text-lg font-semibold text-foreground leading-tight truncate max-w-[14rem] md:max-w-[18rem] lg:max-w-xl">
                {title}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">{tagline}</p>
            </div>
          </StableLink>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <StableLink
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </StableLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <StableLink
              href="/admin"
              className="px-4 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-full hover:bg-secondary transition-colors"
            >
              Staff
            </StableLink>
            <StableLink
              href="/donate"
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:shadow-lg transform hover:scale-105 transition-all font-medium text-sm"
            >
              Donate
            </StableLink>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:bg-secondary rounded-lg transition-colors"
            suppressHydrationWarning
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-6 pt-4 border-t border-border space-y-4">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <StableLink
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2.5 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </StableLink>
              ))}
            </nav>
            <StableLink
              href="/donate"
              className="block px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all font-medium text-sm text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Donate Now
            </StableLink>
            <StableLink
              href="/admin"
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Shield className="w-4 h-4" />
              Staff login
            </StableLink>
          </div>
        )}
      </div>
    </header>
  );
}
