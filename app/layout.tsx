import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { getCampaignBranding } from '@/lib/campaign-branding'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const { navTitle, description } = await getCampaignBranding()
  const tabTitle = `${navTitle} · Donate`
  const desc =
    description ||
    'Transparent fundraising: track support and see how funds are used.'
  return {
    title: tabTitle,
    description: desc,
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
      title: tabTitle,
      description: desc.slice(0, 200),
      type: 'website',
    },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#6b9d7d',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <body
        className="font-sans antialiased bg-background flex min-h-dvh min-h-screen flex-col"
        suppressHydrationWarning
      >
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
