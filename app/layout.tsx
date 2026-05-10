import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import './globals.css'

export const metadata: Metadata = {
  title: 'Help Dad\'s Surgery - Lung Transplant Fundraising',
  description:
    'Support our father\'s lung transplant surgery. Every donation helps save a life. Transparent tracking of medical expenses and progress updates.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Help Dad\'s Surgery - Lung Transplant Fundraising',
    description: 'Support our father\'s lung transplant surgery. Every donation helps save a life.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#6b9d7d',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body
        className="font-sans antialiased bg-background flex flex-col min-h-screen"
        suppressHydrationWarning
      >
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
