"use client"
import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { dummyProperties } from '@/lib/data/properties'
import PropertyCard from '@/components/property/PropertyCard'

const bathroomOptions = [
  { value: 'all', label: 'Any Type' },
  { value: 'ensuite', label: 'Private Ensuite' },
  { value: 'detached_private', label: 'Detached Private' },
  { value: 'shared', label: 'Shared' },
]

export default function PropertiesClient() {
  const searchParams = useSearchParams()

  const initialLocation = searchParams.get('location') || ''
  const initialPets = searchParams.get('pets') || '0'

  const [location, setLocation] = useState(initialLocation)
  const [maxPrice, setMaxPrice] = useState(20000)
  const [minPrice, setMinPrice] = useState(0)
  const [bedrooms, setBedrooms] = useState(0)
  const [petsOnly, setPetsOnly] = useState(initialPets !== '0')
  const [bathroomType, setBathroomType] = useState('all')
  const [sortBy, setSortBy] = useState('rating')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const filtered = useMemo(() => {
    let result = [...dummyProperties]
    if (location) {
      result = result.filter(p =>
        p.city.toLowerCase().includes(location.toLowerCase()) ||
        p.state.toLowerCase().includes(location.toLowerCase())
      )
    }
    result = result.filter(p => p.price_per_night >= minPrice && p.price_per_night <= maxPrice)
    if (bedrooms > 0) result = result.filter(p => p.bedrooms >= bedrooms)
    if (petsOnly) result = result.filter(p => p.pets_allowed)
    if (bathroomType !== 'all') result = result.filter(p => p.bathrooms_detail.some(b => b.type === bathroomType))
    if (sortBy === 'rating') result.sort((a, b) => b.avg_rating - a.avg_rating)
    else if (sortBy === 'price_low') result.sort((a, b) => a.price_per_night - b.price_per_night)
    else if (sortBy === 'price_high') result.sort((a, b) => b.price_per_night - a.price_per_night)
    else if (sortBy === 'reviews') result.sort((a, b) => b.review_count - a.review_count)
    return result
  }, [location, minPrice, maxPrice, bedrooms, petsOnly, bathroomType, sortBy])

  const resetFilters = () => {
    setLocation('')
    setMinPrice(0)
    setMaxPrice(20000)
    setBedrooms(0)
    setPetsOnly(false)
    setBathroomType('all')
    setSortBy('rating')
  }

  return (
    <div className="page-shell" style={{ backgroundColor: '#ffffff' }}>
      <div style={{ backgroundColor: 'var(--color-navbar)', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ color: '#e1c391', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>
          Explore
        </p>
        <h1 style={{ color: '#1a1a1a', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '800', marginBottom: '8px' }}>
          Our Properties
        </h1>
        <p style={{ color: 'rgba(26,26,26,0.72)', fontSize: '15px' }}>
          {filtered.length} properties found
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
              border: '1px solid #e0d9c0',
              borderRadius: '8px',
              backgroundColor: '#ffffff',
              color: '#1a1a1a',
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
          <p style={{ color: '#555', fontSize: '14px' }}>
            <strong>{filtered.length}</strong> properties
          </p>
        </div>

        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '28px', gap: '12px' }}>
            <label style={{ fontSize: '12px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '600' }}>Sort By</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{
                padding: '10px 16px',
                border: '1px solid #e0d9c0',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                fontSize: '14px',
                color: '#1a1a1a',
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
              border: '1px solid #e0d9c0',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', color: '#e1c391' }}>[ ]</div>
              <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginBottom: '12px' }}>No properties found</h3>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>Try adjusting your filters to find your perfect stay</p>
              <button
                onClick={resetFilters}
                style={{
                  backgroundColor: '#e1c391',
                  color: '#1a1a1a',
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
              borderBottom: '1px solid #e0d9c0',
              flexShrink: 0,
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1a1a1a' }}>Filters</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  color: '#1a1a1a',
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
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '12px', fontWeight: '600' }}>Destination</label>
                <input
                  type="text"
                  placeholder="City or State..."
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e0d9c0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1a1a1a',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                    boxSizing: 'border-box' as const,
                  }}
                />
              </div>

              <div style={{ height: '1px', backgroundColor: '#e0d9c0' }} />

              <div>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '12px', fontWeight: '600' }}>Price Per Night</label>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: '600' }}>₹{minPrice.toLocaleString('en-IN')}</span>
                  <span style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: '600' }}>₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input type="range" min={0} max={20000} step={500} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width: '100%', accentColor: '#e1c391' }} />
              </div>

              <div style={{ height: '1px', backgroundColor: '#e0d9c0' }} />

              <div>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '12px', fontWeight: '600' }}>Minimum Bedrooms</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[0, 1, 2, 3, 4, 5].map(num => (
                    <button
                      key={num}
                      onClick={() => setBedrooms(num)}
                      style={{
                        padding: '10px 14px',
                        border: `1px solid ${bedrooms === num ? '#e1c391' : '#e0d9c0'}`,
                        borderRadius: '8px',
                        backgroundColor: bedrooms === num ? '#e1c391' : 'transparent',
                        color: bedrooms === num ? '#1a1a1a' : '#555',
                        fontSize: '13px',
                        cursor: 'pointer',
                        fontWeight: bedrooms === num ? '700' : '400',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {num === 0 ? 'Any' : `${num}+`}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: '#e0d9c0' }} />

              <div>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '12px', fontWeight: '600' }}>Bathroom Type</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {bathroomOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setBathroomType(option.value)}
                      style={{
                        padding: '10px 14px',
                        border: `1px solid ${bathroomType === option.value ? '#e1c391' : '#e0d9c0'}`,
                        borderRadius: '8px',
                        backgroundColor: bathroomType === option.value ? '#e1c391' : 'transparent',
                        color: bathroomType === option.value ? '#1a1a1a' : '#555',
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

              <div style={{ height: '1px', backgroundColor: '#e0d9c0' }} />

              <div>
                <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '12px', fontWeight: '600' }}>Pet Friendly</label>
                <button
                  onClick={() => setPetsOnly(!petsOnly)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <div style={{ width: '44px', height: '24px', backgroundColor: petsOnly ? '#e1c391' : '#e0d9c0', borderRadius: '12px', position: 'relative', transition: 'background-color 0.3s ease' }}>
                    <div style={{ position: 'absolute', top: '3px', left: petsOnly ? '23px' : '3px', width: '18px', height: '18px', backgroundColor: '#ffffff', borderRadius: '50%', transition: 'left 0.3s ease' }} />
                  </div>
                  <span style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: '500' }}>Pets Allowed Only</span>
                </button>
              </div>
            </div>

            <div style={{
              padding: '24px',
              borderTop: '1px solid #e0d9c0',
              display: 'flex',
              gap: '12px',
              flexShrink: 0,
            }}>
              <button
                onClick={resetFilters}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  border: '1px solid #e0d9c0',
                  borderRadius: '8px',
                  backgroundColor: '#ffffff',
                  color: '#1a1a1a',
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
                  backgroundColor: '#e1c391',
                  color: '#1a1a1a',
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
