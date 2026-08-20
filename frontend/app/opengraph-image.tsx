import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'EarthyStay — Unique Earthy Properties Across India'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #2b2017 0%, #3e2f22 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Decorative inner border */}
        <div
          style={{
            position: 'absolute',
            inset: '24px',
            border: '2px solid rgba(234, 208, 175, 0.25)',
            borderRadius: '24px',
          }}
        />

        {/* Small gold brand tag */}
        <div
          style={{
            color: '#ead0af',
            fontSize: '20px',
            letterSpacing: '6px',
            textTransform: 'uppercase',
            fontWeight: 800,
            marginBottom: '16px',
          }}
        >
          EarthyStay
        </div>

        {/* Main Catchy Title */}
        <div
          style={{
            color: '#ffffff',
            fontSize: '54px',
            fontWeight: 900,
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: '20px',
            maxWidth: '920px',
          }}
        >
          Discover & Book Unique Earthy Properties Across India
        </div>

        {/* Subtitle / Bio */}
        <div
          style={{
            color: '#d9c2a8',
            fontSize: '24px',
            textAlign: 'center',
            maxWidth: '850px',
            lineHeight: 1.4,
            marginBottom: '32px',
          }}
        >
          Curated Villas • Heritage Stays • Weddings • Corporate Retreats
        </div>

        {/* Website link badge */}
        <div
          style={{
            background: '#b7895f',
            color: '#ffffff',
            padding: '12px 32px',
            borderRadius: '999px',
            fontSize: '20px',
            fontWeight: 700,
            letterSpacing: '1px',
          }}
        >
          earthystays.in
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
