'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
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
    setSearchOpen(false)
    setMenuOpen(false)
  }

  const navLinkStyle = {
    color: 'var(--color-navbar-text)',
    fontSize: '13px',
    letterSpacing: '1px',
    textDecoration: 'none',
    textTransform: 'uppercase' as const,
    fontWeight: '500' as const,
    transition: 'color 0.2s ease',
  }

  return (
    <nav style={{ backgroundColor: 'var(--color-navbar)', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, width: '100%' }}>
      <div className="px-4 py-4 md:px-6 md:py-5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto', width: '100%', minHeight: '74px' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Figtree', sans-serif",
            color: '#e1c391',
            fontSize: 'clamp(18px, 3.8vw, 24px)',
            fontWeight: '800',
            letterSpacing: '2px',
            lineHeight: 1,
          }}>
            EARTHY STAY
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Our Properties', href: '/properties' },
            { label: 'Destinations', href: '/destinations' },
            { label: 'Offers', href: '/offers' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={navLinkStyle}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#e1c391'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-navbar-text)'}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            style={navLinkStyle}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#e1c391'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-navbar-text)'}
          >
            Login
          </Link>
          <Link
            href="/properties"
            style={{
              backgroundColor: '#e1c391',
              color: '#1a1a1a',
              padding: '10px 24px',
              fontSize: '13px',
              letterSpacing: '1px',
              fontWeight: '700',
              textDecoration: 'none',
              borderRadius: '8px',
              textTransform: 'uppercase' as const,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
          >
            Book Now
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-3" style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 flex items-center justify-center"
            aria-label="Toggle search"
            style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-navbar-text)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 flex flex-col gap-1.5"
            aria-label="Toggle navigation menu"
            style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <span style={{ backgroundColor: 'var(--color-navbar-text)', height: '2px', width: '24px', display: 'block', borderRadius: '2px' }} />
            <span style={{ backgroundColor: 'var(--color-navbar-text)', height: '2px', width: '24px', display: 'block', borderRadius: '2px' }} />
            <span style={{ backgroundColor: 'var(--color-navbar-text)', height: '2px', width: '24px', display: 'block', borderRadius: '2px' }} />
          </button>
        </div>
      </div>

      {(menuOpen || searchOpen) && (
        <div className="md:hidden flex flex-col w-full" style={{ backgroundColor: 'var(--color-navbar)', borderTop: '1px solid var(--color-navbar-border)', padding: '16px 24px', gap: '16px', maxWidth: '1400px', margin: '0 auto' }}>
          {searchOpen && (
            <div style={{ borderBottom: '1px solid var(--color-navbar-border)', paddingBottom: '16px' }}>
              <p style={{ color: '#e1c391', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>
                Search Properties
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ color: 'var(--color-navbar-text)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                    Destination
                  </label>
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--color-navbar-border)',
                      borderRadius: '6px',
                      backgroundColor: '#fffdf5',
                      color: '#1a1a1a',
                      fontSize: '14px',
                      fontFamily: "'Figtree', sans-serif",
                    }}
                  />
                </div>

                <div>
                  <label style={{ color: 'var(--color-navbar-text)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                    Check In
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--color-navbar-border)',
                      borderRadius: '6px',
                      backgroundColor: '#fffdf5',
                      color: '#1a1a1a',
                      fontSize: '14px',
                      fontFamily: "'Figtree', sans-serif",
                    }}
                  />
                </div>

                <div>
                  <label style={{ color: 'var(--color-navbar-text)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                    Check Out
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--color-navbar-border)',
                      borderRadius: '6px',
                      backgroundColor: '#fffdf5',
                      color: '#1a1a1a',
                      fontSize: '14px',
                      fontFamily: "'Figtree', sans-serif",
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ color: 'var(--color-navbar-text)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                      Guests
                    </label>
                    <select
                      value={guests}
                      onChange={e => setGuests(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid var(--color-navbar-border)',
                        borderRadius: '6px',
                        backgroundColor: '#fffdf5',
                        color: '#1a1a1a',
                        fontSize: '14px',
                        fontFamily: "'Figtree', sans-serif",
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label style={{ color: 'var(--color-navbar-text)', fontSize: '10px', letterSpacing: '1px', textTransform: 'uppercase', display: 'block', marginBottom: '6px', fontWeight: '600' }}>
                      Pets
                    </label>
                    <select
                      value={pets}
                      onChange={e => setPets(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid var(--color-navbar-border)',
                        borderRadius: '6px',
                        backgroundColor: '#fffdf5',
                        color: '#1a1a1a',
                        fontSize: '14px',
                        fontFamily: "'Figtree', sans-serif",
                      }}
                    >
                      <option value="0">No Pets</option>
                      {[1, 2, 3, 4].map(n => (
                        <option key={n} value={n}>{n} Pet{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSearch}
                  style={{
                    backgroundColor: '#e1c391',
                    color: '#1a1a1a',
                    border: 'none',
                    padding: '14px 24px',
                    fontSize: '13px',
                    letterSpacing: '1.5px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    borderRadius: '6px',
                    width: '100%',
                    transition: 'opacity 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.opacity = '0.85'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.opacity = '1'}
                >
                  Search
                </button>
              </div>
            </div>
          )}

          {menuOpen && (
            <>
              {[
                { label: 'Our Properties', href: '/properties' },
                { label: 'Destinations', href: '/destinations' },
                { label: 'Offers', href: '/offers' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Login', href: '/login' },
              ].map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ color: 'var(--color-navbar-text)', fontSize: '14px', letterSpacing: '1px', textDecoration: 'none', textTransform: 'uppercase' as const, fontWeight: '500' }}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/properties"
                style={{
                  backgroundColor: '#e1c391',
                  color: '#1a1a1a',
                  padding: '14px 24px',
                  fontSize: '13px',
                  letterSpacing: '1px',
                  fontWeight: '700',
                  textAlign: 'center' as const,
                  textDecoration: 'none',
                  borderRadius: '8px',
                  textTransform: 'uppercase' as const,
                }}
                onClick={() => setMenuOpen(false)}
              >
                Book Now
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}