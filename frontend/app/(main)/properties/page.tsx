'use client'
import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { dummyProperties } from '@/lib/data/properties'
import PropertyCard from '@/components/property/PropertyCard'

const bathroomOptions = [
  { value: 'all', label: 'Any Type' },
  { value: 'ensuite', label: 'Private Ensuite' },
  { value: 'detached_private', label: 'Detached Private' },
  { value: 'shared', label: 'Shared' },
]

export default function PropertiesPage() {
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

  const labelStyle = {
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    color: '#888',
    display: 'block',
    marginBottom: '12px',
    fontWeight: '600' as const,
  }

  return (
    <div className="page-shell" style={{ backgroundColor: '#ffffff' }}>

      {/* Page Header */}
      <div style={{ backgroundColor: '#2c2c2c', padding: '64px 24px', textAlign: 'center' }}>
        <p style={{ color: '#e1c391', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>
          Explore
        </p>
        <h1 style={{ color: '#ffffff', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '800', marginBottom: '8px' }}>
          Our Properties
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px' }}>
          {filtered.length} properties found
        </p>
      </div>

      <div className="content-shell-lg" style={{ padding: '48px 0 72px' }}>
      <div className="responsive-grid-2col">

        {/* Filter Sidebar */}
        <aside className="sticky-desktop" style={{
          backgroundColor: '#ffffff',
          padding: '32px 24px',
          border: '1px solid #e0d9c0',
          borderRadius: '12px',
        }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>Filters</h3>
            <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#e1c391', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
              Reset All
            </button>
          </div>

          {/* Location */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Destination</label>
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

          <div style={{ height: '1px', backgroundColor: '#e0d9c0', marginBottom: '28px' }} />

          {/* Price */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Price Per Night</label>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: '600' }}>₹{minPrice.toLocaleString('en-IN')}</span>
              <span style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: '600' }}>₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input type="range" min={0} max={20000} step={500} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width: '100%', accentColor: '#e1c391' }} />
          </div>

          <div style={{ height: '1px', backgroundColor: '#e0d9c0', marginBottom: '28px' }} />

          {/* Bedrooms */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Minimum Bedrooms</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[0, 1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => setBedrooms(num)}
                  style={{
                    padding: '8px 14px',
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

          <div style={{ height: '1px', backgroundColor: '#e0d9c0', marginBottom: '28px' }} />

          {/* Bathroom Type */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Bathroom Type</label>
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

          <div style={{ height: '1px', backgroundColor: '#e0d9c0', marginBottom: '28px' }} />

          {/* Pets */}
          <div style={{ marginBottom: '28px' }}>
            <label style={labelStyle}>Pet Friendly</label>
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
        </aside>

        {/* Main Content */}
        <div style={{ minWidth: 0 }}>

          {/* Sort Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ color: '#555', fontSize: '15px' }}>
              Showing <strong>{filtered.length}</strong> properties
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          </div>

          {/* Grid */}
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
      </div>
    </div>
  )
}