'use client'
import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { dummyProperties } from '@/lib/data/properties'
import PropertyCard from '@/components/property/PropertyCard'

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

    result = result.filter(p =>
      p.price_per_night >= minPrice &&
      p.price_per_night <= maxPrice
    )

    if (bedrooms > 0) {
      result = result.filter(p => p.bedrooms >= bedrooms)
    }

    if (petsOnly) {
      result = result.filter(p => p.pets_allowed)
    }

    if (bathroomType !== 'all') {
      result = result.filter(p =>
        p.bathrooms_detail.some(b => b.type === bathroomType)
      )
    }

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
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh' }}>

      {/* Page Header */}
      <div style={{ backgroundColor: '#1C1C1C', padding: '48px 24px', textAlign: 'center' }}>
        <p style={{ color: '#C9A84C', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px' }}>
          Explore
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', color: '#FAF8F5', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '400', marginBottom: '8px' }}>
          Our Properties
        </h1>
        <p style={{ color: 'rgba(250,248,245,0.6)', fontSize: '14px' }}>
          {filtered.length} properties found
        </p>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px', display: 'flex', gap: '32px', alignItems: 'flex-start' }}>

        {/* Filter Sidebar */}
        <aside style={{ width: '280px', flexShrink: 0, backgroundColor: '#FFFFFF', padding: '32px 24px', position: 'sticky', top: '100px', border: '1px solid #E5E0D8' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1C1C1C' }}>Filters</h3>
            <button onClick={resetFilters} style={{ background: 'none', border: 'none', color: '#C9A84C', fontSize: '13px', cursor: 'pointer' }}>
              Reset All
            </button>
          </div>

          {/* Location */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '12px' }}>
              Destination
            </label>
            <input
              type="text"
              placeholder="City or State..."
              value={location}
              onChange={e => setLocation(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #E5E0D8', fontSize: '14px', color: '#1C1C1C', outline: 'none', backgroundColor: '#FAF8F5' }}
            />
          </div>

          <div style={{ height: '1px', backgroundColor: '#E5E0D8', marginBottom: '28px' }} />

          {/* Price */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '12px' }}>
              Price Per Night
            </label>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', color: '#1C1C1C', fontWeight: '600' }}>₹{minPrice.toLocaleString('en-IN')}</span>
              <span style={{ fontSize: '14px', color: '#1C1C1C', fontWeight: '600' }}>₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input type="range" min={0} max={20000} step={500} value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width: '100%', accentColor: '#C9A84C' }} />
          </div>

          <div style={{ height: '1px', backgroundColor: '#E5E0D8', marginBottom: '28px' }} />

          {/* Bedrooms */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '12px' }}>
              Minimum Bedrooms
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[0, 1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  onClick={() => setBedrooms(num)}
                  style={{
                    padding: '8px 14px',
                    border: `1px solid ${bedrooms === num ? '#C9A84C' : '#E5E0D8'}`,
                    backgroundColor: bedrooms === num ? '#C9A84C' : 'transparent',
                    color: bedrooms === num ? '#1C1C1C' : '#555',
                    fontSize: '13px', cursor: 'pointer',
                    fontWeight: bedrooms === num ? '600' : '400',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {num === 0 ? 'Any' : `${num}+`}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#E5E0D8', marginBottom: '28px' }} />

          {/* Bathroom Type */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '12px' }}>
              Bathroom Type
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { value: 'all', label: '🚿 Any Type' },
                { value: 'ensuite', label: '🛁 Private Ensuite' },
                { value: 'detached_private', label: '🚪 Detached Private' },
                { value: 'shared', label: '👥 Shared' },
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setBathroomType(option.value)}
                  style={{
                    padding: '10px 14px',
                    border: `1px solid ${bathroomType === option.value ? '#C9A84C' : '#E5E0D8'}`,
                    backgroundColor: bathroomType === option.value ? '#C9A84C' : 'transparent',
                    color: bathroomType === option.value ? '#1C1C1C' : '#555',
                    fontSize: '13px', cursor: 'pointer',
                    fontWeight: bathroomType === option.value ? '600' : '400',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: '#E5E0D8', marginBottom: '28px' }} />

          {/* Pets */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '12px' }}>
              Pet Friendly
            </label>
            <button
              onClick={() => setPetsOnly(!petsOnly)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div style={{ width: '44px', height: '24px', backgroundColor: petsOnly ? '#C9A84C' : '#E5E0D8', borderRadius: '12px', position: 'relative', transition: 'background-color 0.3s ease' }}>
                <div style={{ position: 'absolute', top: '3px', left: petsOnly ? '23px' : '3px', width: '18px', height: '18px', backgroundColor: '#FFFFFF', borderRadius: '50%', transition: 'left 0.3s ease' }} />
              </div>
              <span style={{ fontSize: '14px', color: '#1C1C1C' }}>🐾 Pets Allowed Only</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div style={{ flex: 1 }}>

          {/* Sort Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ color: '#555', fontSize: '14px' }}>
              Showing <strong>{filtered.length}</strong> properties
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <label style={{ fontSize: '12px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase' }}>Sort By</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ padding: '10px 16px', border: '1px solid #E5E0D8', backgroundColor: '#FFFFFF', fontSize: '14px', color: '#1C1C1C', outline: 'none', cursor: 'pointer' }}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
              {filtered.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏡</div>
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#1C1C1C', marginBottom: '12px' }}>No properties found</h3>
              <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>Try adjusting your filters to find your perfect stay</p>
              <button
                onClick={resetFilters}
                style={{ backgroundColor: '#C9A84C', color: '#1C1C1C', border: 'none', padding: '14px 32px', fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer' }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}