import type { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Providers from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Earthy stays | Unique Earthy Properties Across India',
    template: '%s | Earthy stays',
  },
  description: 'Discover and book one-of-a-kind earthy villas, cottages, and estates across India. Perfect for boutique stays, destination weddings, and corporate retreats.',
  keywords: [
    'Earthy stays',
    'EarthyStays',
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
    siteName: 'Earthy stays',
    title: 'Earthy stays | Unique Earthy Properties Across India',
    description: 'Discover and book one-of-a-kind earthy villas, cottages, and estates across India. Perfect for stays, weddings, and corporate retreats.',
    images: [
      {
        url: 'https://earthystays.in/og-image.jpg',
        secureUrl: 'https://earthystays.in/og-image.jpg',
        width: 1200,
        height: 630,
        type: 'image/jpeg',
        alt: 'Earthy stays — Unique Earthy Properties Across India',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Earthy stays | Unique Earthy Properties Across India',
    description: 'Discover and book one-of-a-kind earthy villas, cottages, and estates across India. Perfect for stays, weddings, and corporate retreats.',
    images: ['https://earthystays.in/og-image.jpg'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Earthy stays',
  },
  icons: {
    icon: [
      { url: '/favicon.ico?v=3', sizes: 'any' },
      { url: '/icons/favicon-32x32.png?v=3', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-48x48.png?v=3', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-192x192.png?v=3', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png?v=3', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico?v=3',
    apple: [
      { url: '/apple-touch-icon.png?v=3', sizes: '180x180', type: 'image/png' },
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://earthystays.in/#website',
      url: 'https://earthystays.in',
      name: 'Earthy stays',
      alternateName: ['Earthy stays', 'Earthy Stays', 'EarthyStays India', 'earthystays.in'],
      description: 'Discover and book unique earthy properties across India. Boutique villas, heritage stays, wedding estates, and retreats.',
    },
    {
      '@type': 'Organization',
      '@id': 'https://earthystays.in/#organization',
      name: 'Earthy stays',
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