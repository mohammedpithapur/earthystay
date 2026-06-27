'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { DayPicker } from 'react-day-picker'
import MapWrapper from '@/components/shared/MapWrapper'
import { buildApiUrl, fetchPropertyReviews } from '@/lib/api'
import type { Property, Review } from '@/lib/types'
import type { DateRange } from 'react-day-picker'

const bathroomLabel: Record<string, string> = {
  ensuite: 'Private Ensuite',
  detached_private: 'Detached Private',
  shared: 'Shared',
}

export default function PropertyDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const propertyId = Array.isArray(id) ? id[0] : id
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [blockedRanges, setBlockedRanges] = useState<Array<{ check_in: string; check_out: string }>>([])

  const [activeImage, setActiveImage] = useState(0)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [range, setRange] = useState<DateRange | undefined>(undefined)
  const [guests, setGuests] = useState(1)
  const [pets, setPets] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')
  const [hoveredTags, setHoveredTags] = useState<Record<string, boolean>>({})
  const [bookingError, setBookingError] = useState<string | null>(null)

  // ── Reviews State ────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)

  useEffect(() => {
    if (!propertyId) return
    let isMounted = true

    const load = async () => {
      try {
        setLoading(true)
        setLoadError(null)
        const response = await fetch(buildApiUrl(`/properties/${propertyId}`), { cache: 'no-store' })
        if (!response.ok) {
          throw new Error(`Failed to load property (${response.status})`)
        }
        const data = await response.json()
        if (isMounted) {
          setProperty(data)
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load property')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [propertyId])

  useEffect(() => {
    if (!propertyId) return
    let isMounted = true

    const loadAvailability = async () => {
      try {
        const response = await fetch(buildApiUrl(`/properties/${propertyId}/availability`), { cache: 'no-store' })
        if (!response.ok) {
          throw new Error('Failed to load availability')
        }
        const data = await response.json()
        if (isMounted) {
          setBlockedRanges(Array.isArray(data) ? data : [])
        }
      } catch {
        if (isMounted) {
          setBlockedRanges([])
        }
      }
    }

    loadAvailability()
    return () => {
      isMounted = false
    }
  }, [propertyId])

  useEffect(() => {
    if (activeTab === 'reviews' && propertyId) {
      setReviewsLoading(true)
      fetchPropertyReviews(propertyId)
        .then(setReviews)
        .catch(() => {})
        .finally(() => setReviewsLoading(false))
    }
  }, [activeTab, propertyId])

  const formatDateInputValue = (value?: Date) => {
    if (!value) return ''
    const year = value.getFullYear()
    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDateLabel = (value?: Date) => (
    value ? value.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Select'
  )

  const toDate = (dateStr: string) => new Date(`${dateStr}T00:00:00`)

  const isRangeBlocked = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return false
    const start = toDate(startStr)
    const end = toDate(endStr)
    return blockedRanges.some(range => {
      const rangeStart = toDate(range.check_in)
      const rangeEnd = toDate(range.check_out)
      return start < rangeEnd && end > rangeStart
    })
  }

  const disabledRanges = blockedRanges
    .map(range => {
      const start = toDate(range.check_in)
      const end = toDate(range.check_out)
      const endDate = new Date(end)
      endDate.setDate(endDate.getDate() - 1)
      if (endDate < start) {
        endDate.setTime(start.getTime())
      }
      return { from: start, to: endDate }
    })
    .filter(range => !Number.isNaN(range.from.getTime()) && !Number.isNaN(range.to.getTime()))

  const handleRangeSelect = (selected: DateRange | undefined) => {
    setRange(selected)
    const nextCheckIn = formatDateInputValue(selected?.from)
    const nextCheckOut = formatDateInputValue(selected?.to)
    setCheckIn(nextCheckIn)
    setCheckOut(nextCheckOut)
    if (selected?.from && selected?.to && isRangeBlocked(nextCheckIn, nextCheckOut)) {
      setBookingError('Selected dates overlap an existing booking')
      return
    }
    setBookingError(null)
  }

  if (loading) {
    return (
      <div className="page-shell" style={{ backgroundColor: '#ffffff' }}>
        {/* Gallery skeleton */}
        <div style={{ backgroundColor: 'var(--color-navbar)', padding: '6px' }}>
          <div style={{
            height: 'clamp(280px, 55vw, 520px)',
            background: 'linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite',
            marginBottom: '8px',
          }} />
          <div style={{ display: 'flex', gap: '6px', padding: '4px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ width: 72, height: 48, borderRadius: 6, background: 'linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', flexShrink: 0 }} />
            ))}
          </div>
        </div>
        {/* Content skeleton */}
        <div className="content-shell-lg" style={{ padding: '48px 24px 72px' }}>
          <div className="responsive-grid-detail">
            <div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                {[100, 150, 80].map((w, i) => (
                  <div key={i} style={{ height: 28, width: w, borderRadius: 6, background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite' }} />
                ))}
              </div>
              <div style={{ height: 48, width: '80%', borderRadius: 8, background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: 24 }} />
              {[100, 80, 90, 70].map((w, i) => (
                <div key={i} style={{ height: 16, width: `${w}%`, borderRadius: 4, background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: 10 }} />
              ))}
            </div>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 12, padding: 28 }}>
              <div style={{ height: 40, width: '55%', borderRadius: 6, background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: 20 }} />
              <div style={{ height: 200, borderRadius: 8, background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite', marginBottom: 16 }} />
              <div style={{ height: 52, borderRadius: 8, background: '#f0f0f0', animation: 'shimmer 1.4s infinite' }} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>{loadError}</h2>
        <button
          onClick={() => router.push('/properties')}
          style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-text-primary)', border: 'none', padding: '14px 32px', fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer', borderRadius: '8px' }}
        >
          Back to Properties
        </button>
      </div>
    )
  }

  if (!property) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Property not found</h2>
        <button
          onClick={() => router.push('/properties')}
          style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-text-primary)', border: 'none', padding: '14px 32px', fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer', borderRadius: '8px' }}
        >
          Back to Properties
        </button>
      </div>
    )
  }

  const calcNights = () => {
    if (!checkIn || !checkOut) return 0
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const nights = calcNights()
  const basePrice = nights * property.price_per_night
  const petCharge = pets * nights * property.pet_charge_per_night
  const totalPrice = basePrice + property.cleaning_fee + petCharge

  const handleBook = () => {
    if (!checkIn || !checkOut) { alert('Please select check-in and check-out dates'); return }
    if (nights < property.min_nights) { alert(`Minimum stay is ${property.min_nights} nights`); return }
    if (isRangeBlocked(checkIn, checkOut)) { alert('Selected dates are not available'); return }
    router.push(`/booking/${property.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&pets=${pets}&nights=${nights}&total=${totalPrice}`)
  }

  // Star distribution from real reviews
  const starCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
  }))

  const tabs = ['overview', 'amenities', 'house rules', 'location', 'reviews']

  const cardStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '28px',
    marginBottom: '20px',
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="page-shell" style={{ backgroundColor: '#ffffff' }}>

      {/* Photo Gallery */}
      <div style={{ backgroundColor: 'var(--color-navbar)', padding: '6px' }}>
        <div style={{ position: 'relative', minHeight: 'clamp(300px, 60vw, 540px)', overflow: 'hidden', marginBottom: '8px', borderRadius: '4px' }}>
          {(() => {
            const mainSrc = property.images[activeImage]?.image_url
            if (mainSrc) {
              return (
                <Image
                  src={mainSrc}
                  alt={property.name}
                  fill
                  unoptimized
                  sizes="100vw"
                  style={{ objectFit: 'cover', transition: 'opacity 0.3s ease' }}
                  priority
                />
              )
            }
            return <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-bg-card)' }} />
          })()}
          {/* Gradient overlay for text */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', pointerEvents: 'none' }} />
          {/* Counter */}
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', backgroundColor: 'rgba(0,0,0,0.65)', color: '#ffffff', padding: '6px 14px', fontSize: '13px', borderRadius: '6px', backdropFilter: 'blur(4px)', fontWeight: '600', letterSpacing: '0.5px' }}>
            {activeImage + 1} / {property.images.length}
          </div>
          {property.images.length > 1 && (
            <>
              <button
                onClick={() => setActiveImage(i => Math.max(0, i - 1))}
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.55)', color: '#ffffff', border: 'none', width: '48px', height: '48px', fontSize: '22px', cursor: 'pointer', borderRadius: '50%', backdropFilter: 'blur(4px)', transition: 'background 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.55)')}
              >‹</button>
              <button
                onClick={() => setActiveImage(i => Math.min(property.images.length - 1, i + 1))}
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.55)', color: '#ffffff', border: 'none', width: '48px', height: '48px', fontSize: '22px', cursor: 'pointer', borderRadius: '50%', backdropFilter: 'blur(4px)', transition: 'background 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.55)')}
              >›</button>
            </>
          )}
        </div>
        {/* Thumbnail strip */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '4px 4px', scrollbarWidth: 'none' }}>
          {property.images.map((img, i) => (
            img.image_url ? (
              <div
                key={img.id}
                onClick={() => setActiveImage(i)}
                style={{ position: 'relative', width: 84, height: 56, flexShrink: 0, cursor: 'pointer', borderRadius: 6, overflow: 'hidden', border: activeImage === i ? '2px solid var(--color-gold)' : '2px solid rgba(255,255,255,0.2)', transition: 'border-color 0.15s ease, transform 0.15s ease', transform: activeImage === i ? 'scale(1.05)' : 'scale(1)' }}
              >
                <Image src={img.image_url} alt={`${property.name} ${i + 1}`} fill unoptimized style={{ objectFit: 'cover', opacity: activeImage === i ? 1 : 0.7, transition: 'opacity 0.15s ease' }} />
              </div>
            ) : (
              <div key={img.id} onClick={() => setActiveImage(i)} style={{ width: 84, height: 56, borderRadius: 6, backgroundColor: 'var(--color-bg-card)', cursor: 'pointer', opacity: activeImage === i ? 1 : 0.7, border: activeImage === i ? '2px solid var(--color-gold)' : '2px solid transparent', flexShrink: 0 }} />
            )
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="content-shell-lg" style={{ padding: '48px var(--page-padding) 72px' }}>
      <div className="responsive-grid-detail md:grid-cols-2">

        {/* Left Column */}
        <div style={{ minWidth: 0 }}>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: 'var(--color-bg-soft)', color: 'var(--color-text-primary)', padding: '5px 12px', fontSize: '12px', letterSpacing: '0.5px', borderRadius: '6px', fontWeight: '600' }}>
              {property.city}, {property.state}
            </span>
            <span style={{ backgroundColor: 'var(--color-text-primary)', color: 'var(--color-gold)', padding: '5px 12px', fontSize: '12px', borderRadius: '6px', fontWeight: '600' }}>
              ★ {property.avg_rating} ({property.review_count} reviews)
            </span>
            {property.pets_allowed && (
              <span style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '5px 12px', fontSize: '12px', borderRadius: '6px', fontWeight: '600' }}>
                Pets Welcome{(property as { max_pets?: number }).max_pets ? ` · up to ${(property as { max_pets?: number }).max_pets}` : ''}
              </span>
            )}
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '16px', lineHeight: '1.2' }}>
            {property.name}
          </h1>

          {/* Quick Stats */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '20px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', marginBottom: '32px' }}>
            {[
              { icon: '👥', label: `${property.max_guests} Guests` },
              { icon: '🛏️', label: `${property.bedrooms} Bedroom${property.bedrooms !== 1 ? 's' : ''}` },
              { icon: '🌙', label: `Min ${property.min_nights} Night${property.min_nights !== 1 ? 's' : ''}` },
              { icon: '🚿', label: (() => {
                const detail = property.bathrooms_detail
                if (detail && detail.length > 0) {
                  const typeLabels: Record<string, string> = { ensuite: 'Private Attached', detached_private: 'Private Detached', shared: 'Shared' }
                  return detail.map(d => `${d.count} ${typeLabels[d.type] || d.type}`).join(', ')
                }
                return `${property.bathrooms} Bath${property.bathrooms !== 1 ? 's' : ''}`
              })() },
            ].map(stat => (
              <div key={stat.label} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                backgroundColor: 'var(--color-bg-soft)',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: 'var(--color-text-primary)',
              }}>
                <span style={{ fontSize: '15px' }}>{stat.icon}</span>
                {stat.label}
              </div>
            ))}
            {property.pets_allowed && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#E8F5E9', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', color: '#2E7D32' }}>
                <span style={{ fontSize: '15px' }}>🐾</span>
                Pets Welcome
              </div>
            )}
          </div>

          {/* Tabs - Vertical on Mobile, Horizontal on Desktop */}
          <div className="flex md:flex-row flex-col" style={{ gap: '0', marginBottom: '32px', borderBottom: 'none' }}>
            {/* Mobile: Vertical tabs with left border */}
            <div className="md:hidden flex flex-col w-full" style={{ borderRight: '1px solid var(--color-border)' }}>
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '16px 20px',
                    border: 'none',
                    borderLeft: activeTab === tab ? '3px solid var(--color-gold)' : '3px solid transparent',
                    borderRight: 'none',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: activeTab === tab ? '#f9f6f0' : 'transparent',
                    color: activeTab === tab ? 'var(--color-gold)' : 'var(--color-text-muted)',
                    fontSize: '13px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontWeight: activeTab === tab ? '700' : '500',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    textAlign: 'left' as const,
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Desktop: Horizontal tabs with bottom border */}
            <div className="hidden md:flex md:w-full" style={{ borderBottom: '1px solid var(--color-border)', overflowX: 'auto', scrollBehavior: 'smooth' }}>
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '14px 20px',
                    border: 'none',
                    borderBottom: activeTab === tab ? '2px solid var(--color-gold)' : '2px solid transparent',
                    backgroundColor: 'transparent',
                    color: activeTab === tab ? 'var(--color-gold)' : 'var(--color-text-muted)',
                    fontSize: '13px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontWeight: activeTab === tab ? '700' : '500',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', lineHeight: '1.9', marginBottom: '32px' }}>
                {property.description}
              </p>

              <div style={cardStyle}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '16px' }}>Property Contact</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Address', value: property.address },
                    { label: 'Phone', value: property.contact_phone },
                    { label: 'Email', value: property.contact_email },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '2px', fontWeight: '600' }}>{item.label}</p>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                {/* Highlight strip: key benefits */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {['Cleanliness', 'Good Locations', 'Easy Check-In', 'Functional Kitchen', 'Aesthetic Rooms', 'Pets Welcome Everywhere'].map(item => (
                    <span key={item} 
                      onMouseEnter={() => setHoveredTags(prev => ({ ...prev, [item]: true }))}
                      onMouseLeave={() => setHoveredTags(prev => ({ ...prev, [item]: false }))}
                      style={{
                      border: hoveredTags[item] ? '1px solid var(--color-navbar)' : '1px solid var(--color-border)',
                      backgroundColor: hoveredTags[item] ? 'var(--color-navbar)' : '#ffffff',
                      color: hoveredTags[item] ? '#ffffff' : 'var(--color-text-primary)',
                      padding: '6px 10px',
                      fontSize: '12px',
                      borderRadius: '999px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: hoveredTags[item] ? 'scale(1.05)' : 'scale(1)',
                    }}>
                      {item}
                    </span>
                  ))}
                </div>

                <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-gold)', borderRadius: '12px', padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '6px' }}>Important: Non-Refundable Booking</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>All bookings are non-refundable. Once payment is confirmed, cancellations will not be eligible for a refund. Please review your dates carefully before booking.</p>
                  </div>
                </div>
            </div>
          )}

          {/* Amenities */}
          {activeTab === 'amenities' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {property.amenities.map(amenity => (
                  <div key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <span style={{ color: 'var(--color-gold)', fontSize: '16px', fontWeight: '700' }}>&#10003;</span>
                    <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>{amenity}</span>
                  </div>
                ))}
                {property.pets_allowed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <span style={{ color: 'var(--color-gold)', fontSize: '16px', fontWeight: '700' }}>&#10003;</span>
                    <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>Pets (+&#8377;{property.pet_charge_per_night}/pet/night)</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '16px' }}>Bathroom Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                  {property.bathrooms_detail.map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                      <span style={{ color: 'var(--color-gold)', fontSize: '16px', fontWeight: '700' }}>&#10003;</span>
                      <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>{b.count}x {bathroomLabel[b.type]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '32px', ...cardStyle }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '16px' }}>Check In &amp; Out</h3>
                <div style={{ display: 'flex', gap: '32px' }}>
                  <div>
                    <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '600' }}>Check In</p>
                    <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{property.check_in_time}</p>
                  </div>
                  <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }} />
                  <div>
                    <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '600' }}>Check Out</p>
                    <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{property.check_out_time}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* House Rules */}
          {activeTab === 'house rules' && (
            <div>
              <div style={cardStyle}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>House Rules</h3>
                <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-gold)', marginBottom: '24px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {property.house_rules.map((rule, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: i < property.house_rules.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                      <span style={{ color: 'var(--color-gold)', fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>&#9675;</span>
                      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{rule}</p>
                    </div>
                  ))}
                </div>
              </div>

                {/* Highlight strip before non-refundable notice */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', margin: '12px 0 20px' }}>
                  {['Cleanliness', 'Good Locations', 'Ease Of Check-In', 'Functional Kitchen', 'Aesthetics Of The Room', 'Pets Welcome Everywhere'].map(item => (
                    <span key={item} 
                      onMouseEnter={() => setHoveredTags(prev => ({ ...prev, [item]: true }))}
                      onMouseLeave={() => setHoveredTags(prev => ({ ...prev, [item]: false }))}
                      style={{
                      border: '1px solid var(--color-navbar-border)',
                      backgroundColor: hoveredTags[item] ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
                      color: 'var(--color-navbar-text)',
                      padding: '8px 14px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: hoveredTags[item] ? 'translateY(-2px)' : 'translateY(0)',
                    }}>
                      {item}
                    </span>
                  ))}
                </div>

                <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-gold)', borderRadius: '12px', padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '6px' }}>Important: Non-Refundable Booking Policy</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>All bookings are non-refundable once payment is confirmed.</p>
                  </div>
                </div>
            </div>
          )}

          {/* Location */}
          {activeTab === 'location' && (
            <div>
              <div style={cardStyle}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '16px' }}>Address</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-gold)', fontSize: '18px', lineHeight: '1.2' }}>•</span>
                  <div>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: '700', marginBottom: '4px' }}>{property.name}</p>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{property.address}</p>
                  </div>
                </div>
              </div>

              <MapWrapper
                latitude={property.latitude}
                longitude={property.longitude}
                propertyName={property.name}
                address={property.address}
              />

              <div style={{ ...cardStyle, marginTop: '16px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '16px' }}>Contact Property</h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <a href={`tel:${property.contact_phone}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: '1px solid var(--color-gold)', borderRadius: '8px', color: 'var(--color-text-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                    {property.contact_phone}
                  </a>
                  <a href={`mailto:${property.contact_email}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: '1px solid var(--color-gold)', borderRadius: '8px', color: 'var(--color-text-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                    {property.contact_email}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div>
              <div style={{ ...cardStyle, display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '56px', color: 'var(--color-text-primary)', lineHeight: '1', fontWeight: '800' }}>{property.avg_rating}</p>
                  <p style={{ color: 'var(--color-gold)', fontSize: '20px', marginBottom: '4px' }}>{'★'.repeat(Math.floor(property.avg_rating))}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{property.review_count} review{property.review_count !== 1 ? 's' : ''}</p>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {starCounts.map(({ star, count }) => (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', width: '24px' }}>{star}★</span>
                      <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px' }}>
                        <div style={{
                          height: '100%', backgroundColor: 'var(--color-gold)', borderRadius: '3px',
                          width: reviews.length > 0 ? `${Math.round((count / reviews.length) * 100)}%` : '0%',
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', width: '16px', textAlign: 'right' }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {reviewsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Loading reviews…</div>
              ) : reviews.length === 0 ? (
                <div style={{ backgroundColor: '#ffffff', padding: '40px', border: '1px solid var(--color-border)', borderRadius: '12px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                  <p style={{ fontSize: '32px', marginBottom: '8px' }}>✦</p>
                  <p style={{ fontWeight: '700', marginBottom: '4px' }}>No reviews yet</p>
                  <p style={{ fontSize: '13px' }}>Be the first to stay here</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.map(review => (
                    <div key={review.id} style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--color-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-primary)', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
                            {review.guest_name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-text-primary)' }}>{review.guest_name}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{new Date(review.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                              {review.platform && <span style={{ fontSize: '10px', backgroundColor: '#E3F2FD', color: '#1565C0', padding: '2px 6px', borderRadius: '999px', fontWeight: '700', letterSpacing: '0.3px' }}>{review.platform}</span>}
                            </div>
                          </div>
                        </div>
                        <div style={{ color: 'var(--color-gold)', fontSize: '14px' }}>{'★'.repeat(review.rating)}</div>
                      </div>
                      {review.comment && <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Booking Widget */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '12px' }} className="sticky-desktop md:sticky p-4 sm:p-6 md:p-8">
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-text-primary)' }}>&#8377;{property.price_per_night.toLocaleString('en-IN')}</span>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginLeft: '6px' }}>/ night</span>
          </div>

          <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', marginBottom: '12px' }}>
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid var(--color-border)',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '12px',
              }}
            >
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: '600' }}>Check In</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{formatDateLabel(range?.from)}</p>
              </div>
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: '600' }}>Check Out</p>
                <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{formatDateLabel(range?.to)}</p>
              </div>
            </div>
            <div style={{ padding: '12px 8px', borderBottom: '1px solid var(--color-border)' }} className="sm:!px-4">
              <div className="earthy-day-picker">
                <DayPicker
                  mode="range"
                  selected={range}
                  onSelect={handleRangeSelect}
                  disabled={[{ before: today }, ...(range?.from ? [{ before: range.from }] : []), ...disabledRanges]}
                  fromDate={today}
                  numberOfMonths={1}
                />
              </div>
              {(range?.from || range?.to) && (
                <button
                  onClick={() => {
                    setRange(undefined)
                    setCheckIn('')
                    setCheckOut('')
                    setBookingError(null)
                  }}
                  style={{
                    marginTop: '10px',
                    background: 'none',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-primary)',
                    padding: '8px 12px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Clear dates
                </button>
              )}
            </div>
            {bookingError && (
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)' }}>
                <p style={{ color: '#C62828', fontSize: '12px', margin: 0 }}>{bookingError}</p>
              </div>
            )}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
              <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px', fontWeight: '600' }}>Guests</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => setGuests(Math.max(1, guests - 1))} style={{ border: '1px solid var(--color-border)', backgroundColor: '#ffffff', width: '36px', height: '36px', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', fontWeight: '700' }}>−</button>
                <span style={{ minWidth: '45px', textAlign: 'center', fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{guests}</span>
                <button onClick={() => setGuests(Math.min(property.max_guests, guests + 1))} style={{ border: '1px solid var(--color-border)', backgroundColor: '#ffffff', width: '36px', height: '36px', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', fontWeight: '700' }}>+</button>
              </div>
            </div>
            {property.pets_allowed && (
              <div style={{ padding: '12px 16px' }}>
                <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px', fontWeight: '600' }}>Pets (+&#8377;{property.pet_charge_per_night}/pet/night)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <button onClick={() => setPets(Math.max(0, pets - 1))} style={{ border: '1px solid var(--color-border)', backgroundColor: '#ffffff', width: '36px', height: '36px', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', fontWeight: '700' }}>−</button>
                  <span style={{ minWidth: '45px', textAlign: 'center', fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{pets}</span>
                  <button onClick={() => setPets(Math.min(property.max_pets || 0, pets + 1))} style={{ border: '1px solid var(--color-border)', backgroundColor: '#ffffff', width: '36px', height: '36px', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', fontWeight: '700' }}>+</button>
                </div>
              </div>
            )}
          </div>

          {nights > 0 && (
            <div style={{ backgroundColor: 'var(--color-bg-soft)', padding: '16px', marginBottom: '16px', fontSize: '14px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--color-text-secondary)' }}>
                <span>&#8377;{property.price_per_night.toLocaleString('en-IN')} x {nights} nights</span>
                <span>&#8377;{basePrice.toLocaleString('en-IN')}</span>
              </div>
              {pets > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--color-text-secondary)' }}>
                  <span>{pets} pet{pets > 1 ? 's' : ''} x {nights} nights</span>
                  <span>&#8377;{petCharge.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--color-text-secondary)' }}>
                <span>Cleaning fee</span>
                <span>&#8377;{property.cleaning_fee.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: 'var(--color-text-primary)', fontSize: '15px' }}>
                <span>Total</span>
                <span>&#8377;{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {property.min_nights > 1 && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px', textAlign: 'center' }}>
              Minimum stay: {property.min_nights} nights
            </p>
          )}

          <button
            onClick={handleBook}
            style={{ width: '100%', backgroundColor: 'var(--color-gold)', color: 'var(--color-text-primary)', border: 'none', padding: '18px', fontSize: '14px', letterSpacing: '2px', fontWeight: '700', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '12px', borderRadius: '8px', transition: 'all 0.2s ease' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            Reserve Now
          </button>

          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: '1.6' }}>
            Important: This booking is <strong>non-refundable</strong>
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
