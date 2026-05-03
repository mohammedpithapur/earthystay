"use client"

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
    <Link href={`/properties/${property.id}`}>
      <div style={{
        backgroundColor: '#FFFFFF',
        cursor: 'pointer',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 40px rgba(0,0,0,0.12)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', overflow: 'hidden', height: '260px' }}>
          <img
            src={primaryImage}
            alt={property.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease'
            }}
            onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.05)'}
            onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'}
          />

          {/* Rating Badge */}
          <div style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: '#1C1C1C',
            color: '#C9A84C',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}>
            ★ {property.avg_rating}
          </div>

          {/* Location Badge */}
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            backgroundColor: 'rgba(28,28,28,0.8)',
            color: '#FAF8F5',
            padding: '6px 12px',
            fontSize: '11px',
            letterSpacing: '1.5px',
            textTransform: 'uppercase'
          }}>
            {property.city}, {property.state}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 24px 24px' }}>

          {/* Name */}
          <h3 style={{
            fontFamily: 'Georgia, serif',
            fontSize: '20px',
            fontWeight: '500',
            color: '#1C1C1C',
            marginBottom: '8px',
            lineHeight: '1.3'
          }}>
            {property.name}
          </h3>

          {/* Details Row */}
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '16px',
            flexWrap: 'wrap'
          }}>
            {[
              { icon: '🛏', label: `${property.bedrooms} Bed` },
              { icon: '🚿', label: `${property.bathrooms} Bath` },
              { icon: '👥', label: `${property.max_guests} Guests` },
            ].map(detail => (
              <span key={detail.label} style={{
                fontSize: '12px',
                color: '#555555',
                letterSpacing: '0.5px'
              }}>
                {detail.icon} {detail.label}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: '#E5E0D8', marginBottom: '16px' }} />

          {/* Price Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{
                fontFamily: 'Georgia, serif',
                fontSize: '22px',
                fontWeight: '600',
                color: '#1C1C1C'
              }}>
                ₹{property.price_per_night.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '12px', color: '#888', marginLeft: '4px' }}>/ night</span>
            </div>
            <div style={{
              fontSize: '12px',
              color: '#888'
            }}>
              {property.review_count} reviews
            </div>
          </div>

          {/* Amenities */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '12px',
            flexWrap: 'wrap'
          }}>
            {property.amenities.slice(0, 3).map(amenity => (
              <span key={amenity} style={{
                backgroundColor: '#F0EDEA',
                color: '#555555',
                padding: '4px 10px',
                fontSize: '11px',
                letterSpacing: '0.5px'
              }}>
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span style={{
                backgroundColor: '#F0EDEA',
                color: '#C9A84C',
                padding: '4px 10px',
                fontSize: '11px',
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