"use client"
import Link from 'next/link'
import PropertyCard from './PropertyCard'
import { dummyProperties } from '@/lib/data/properties'

export default function FeaturedProperties() {
  return (
    <section className="section-shell" style={{ backgroundColor: '#ffffff' }}>
      <div className="content-shell">

        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{
            color: '#e1c391',
            fontSize: '12px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: '16px',
            fontWeight: '600',
          }}>
            Handpicked For You
          </p>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: '800',
            color: '#1a1a1a',
            marginBottom: '16px',
            lineHeight: '1.2',
          }}>
            Featured Properties
          </h2>
          <div style={{ width: '60px', height: '2px', backgroundColor: '#e1c391', margin: '0 auto 24px' }} />
          <p style={{
            color: '#555555',
            fontSize: '16px',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: '1.7',
          }}>
            Each property is carefully selected to offer you an extraordinary experience
          </p>
        </div>

        <div className="responsive-card-grid" style={{ marginBottom: '64px' }}>
          {dummyProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link
            href="/properties"
            style={{
              display: 'inline-block',
              border: '2px solid #e1c391',
              color: '#e1c391',
              padding: '16px 48px',
              fontSize: '13px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: '700',
              textDecoration: 'none',
              borderRadius: '8px',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.backgroundColor = '#e1c391'
              el.style.color = '#1a1a1a'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.backgroundColor = 'transparent'
              el.style.color = '#e1c391'
            }}
          >
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  )
}