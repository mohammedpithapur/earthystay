"use client"

import Link from 'next/link'
import PropertyCard from './PropertyCard'
import { dummyProperties } from '@/lib/data/properties'

export default function FeaturedProperties() {
  return (
    <section style={{
      backgroundColor: '#FAF8F5',
      padding: '100px 24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{
            color: '#C9A84C',
            fontSize: '12px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}>
            Handpicked For You
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: '400',
            color: '#1C1C1C',
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            Featured Properties
          </h2>
          <div style={{
            width: '60px',
            height: '1px',
            backgroundColor: '#C9A84C',
            margin: '0 auto 24px'
          }} />
          <p style={{
            color: '#555555',
            fontSize: '16px',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: '1.7'
          }}>
            Each property is carefully selected to offer you an extraordinary experience
          </p>
        </div>

        {/* Properties Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '32px',
          marginBottom: '64px'
        }}>
          {dummyProperties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* View All Button */}
        <div style={{ textAlign: 'center' }}>
          <Link
            href="/properties"
            style={{
              display: 'inline-block',
              border: '1.5px solid #C9A84C',
              color: '#C9A84C',
              padding: '16px 48px',
              fontSize: '13px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              textDecoration: 'none'
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.backgroundColor = '#C9A84C'
              el.style.color = '#1C1C1C'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.backgroundColor = 'transparent'
              el.style.color = '#C9A84C'
            }}
          >
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  )
}