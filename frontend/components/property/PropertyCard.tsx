"use client"
import Image from 'next/image'
import Link from 'next/link'
import { Property } from '@/lib/types'
import { Star, MapPin, Bed, Bath, Users, User, Armchair, Sofa, Utensils, TreePalm, LayoutDashboard, UtensilsCrossed, DoorOpen } from 'lucide-react'

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

          {/* Details Row — ONLY Guests, Beds, Baths, and spaces_detail (Balcony, Living Room, Kitchen, etc. with Shared/Not Shared) */}
          {(() => {
            type Slot = { icon: React.ReactNode; text: string; sharingIcon?: React.ReactNode }
            const slots: Slot[] = []
            const spaces = property.spaces_detail ?? []

            // 1. Guests (Always)
            slots.push({
              icon: <Users style={{ width: '14px', height: '14px', strokeWidth: 1.8 }} />,
              text: `${property.max_guests} Guests`
            })

            // 2. Beds (Always)
            slots.push({
              icon: <Bed style={{ width: '14px', height: '14px', strokeWidth: 1.8 }} />,
              text: `${property.bedrooms} Beds`
            })

            // 3. Baths (with type label)
            const hasSharedBath = (property.bathrooms_detail ?? []).some(b => b.type === 'shared')
            const isBathShared = (property.bathrooms_detail ?? []).length > 0 ? hasSharedBath : false
            const bathSharingText = (property.bathrooms_detail ?? []).length > 0 ? (isBathShared ? 'Shared' : 'Not Shared') : null
            slots.push({
              icon: <Bath style={{ width: '14px', height: '14px', strokeWidth: 1.8 }} />,
              text: `${property.bathrooms} Baths${bathSharingText ? ` (${bathSharingText})` : ''}`
            })

            // 4. Spaces (Balcony, Terrace, Kitchen, Hall, Living Room, Dining Room, Entrance)
            const spaceConfig: Record<string, { label: string; icon: React.ReactNode; matchKeywords: string[] }> = {
              balcony: { label: 'Balcony', icon: <Armchair style={{ width: '14px', height: '14px', strokeWidth: 1.8 }} />, matchKeywords: ['balcony'] },
              terrace: { label: 'Terrace', icon: <TreePalm style={{ width: '14px', height: '14px', strokeWidth: 1.8 }} />, matchKeywords: ['terrace'] },
              kitchen: { label: 'Kitchen', icon: <Utensils style={{ width: '14px', height: '14px', strokeWidth: 1.8 }} />, matchKeywords: ['kitchen'] },
              hall: { label: 'Hall', icon: <LayoutDashboard style={{ width: '14px', height: '14px', strokeWidth: 1.8 }} />, matchKeywords: ['hall'] },
              living_room: { label: 'Living Room', icon: <Sofa style={{ width: '14px', height: '14px', strokeWidth: 1.8 }} />, matchKeywords: ['living room', 'livingroom'] },
              dining_room: { label: 'Dining Room', icon: <UtensilsCrossed style={{ width: '14px', height: '14px', strokeWidth: 1.8 }} />, matchKeywords: ['dining room', 'diningroom'] },
              entrance: { label: 'Entrance', icon: <DoorOpen style={{ width: '14px', height: '14px', strokeWidth: 1.8 }} />, matchKeywords: ['entrance'] },
            }

            const activeSpacesMap = new Map<string, { type: string; count: number; sharing: string }>()

            // Add spaces explicitly configured in spaces_detail
            for (const sp of spaces) {
              if (Number(sp.count) > 0 && spaceConfig[sp.type]) {
                activeSpacesMap.set(sp.type, { type: sp.type, count: Number(sp.count), sharing: sp.sharing || 'not_shared' })
              }
            }

            // Also check general amenities for existing properties that have "Balcony", "Kitchen", etc.
            const cleanAmenities = (property.amenities ?? []).filter(a => typeof a === 'string' && !a.startsWith('__space__:'))
            for (const [key, cfg] of Object.entries(spaceConfig)) {
              if (!activeSpacesMap.has(key)) {
                const foundInAmenities = cleanAmenities.some(a => cfg.matchKeywords.some(kw => a.toLowerCase().includes(kw)))
                if (foundInAmenities) {
                  activeSpacesMap.set(key, { type: key, count: 1, sharing: 'not_shared' })
                }
              }
            }

            for (const sp of activeSpacesMap.values()) {
              const cfg = spaceConfig[sp.type]
              if (cfg) {
                const isShared = sp.sharing === 'shared'
                slots.push({
                  icon: cfg.icon,
                  text: `${sp.count} ${cfg.label} (${isShared ? 'Shared' : 'Not Shared'})`
                })
              }
            }

            return (
              <div style={{ display: 'flex', gap: '14px', marginBottom: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                {slots.slice(0, 5).map((slot, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                    {slot.icon}
                    {slot.text}
                  </span>
                ))}
              </div>
            )
          })()}


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
          {(() => {
            const displayAmenities = (property.amenities ?? []).filter(
              a => typeof a === 'string' && !a.startsWith('__space__:') && !a.trim().startsWith('{') && !a.includes('"type":')
            )
            return (
              <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', flexWrap: 'wrap' }}>
                {displayAmenities.slice(0, 3).map(amenity => (
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
                {displayAmenities.length > 3 && (
                  <span style={{
                    backgroundColor: 'var(--color-bg-soft)',
                    color: 'var(--color-gold)',
                    padding: '3px 8px',
                    fontSize: '10px',
                    borderRadius: '4px',
                    fontWeight: '600',
                  }}>
                    +{displayAmenities.length - 3}
                  </span>
                )}
              </div>
            )
          })()}
        </div>
      </div>
    </Link>
  )
}
