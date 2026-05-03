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

  return (
    <section style={{ position: 'relative', height: '100vh', minHeight: '600px', overflow: 'hidden' }}>

      {/* Background Image */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />

      {/* Dark Overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.7) 100%)'
      }} />

      {/* Hero Content */}
      <div style={{
        position: 'relative', zIndex: 10,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        textAlign: 'center'
      }}>

        {/* Tagline */}
        <p style={{
          color: '#C9A84C',
          fontSize: '13px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          marginBottom: '16px'
        }}>
          Curated Luxury Stays
        </p>

        {/* Main Heading */}
        <h1 style={{
          fontFamily: 'Georgia, serif',
          color: '#FAF8F5',
          fontSize: 'clamp(36px, 6vw, 80px)',
          fontWeight: '400',
          lineHeight: '1.1',
          marginBottom: '24px',
          maxWidth: '800px'
        }}>
          Discover Your Perfect <br />
          <em style={{ color: '#C9A84C' }}>Earthy Escape</em>
        </h1>

        {/* Subtitle */}
        <p style={{
          color: 'rgba(250,248,245,0.85)',
          fontSize: '16px',
          marginBottom: '48px',
          maxWidth: '500px',
          lineHeight: '1.6'
        }}>
          Handpicked luxury properties across India's most beautiful destinations
        </p>

        {/* Search Bar */}
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.97)',
          borderRadius: '4px',
          padding: '8px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          width: '100%',
          maxWidth: '1000px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>

          {/* Location */}
          <div style={{
            flex: '1 1 200px',
            padding: '12px 16px',
            borderRight: '1px solid #E5E0D8',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <label style={{ fontSize: '10px', letterSpacing: '1.5px', color: '#888', textTransform: 'uppercase', fontWeight: '600' }}>
              Destination
            </label>
            <input
              type="text"
              placeholder="Where are you going?"
              value={location}
              onChange={e => setLocation(e.target.value)}
              style={{
                border: 'none', outline: 'none',
                fontSize: '14px', color: '#1C1C1C',
                backgroundColor: 'transparent',
                width: '100%'
              }}
            />
          </div>

          {/* Check In */}
          <div style={{
            flex: '1 1 150px',
            padding: '12px 16px',
            borderRight: '1px solid #E5E0D8',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <label style={{ fontSize: '10px', letterSpacing: '1.5px', color: '#888', textTransform: 'uppercase', fontWeight: '600' }}>
              Check In
            </label>
            <input
              type="date"
              value={checkIn}
              onChange={e => setCheckIn(e.target.value)}
              style={{
                border: 'none', outline: 'none',
                fontSize: '14px', color: '#1C1C1C',
                backgroundColor: 'transparent',
                width: '100%'
              }}
            />
          </div>

          {/* Check Out */}
          <div style={{
            flex: '1 1 150px',
            padding: '12px 16px',
            borderRight: '1px solid #E5E0D8',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <label style={{ fontSize: '10px', letterSpacing: '1.5px', color: '#888', textTransform: 'uppercase', fontWeight: '600' }}>
              Check Out
            </label>
            <input
              type="date"
              value={checkOut}
              onChange={e => setCheckOut(e.target.value)}
              style={{
                border: 'none', outline: 'none',
                fontSize: '14px', color: '#1C1C1C',
                backgroundColor: 'transparent',
                width: '100%'
              }}
            />
          </div>

          {/* Guests */}
          <div style={{
            flex: '1 1 120px',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <label style={{ fontSize: '10px', letterSpacing: '1.5px', color: '#888', textTransform: 'uppercase', fontWeight: '600' }}>
              Guests
            </label>
            <select
              value={guests}
              onChange={e => setGuests(e.target.value)}
              style={{
                border: 'none', outline: 'none',
                fontSize: '14px', color: '#1C1C1C',
                backgroundColor: 'transparent',
                width: '100%'
              }}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
            {/* Pets */}
            <div style={{
            flex: '1 1 120px',
            padding: '12px 16px',
            borderRight: '1px solid #E5E0D8',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
            }}>
            <label style={{ 
                fontSize: '10px', 
                letterSpacing: '1.5px', 
                color: '#888', 
                textTransform: 'uppercase', 
                fontWeight: '600' 
            }}>
                Pets
            </label>
            <select
                value={pets}
                onChange={e => setPets(e.target.value)}
                style={{
                border: 'none', outline: 'none',
                fontSize: '14px', color: '#1C1C1C',
                backgroundColor: 'transparent',
                width: '100%'
                }}
            >
                <option value="0">No Pets</option>
                {[1,2,3,4].map(n => (
                <option key={n} value={n}>
                    {n} Pet{n > 1 ? 's' : ''}
                </option>
                ))}
            </select>
            </div>
          {/* Search Button */}
          <button
            onClick={handleSearch}
            style={{
              backgroundColor: '#C9A84C',
              color: '#1C1C1C',
              border: 'none',
              padding: '16px 32px',
              fontSize: '13px',
              letterSpacing: '1.5px',
              fontWeight: '700',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '2px',
              whiteSpace: 'nowrap'
            }}
          >
            Search
          </button>
        </div>

        {/* Stats Row */}
        <div style={{
          display: 'flex',
          gap: '48px',
          marginTop: '48px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {[
            { number: '50+', label: 'Properties' },
            { number: '20+', label: 'Destinations' },
            { number: '4.9★', label: 'Average Rating' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'Georgia, serif',
                color: '#C9A84C',
                fontSize: '28px',
                fontWeight: '600'
              }}>
                {stat.number}
              </div>
              <div style={{
                color: 'rgba(250,248,245,0.7)',
                fontSize: '12px',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                marginTop: '4px'
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10
      }}>
        <span style={{ color: 'rgba(250,248,245,0.6)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' }}>
          Scroll
        </span>
        <div style={{
          width: '1px',
          height: '40px',
          backgroundColor: '#C9A84C',
          animation: 'pulse 2s infinite'
        }} />
      </div>
    </section>
  )
}