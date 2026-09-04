import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import PropertiesClient from './PropertiesClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Property | Earthy stays',
  description: 'A hand-picked property - book now on Earthy stays',
  openGraph: {
    title: 'Property | Earthy stays',
    description: 'A hand-picked property - book now on Earthy stays',
    url: 'https://earthystays.in/properties',
    siteName: 'Earthy stays',
    type: 'website',
    images: [
      {
        url: 'https://earthystays.in/og-image.jpg',
        secureUrl: 'https://earthystays.in/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Earthy stays Properties',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Property | Earthy stays',
    description: 'A hand-picked property - book now on Earthy stays',
    images: ['https://earthystays.in/og-image.jpg'],
  },
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div style={{ padding: 48, textAlign: 'center' }}>Loading properties…</div>}>
      <PropertiesClient />
    </Suspense>
  )
}
