"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import PropertyCard from './PropertyCard'
import { buildApiUrl } from '@/lib/api'
import type { Property } from '@/lib/types'

export default function FeaturedProperties() {
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        const response = await fetch(buildApiUrl('/properties?limit=6'), { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load properties')
        }
        const data = await response.json()
        if (isMounted) {
          setProperties(Array.isArray(data.items) ? data.items : [])
        }
      } catch {
        if (isMounted) {
          setProperties([])
        }
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="section-shell" style={{ backgroundColor: '#ffffff' }}>
      <div className="content-shell">

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{
            color: 'var(--color-gold)',
            fontSize: '11px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '12px',
            fontWeight: '600',
          }}>
            Handpicked For You
          </p>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: '800',
            color: 'var(--color-text-primary)',
            marginBottom: '12px',
            lineHeight: '1.2',
          }}>
            Featured Properties
          </h2>
          <div style={{ width: '50px', height: '2px', backgroundColor: 'var(--color-gold)', margin: '0 auto 16px' }} />
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: '15px',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}>
            Each property is carefully selected to offer you an extraordinary experience
          </p>
        </div>

        <div className="responsive-card-grid" style={{ marginBottom: '48px' }}>
          {properties.map(property => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link
            href="/properties"
            style={{
              display: 'inline-block',
              border: '2px solid var(--color-gold)',
              color: 'var(--color-gold)',
              padding: '14px 42px',
              fontSize: '12px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontWeight: '700',
              textDecoration: 'none',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.backgroundColor = 'var(--color-gold)'
              el.style.color = 'var(--color-text-primary)'
              el.style.transform = 'scale(1.03)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.backgroundColor = 'transparent'
              el.style.color = 'var(--color-gold)'
              el.style.transform = 'scale(1)'
            }}
          >
            View All Properties
          </Link>
        </div>
      </div>
    </section>
  )
}