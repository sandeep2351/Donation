import Link from 'next/link';
import { Heart, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground fill-primary-foreground" />
              </div>
              <h3 className="font-serif font-bold text-xl text-background">Help Dad</h3>
            </div>
            <p className="text-background/80 text-sm leading-relaxed">
              A family&apos;s journey toward hope and healing. Your generosity gives us strength every day.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-background mb-4 text-sm uppercase tracking-wide">Navigate</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-background/70 hover:text-background transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/donate" className="text-background/70 hover:text-background transition-colors text-sm">
                  Donate
                </Link>
              </li>
              <li>
                <Link href="/updates" className="text-background/70 hover:text-background transition-colors text-sm">
                  Updates
                </Link>
              </li>
              <li>
                <Link href="/medical" className="text-background/70 hover:text-background transition-colors text-sm">
                  Medical
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-background mb-4 text-sm uppercase tracking-wide">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-background/70 hover:text-background transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-background/70 hover:text-background transition-colors text-sm">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-background/70 hover:text-background transition-colors text-sm">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-background mb-4 text-sm uppercase tracking-wide">Reach Us</h4>
            <div className="space-y-3">
              <a
                href="mailto:contact@example.com"
                className="flex items-center gap-2 text-background/70 hover:text-background transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>contact@example.com</span>
              </a>
              <a
                href="tel:+919999999999"
                className="flex items-center gap-2 text-background/70 hover:text-background transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                <span>+91 99999 99999</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/70 text-sm">
              &copy; {currentYear} Help Dad&apos;s Surgery. Made with love.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-background/70 hover:text-background transition-colors text-xs uppercase tracking-wide">
                Facebook
              </a>
              <a href="#" className="text-background/70 hover:text-background transition-colors text-xs uppercase tracking-wide">
                Twitter
              </a>
              <a href="#" className="text-background/70 hover:text-background transition-colors text-xs uppercase tracking-wide">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
