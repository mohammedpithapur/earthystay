'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState('1')
  const [pets, setPets] = useState('0')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (guests) params.set('guests', guests)
    if (pets && pets !== '0') params.set('pets', pets)
    router.push(`/properties?${params.toString()}`)
  }

  const fieldStyle = {
    minWidth: 0,
    padding: '12px 16px',
    borderRight: 'none',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  }

  const labelStyle = {
    fontSize: '10px',
    letterSpacing: '1.5px',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase' as const,
    fontWeight: '600' as const,
  }

  const inputStyle = {
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    backgroundColor: 'transparent',
    width: '100%',
    fontFamily: "'Figtree', sans-serif",
  }

  return (
    <section style={{ position: 'relative', minHeight: 'clamp(620px, 100vh, 920px)', overflow: 'hidden' }}>

      {/* Background Image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />

      {/* Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.65) 100%)'
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        textAlign: 'center',
      }}>

        <p style={{
          color: 'var(--color-gold)',
          fontSize: '18px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          marginTop: '80px',
          marginBottom: '20px',
          fontWeight: '600',
        }}>
          Curated Luxury Stays
        </p>

        <h1 style={{
          color: '#ffffff',
          fontSize: 'clamp(36px, 6vw, 80px)',
          fontWeight: '800',
          lineHeight: '1.1',
          marginBottom: '24px',
          maxWidth: '820px',
        }}>
          Discover Your Perfect{' '}
          <em style={{ color: 'var(--color-gold)', fontStyle: 'italic' }}>Earthy Escape</em>
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.85)',
          fontSize: '24px',
          marginBottom: '48px',
          maxWidth: '500px',
          lineHeight: '1.7',
          fontWeight: '400',
        }}>
          Handpicked luxury properties across India&apos;s most beautiful destinations
        </p>

        {/* Mobile Search Hint */}
        <p className="lg:hidden" style={{
          color: 'var(--color-gold)',
          fontSize: '12px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '24px',
          fontWeight: '600',
        }}>
          Scroll down to search properties
        </p>

        {/* Search Bar - Responsive */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.98)',
          borderRadius: '12px',
          padding: '12px',
          gap: '8px',
          width: '100%',
          maxWidth: '900px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.28)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        }}>

          <div style={fieldStyle}>
            <label style={labelStyle}>Destination</label>
            <input
              type="text"
              placeholder="Where are you going?"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="hero-search-input"
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Check In</label>
            <input
              type="date"
              value={checkIn}
              onChange={e => setCheckIn(e.target.value)}
              className="hero-search-input"
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Check Out</label>
            <input
              type="date"
              value={checkOut}
              onChange={e => setCheckOut(e.target.value)}
              className="hero-search-input"
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Guests</label>
            <select
              value={guests}
              onChange={e => setGuests(e.target.value)}
              className="hero-search-input"
              style={inputStyle}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Pets</label>
            <select
              value={pets}
              onChange={e => setPets(e.target.value)}
              className="hero-search-input"
              style={inputStyle}
            >
              <option value="0">No Pets</option>
              {[1,2,3,4].map(n => (
                <option key={n} value={n}>{n} Pet{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSearch}
            style={{
              backgroundColor: 'var(--color-gold)',
              color: 'var(--color-text-primary)',
              border: 'none',
              padding: '14px 28px',
              fontSize: '13px',
              letterSpacing: '1.5px',
              fontWeight: '700',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '8px',
              whiteSpace: 'nowrap',
              margin: '4px',
              transition: 'opacity 0.2s ease',
              minHeight: '50px',
              gridColumn: 'span 1',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
          >
            Search
          </button>
        </div>

        {/* Stats */}
        <div className="hero-stats">
          {[
            { number: '50+', label: 'Properties' },
            { number: '20+', label: 'Destinations' },
            { number: '4.9 stars', label: 'Average Rating' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                color: 'var(--color-gold)',
                fontSize: '28px',
                fontWeight: '700',
              }}>
                {stat.number}
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '12px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginTop: '4px',
                fontWeight: '500',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}