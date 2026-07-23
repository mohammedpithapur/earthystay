"use client"
import Image from 'next/image'
import Link from 'next/link'
import { Property } from '@/lib/types'
import { Star, MapPin, Bed, Bath, Users } from 'lucide-react'

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
          transition: 'all 0.2s ease',
          borderRadius: '12px',
          overflow: 'hidden',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 16px 48px rgba(0,0,0,0.12)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', overflow: 'hidden', width: '100%', aspectRatio: '4/3' }}>
          <Image
            src={primaryImage}
            alt={property.name}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => {
              const img = e.currentTarget as HTMLImageElement
              img.style.transform = 'scale(1.08)'
            }}
            onMouseLeave={e => {
              const img = e.currentTarget as HTMLImageElement
              img.style.transform = 'scale(1)'
            }}
          />

          {/* Rating Badge */}
          <div style={{
            position: 'absolute', top: '14px', right: '14px',
            backgroundColor: 'var(--color-text-primary)',
            color: 'var(--color-gold)',
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: '700',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <Star style={{ width: '13px', height: '13px', fill: 'var(--color-gold)', strokeWidth: 0 }} />
            {property.avg_rating}
          </div>

          {/* Location Badge */}
          <div style={{
            position: 'absolute', bottom: '14px', left: '14px',
            backgroundColor: 'rgba(43,32,23,0.85)',
            color: '#ffffff',
            padding: '6px 10px',
            fontSize: '11px',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
          }}>
            <MapPin style={{ width: '12px', height: '12px', color: 'var(--color-gold)' }} />
            {property.city}, {property.state}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>

          <h3 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            marginBottom: '8px',
            lineHeight: '1.3',
          }}>
            {property.name}
          </h3>

          {/* Details Row */}
          <div style={{ display: 'flex', gap: '14px', marginBottom: '12px', flexWrap: 'wrap', fontSize: '13px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              <Bed style={{ width: '14px', height: '14px', strokeWidth: 1.8 }} />
              {property.bedrooms} Beds
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              <Bath style={{ width: '14px', height: '14px', strokeWidth: 1.8 }} />
              {property.bathrooms} Baths
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              <Users style={{ width: '14px', height: '14px', strokeWidth: 1.8 }} />
              {property.max_guests} Guests
            </span>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', marginBottom: '12px' }} />

          {/* Price Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div>
              <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                ₹{property.price_per_night.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '4px' }}>/ night</span>
            </div>
            {/* reviews count removed per request */}
          </div>

          {/* Amenities */}
          <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', flexWrap: 'wrap' }}>
            {property.amenities.slice(0, 3).map(amenity => (
              <span key={amenity} style={{
                backgroundColor: 'var(--color-bg-soft)',
                color: 'var(--color-text-secondary)',
                padding: '3px 8px',
                fontSize: '10px',
                letterSpacing: '0.2px',
                borderRadius: '4px',
                fontWeight: '500',
              }}>
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span style={{
                backgroundColor: 'var(--color-bg-soft)',
                color: 'var(--color-gold)',
                padding: '3px 8px',
                fontSize: '10px',
                borderRadius: '4px',
                fontWeight: '600',
              }}>
                +{property.amenities.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
