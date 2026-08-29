import type { Metadata } from 'next'

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'https://api.earthystays.in'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const res = await fetch(`${API_BASE}/properties/${id}`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error('Not found')
    const p = await res.json()
    const title = p.name || 'Property | EarthyStay'
    const description = p.short_description || p.description?.slice(0, 160) || 'A handpicked earthy stay — book now on EarthyStay.'
    const location = [p.city, p.state].filter(Boolean).join(', ')
    const rawImage: string = p.images?.[0] || p.cover_image || p.thumbnail || ''
    const ogImage = rawImage || 'https://earthystays.in/og-image.jpg'
    const canonicalUrl = `https://earthystays.in/properties/${id}`
    return {
      title,
      description,
      alternates: { canonical: canonicalUrl },
      openGraph: {
        type: 'website',
        url: canonicalUrl,
        siteName: 'EarthyStay',
        title: `${title} | EarthyStay`,
        description: location ? `${description} Located in ${location}.` : description,
        images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | EarthyStay`,
        description,
        images: [ogImage],
      },
    }
  } catch {
    return {
      title: 'Property | EarthyStay',
      description: 'A handpicked earthy stay — book now on EarthyStay.',
      openGraph: { images: ['https://earthystays.in/og-image.jpg'] },
    }
  }
}

export default function PropertyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}