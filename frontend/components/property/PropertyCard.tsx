"use client"
import Image from 'next/image'
import Link from 'next/link'
import { Property } from '@/lib/types'

interface Props {
  property: Property
}

export default function PropertyCard({ property }: Props) {
  const primaryImage = property.images.find(img => img.is_primary)?.image_url
    || property.images[0]?.image_url
    || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'

  return (
    <Link href={`/properties/${property.id}`} style={{ textDecoration: 'none' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          cursor: 'pointer',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 48px rgba(0,0,0,0.10)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', overflow: 'hidden', height: '260px' }}>
          <Image
            src={primaryImage}
            alt={property.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
          />

          {/* Rating Badge */}
          <div style={{
            position: 'absolute', top: '14px', right: '14px',
            backgroundColor: 'var(--color-text-primary)',
            color: 'var(--color-gold)',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '700',
            borderRadius: '6px',
          }}>
            ★ {property.avg_rating}
          </div>

          {/* Location Badge */}
          <div style={{
            position: 'absolute', bottom: '14px', left: '14px',
            backgroundColor: 'rgba(43,32,23,0.82)',
            color: '#ffffff',
            padding: '6px 12px',
            fontSize: '11px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            borderRadius: '6px',
          }}>
            {property.city}, {property.state}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px 24px' }}>

          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            marginBottom: '10px',
            lineHeight: '1.3',
          }}>
            {property.name}
          </h3>

          {/* Details Row */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {[
              { label: `${property.bedrooms} Bedrooms` },
              { label: `${property.bathrooms} Bathrooms` },
              { label: `${property.max_guests} Guests` },
            ].map(detail => (
              <span key={detail.label} style={{
                fontSize: '12px',
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.3px',
                fontWeight: '500',
              }}>
                {detail.label}
              </span>
            ))}
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', marginBottom: '16px' }} />

          {/* Price Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                ₹{property.price_per_night.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginLeft: '4px' }}>/ night</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              {property.review_count} reviews
            </div>
          </div>

          {/* Amenities */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            {property.amenities.slice(0, 3).map(amenity => (
              <span key={amenity} style={{
                backgroundColor: 'var(--color-bg-soft)',
                color: 'var(--color-text-secondary)',
                padding: '4px 10px',
                fontSize: '11px',
                letterSpacing: '0.3px',
                borderRadius: '6px',
                fontWeight: '500',
              }}>
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span style={{
                backgroundColor: 'var(--color-bg-soft)',
                color: 'var(--color-gold)',
                padding: '4px 10px',
                fontSize: '11px',
                borderRadius: '6px',
                fontWeight: '600',
              }}>
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
