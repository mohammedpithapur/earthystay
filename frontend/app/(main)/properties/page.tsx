import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import PropertiesClient from './PropertiesClient'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Property | EarthyStay',
  description: 'A hand-picked property - book now on EarthyStay',
  openGraph: {
    title: 'Property | EarthyStay',
    description: 'A hand-picked property - book now on EarthyStay',
    url: 'https://earthystays.in/properties',
    siteName: 'EarthyStay',
    type: 'website',
    images: [
      {
        url: 'https://earthystays.in/og-image.jpg',
        secureUrl: 'https://earthystays.in/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EarthyStay Properties',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Property | EarthyStay',
    description: 'A hand-picked property - book now on EarthyStay',
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
