"use client"
import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import PropertyCard from '@/components/property/PropertyCard'
import { buildApiUrl } from '@/lib/api'
import type { Property } from '@/lib/types'

const roomTypeOptions = [
  { value: 'all', label: 'Any Room Type' },
  { value: 'shared', label: 'Shared' },
  { value: 'private', label: 'Private' },
]

const propertyTypeOptions = [
  { value: 'all', label: 'Any Type' },
  { value: 'rooms', label: 'Rooms' },
  { value: 'entire_house', label: 'Entire House' },
]

const bathroomTypeOptions = [
  { value: 'all', label: 'Any Type' },
  { value: 'ensuite', label: 'Ensuite' },
  { value: 'shared', label: 'Shared' },
  { value: 'detached_private', label: 'Detached Private' },
]

const formatPrice = (value: number) => {
  if (value >= 1000000) {
    const lakhs = value / 100000
    return `₹${Number.isInteger(lakhs) ? lakhs.toFixed(0) : lakhs.toFixed(1)} Lakhs`
  }

  return `₹${value.toLocaleString('en-IN')}`
}

const getRoomType = (property: Property) => (
  property.bathrooms_detail.some(bathroom => bathroom.type === 'shared') ? 'shared' : 'private'
)

const getPropertyType = (property: Property) => {
  const name = property.name.toLowerCase()

  if (name.includes('villa') || name.includes('haveli') || name.includes('house')) {
    return 'entire_house'
  }

  return 'rooms'
}

export default function PropertiesClient() {
  const searchParams = useSearchParams()

  const initialLocation = searchParams.get('location') || ''
  const initialPets = searchParams.get('pets') || '0'

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [location, setLocation] = useState(initialLocation)
  const [maxPrice, setMaxPrice] = useState(1000000)
  const [minPrice, setMinPrice] = useState(1000)
  const [minBedrooms, setMinBedrooms] = useState(1)
  const [petsOnly, setPetsOnly] = useState(initialPets !== '0')
  const [roomType, setRoomType] = useState('all')
  const [propertyType, setPropertyType] = useState('all')
  const [bathroomType, setBathroomType] = useState('all')
  const [sortBy, setSortBy] = useState('rating')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      try {
        setLoading(true)
        setLoadError(null)
        const response = await fetch(buildApiUrl('/properties?limit=200'), { cache: 'no-store' })
        if (!response.ok) {
          throw new Error(`Failed to load properties (${response.status})`)
        }
        const data = await response.json()
        if (isMounted) {
          setProperties(Array.isArray(data.items) ? data.items : [])
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load properties')
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
  }, [])

  const filtered = useMemo(() => {
    let result = [...properties]
    if (location) {
      result = result.filter(p =>
        p.city.toLowerCase().includes(location.toLowerCase()) ||
        p.state.toLowerCase().includes(location.toLowerCase())
      )
    }
    result = result.filter(p => p.price_per_night >= minPrice && p.price_per_night <= maxPrice)
    if (minBedrooms > 1) result = result.filter(p => p.bedrooms >= minBedrooms)
    if (petsOnly) result = result.filter(p => p.pets_allowed)
    if (roomType !== 'all') result = result.filter(p => getRoomType(p) === roomType)
    if (propertyType !== 'all') result = result.filter(p => getPropertyType(p) === propertyType)
    if (bathroomType !== 'all') result = result.filter(p => p.bathrooms_detail.some(b => b.type === bathroomType))
    if (sortBy === 'rating') result.sort((a, b) => b.avg_rating - a.avg_rating)
    else if (sortBy === 'price_low') result.sort((a, b) => a.price_per_night - b.price_per_night)
    else if (sortBy === 'price_high') result.sort((a, b) => b.price_per_night - a.price_per_night)
    else if (sortBy === 'reviews') result.sort((a, b) => b.review_count - a.review_count)
    return result
  }, [location, minPrice, maxPrice, minBedrooms, petsOnly, roomType, propertyType, bathroomType, sortBy])

  const resetFilters = () => {
    setLocation('')
    setMinPrice(1000)
    setMaxPrice(1000000)
    setMinBedrooms(1)
    setPetsOnly(false)
    setRoomType('all')
    setPropertyType('all')
    setBathroomType('all')
    setSortBy('rating')
  }

  if (loading) {
    return (
      <div className="page-shell" style={{ backgroundColor: '#ffffff' }}>
        <div style={{ padding: '120px 24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading properties...
        </div>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="page-shell" style={{ backgroundColor: '#ffffff' }}>
        <div style={{ padding: '120px 24px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          {loadError}
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell" style={{ backgroundColor: '#ffffff' }}>
      <div style={{ backgroundColor: 'var(--color-navbar)', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-navbar-text)', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>
          Explore
        </p>
        <h1 style={{ color: 'var(--color-navbar-text)', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '800', marginBottom: '8px' }}>
          Our Properties
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '15px' }}>
          Escape to thoughtfully curated stays inspired by nature, comfort, and local experiences.
        </p>
      </div>

      <div className="content-shell-lg" style={{ padding: '48px 24px 72px' }}>
        <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFiltersOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2.586a1 1 0 0 1-.293.707l-6.414 6.414a1 1 0 0 0-.293.707V17l-4 4v-6.586a1 1 0 0 0-.293-.707L3.293 7.293A1 1 0 0 1 3 6.586V4z" />
            </svg>
            Filters
          </button>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
            <strong>{filtered.length}</strong> properties
          </p>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '28px', gap: '12px' }}>
            <label style={{ fontSize: '12px', color: 'var(--color-text-muted)', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '600' }}>Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                fontSize: '14px',
                color: 'var(--color-text-primary)',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="rating">Highest Rated</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>

          {filtered.length > 0 ? (
            <div className="responsive-card-grid">
              {filtered.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '80px 24px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', color: 'var(--color-gold)' }}>[ ]</div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '12px' }}>No properties found</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>Try adjusting your filters to find your perfect stay</p>
              <button
                onClick={resetFilters}
                style={{
                  backgroundColor: 'var(--color-gold)',
                  color: 'var(--color-text-primary)',
                  border: 'none',
                  padding: '14px 32px',
                  fontSize: '13px',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  fontWeight: '700',
                  cursor: 'pointer',
                  borderRadius: '8px',
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {filtersOpen && (
        <>
          <div
            onClick={() => setFiltersOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 40,
              animation: 'fadeIn 0.3s ease',
            }}
          />

          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '480px',
              backgroundColor: '#ffffff',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-4px 0 16px rgba(0,0,0,0.15)',
              animation: 'slideIn 0.3s ease',
            }}
            className="md:max-w-[480px]"
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '24px',
              borderBottom: '1px solid var(--color-border)',
              flexShrink: 0,
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-text-primary)' }}>Filters</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  padding: '0',
                  lineHeight: '1',
                }}
              >
                ×
              </button>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '28px',
            }}>
              <div>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '12px', fontWeight: '600' }}>Destination</label>
                <input
                  type="text"
                  placeholder="City or State..."
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: 'var(--color-text-primary)',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box' as const,
                  }}
                />
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

              <div>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '12px', fontWeight: '600' }}>Price Per Night</label>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '600' }}>{formatPrice(minPrice)}</span>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '600' }}>{formatPrice(maxPrice)}</span>
                </div>
                <input type="range" min={0} max={1000000} step={5000} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--color-gold)' }} />
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

              <div>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '12px', fontWeight: '600' }}>Minimum Bedrooms</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setMinBedrooms(Math.max(1, minBedrooms - 1))}
                    style={{
                      padding: '10px 14px',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      color: 'var(--color-text-primary)',
                      fontSize: '18px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      minWidth: '44px',
                      textAlign: 'center',
                    }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={minBedrooms}
                    onChange={e => {
                      const val = parseInt(e.target.value) || 1
                      if (val >= 1 && val <= 100) setMinBedrooms(val)
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: 'var(--color-text-primary)',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      boxSizing: 'border-box',
                      textAlign: 'center',
                      fontWeight: '600',
                    }}
                  />
                  <button
                    onClick={() => setMinBedrooms(Math.min(100, minBedrooms + 1))}
                    style={{
                      padding: '10px 14px',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      backgroundColor: '#ffffff',
                      color: 'var(--color-text-primary)',
                      fontSize: '18px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      minWidth: '44px',
                      textAlign: 'center',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

              <div>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '12px', fontWeight: '600' }}>Room Type</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {roomTypeOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setRoomType(option.value)}
                      style={{
                        padding: '10px 14px',
                        border: `1px solid ${roomType === option.value ? 'var(--color-gold)' : 'var(--color-border)'}`,
                        borderRadius: '8px',
                        backgroundColor: roomType === option.value ? 'var(--color-gold)' : 'transparent',
                        color: roomType === option.value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: roomType === option.value ? '700' : '400',
                        textAlign: 'left' as const,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

              <div>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '12px', fontWeight: '600' }}>Property Type</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {propertyTypeOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setPropertyType(option.value)}
                      style={{
                        padding: '10px 14px',
                        border: `1px solid ${propertyType === option.value ? 'var(--color-gold)' : 'var(--color-border)'}`,
                        borderRadius: '8px',
                        backgroundColor: propertyType === option.value ? 'var(--color-gold)' : 'transparent',
                        color: propertyType === option.value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: propertyType === option.value ? '700' : '400',
                        textAlign: 'left' as const,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

              <div>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '12px', fontWeight: '600' }}>Bathroom Type</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {bathroomTypeOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setBathroomType(option.value)}
                      style={{
                        padding: '10px 14px',
                        border: `1px solid ${bathroomType === option.value ? 'var(--color-gold)' : 'var(--color-border)'}`,
                        borderRadius: '8px',
                        backgroundColor: bathroomType === option.value ? 'var(--color-gold)' : 'transparent',
                        color: bathroomType === option.value ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: bathroomType === option.value ? '700' : '400',
                        textAlign: 'left' as const,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

              <div>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '12px', fontWeight: '600' }}>Pet Friendly</label>
                <button
                  onClick={() => setPetsOnly(!petsOnly)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <div style={{ width: '44px', height: '24px', backgroundColor: petsOnly ? 'var(--color-gold)' : 'var(--color-border)', borderRadius: '12px', position: 'relative', transition: 'background-color 0.3s ease' }}>
                    <div style={{ position: 'absolute', top: '3px', left: petsOnly ? '23px' : '3px', width: '18px', height: '18px', backgroundColor: '#ffffff', borderRadius: '50%', transition: 'left 0.3s ease' }} />
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '500' }}>Pets Allowed</span>
                </button>
              </div>
            </div>

            <div style={{
              padding: '24px',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              gap: '12px',
              flexShrink: 0,
            }}>
              <button
                onClick={resetFilters}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: 'var(--color-text-primary)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Reset
              </button>
              <button
                onClick={() => setFiltersOpen(false)}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: 'var(--color-gold)',
                  color: 'var(--color-text-primary)',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s ease',
                }}
              >
                Show Results
              </button>
            </div>

            <style>{`\n              @keyframes slideIn {\n                from {\n                  transform: translateX(100%);\n                }\n                to {\n                  transform: translateX(0);\n                }\n              }\n              @keyframes fadeIn {\n                from {\n                  opacity: 0;\n                }\n                to {\n                  opacity: 1;\n                }\n              }\n            `}</style>
          </div>
        </>
      )}
    </div>
  )
}

