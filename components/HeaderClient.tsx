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
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 border-b border-border shadow-sm pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex w-full min-w-0 items-center min-h-[4.25rem] sm:h-20 py-2 sm:py-0 gap-2 sm:gap-3">
          {/* Left: brand — shares width equally with right on md+ so nav stays visually centered */}
          <div className="flex min-w-0 flex-1 basis-0 items-center md:justify-start">
            <StableLink
              href="/"
              className="flex min-w-0 max-w-full items-center gap-2 sm:gap-3 pr-1 group sm:pr-2"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full shrink-0 flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground fill-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="font-serif text-sm sm:text-lg font-semibold text-foreground leading-tight truncate sm:max-w-[14rem] md:max-w-[18rem] lg:max-w-[22rem]">
                  {title}
                </p>
                <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">
                  {tagline}
                </p>
              </div>
            </StableLink>
          </div>

          {/* Center: main nav (desktop) */}
          <nav
            aria-label="Main"
            className="hidden shrink-0 items-center gap-6 lg:gap-8 md:flex"
          >
            {navLinks.map((link) => (
              <StableLink
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group whitespace-nowrap"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </StableLink>
            ))}
          </nav>

          {/* Right: Admin + Donate on desktop; menu button on mobile */}
          <div className="flex min-w-0 shrink-0 items-center justify-end gap-2 md:flex-1 md:basis-0">
            <div className="hidden items-center gap-2 md:flex">
              <StableLink
                href="/admin"
                aria-label="Open admin dashboard"
                title="Admin dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-full hover:bg-secondary hover:text-foreground transition-colors whitespace-nowrap"
              >
                <Shield className="w-4 h-4 shrink-0" />
                Admin
              </StableLink>
              <StableLink
                href="/donate"
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full hover:shadow-lg transform hover:scale-105 transition-all font-medium text-sm whitespace-nowrap"
              >
                Donate
              </StableLink>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex p-2.5 -mr-1 text-foreground hover:bg-secondary rounded-lg transition-colors min-h-11 min-w-11 items-center justify-center shrink-0"
              aria-expanded={mobileMenuOpen}
              aria-controls="site-mobile-nav"
              suppressHydrationWarning
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            id="site-mobile-nav"
            className="md:hidden pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] border-t border-border space-y-4"
          >
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
              aria-label="Open admin dashboard"
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-secondary hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Shield className="w-4 h-4" />
              Admin dashboard
            </StableLink>
          </div>
        )}
      </div>
    </header>
  );
}
