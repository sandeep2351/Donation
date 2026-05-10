import Link from 'next/link';
import { Heart, Mail, Phone } from 'lucide-react';
import { connectDB } from '@/lib/mongodb';
import { CampaignSettings } from '@/lib/models';

export default async function Footer() {
  const currentYear = new Date().getFullYear();
  let email = process.env.ADMIN_EMAIL || 'sandeepkalyan299@gmail.com';
  let phone = '+91 00000 00000';

  try {
    await connectDB();
    const s = await CampaignSettings.findOne().sort({ createdAt: 1 }).lean();
    if (s?.emailContact) email = s.emailContact;
    if (s?.phoneContact) phone = s.phoneContact;
  } catch {
    /* offline build / missing URI */
  }

  return (
    <footer className="bg-foreground text-background border-t border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

          <div>
            <h4 className="font-semibold text-background mb-4 text-sm uppercase tracking-wide">Reach us</h4>
            <div className="space-y-3">
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-background/70 hover:text-background transition-colors text-sm break-all"
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>{email}</span>
              </a>
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-background/70 hover:text-background transition-colors text-sm"
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
              &copy; {currentYear} Campaign site. Built for clarity, not noise.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
