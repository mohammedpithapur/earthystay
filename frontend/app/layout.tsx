import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Providers from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'EarthyStay | Unique Earthy Properties Across India',
    template: '%s | EarthyStay',
  },
  description: 'Discover and book one-of-a-kind earthy villas, cottages, and estates across India. Perfect for boutique stays, destination weddings, and corporate retreats.',
  keywords: [
    'EarthyStay',
    'Earthy Stays',
    'earthystays.in',
    'earthy properties',
    'luxury villas India',
    'heritage stays India',
    'boutique resort booking',
    'destination wedding venues India',
    'corporate retreats India',
  ],
  metadataBase: new URL('https://earthystays.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: 'https://earthystays.in',
    siteName: 'EarthyStay',
    title: 'EarthyStay | Unique Earthy Properties Across India',
    description: 'Discover and book one-of-a-kind earthy villas, cottages, and estates across India. Perfect for stays, weddings, and corporate retreats.',
    images: [
      {
        url: 'https://earthystays.in/og-image.jpg',
        secureUrl: 'https://earthystays.in/og-image.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'EarthyStay — Unique Earthy Properties Across India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EarthyStay | Unique Earthy Properties Across India',
    description: 'Discover and book one-of-a-kind earthy villas, cottages, and estates across India. Perfect for stays, weddings, and corporate retreats.',
    images: ['https://earthystays.in/og-image.jpg'],
  },
  icons: {
    icon: '/Untitled_design-removebg-preview.png?v=2',
    shortcut: '/Untitled_design-removebg-preview.png?v=2',
    apple: '/Untitled_design-removebg-preview.png?v=2',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://earthystays.in/#website',
      url: 'https://earthystays.in',
      name: 'EarthyStay',
      alternateName: ['Earthy Stays', 'EarthyStay India', 'earthystays.in'],
      description: 'Discover and book unique earthy properties across India. Boutique villas, heritage stays, wedding estates, and retreats.',
    },
    {
      '@type': 'Organization',
      '@id': 'https://earthystays.in/#organization',
      name: 'EarthyStay',
      url: 'https://earthystays.in',
      logo: 'https://earthystays.in/Untitled_design-removebg-preview.png',
    },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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