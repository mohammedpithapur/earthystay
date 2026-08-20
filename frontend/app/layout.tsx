import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Providers from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'EarthyStay | Unique Earthy Properties Across India',
  description: 'Discover and book one-of-a-kind earthy villas, cottages, and estates across India. Perfect for stays, weddings, and corporate retreats.',
  metadataBase: new URL('https://earthystays.in'),
  openGraph: {
    type: 'website',
    url: 'https://earthystays.in',
    siteName: 'EarthyStay',
    title: 'EarthyStay | Unique Earthy Properties Across India',
    description: 'Discover and book one-of-a-kind earthy villas, cottages, and estates across India. Perfect for stays, weddings, and corporate retreats.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EarthyStay | Unique Earthy Properties Across India',
    description: 'Discover and book one-of-a-kind earthy villas, cottages, and estates across India. Perfect for stays, weddings, and corporate retreats.',
  },
  icons: {
    icon: '/Untitled_design-removebg-preview.png?v=2',
    shortcut: '/Untitled_design-removebg-preview.png?v=2',
    apple: '/Untitled_design-removebg-preview.png?v=2',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning style={{ backgroundColor: 'var(--color-bg-page)', margin: 0, overflowX: 'hidden' }}>
        <Providers>
          <Navbar />
          <main style={{ paddingTop: '72px', minHeight: '100vh' }}>
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}