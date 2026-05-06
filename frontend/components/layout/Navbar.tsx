'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinkStyle = {
    color: '#FAF8F5',
    fontSize: '13px',
    letterSpacing: '1px',
    textDecoration: 'none',
    textTransform: 'uppercase' as const,
    fontWeight: '500' as const,
    transition: 'color 0.2s ease',
  }

  return (
    <nav style={{ backgroundColor: '#2c2c2c', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, width: '100%' }}>

      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontFamily: "'Figtree', sans-serif",
            color: '#e1c391',
            fontSize: 'clamp(18px, 2vw, 22px)',
            fontWeight: '800',
            letterSpacing: '2px',
          }}>
            EARTHY STAY
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}
          className="hidden md:flex">
          {[
            { label: 'Our Properties', href: '/properties' },
            { label: 'Destinations', href: '/destinations' },
            { label: 'Offers', href: '/offers' },
            { label: 'Contact Us', href: '/contact' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={navLinkStyle}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#e1c391'}
              onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#FAF8F5'}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
          className="hidden md:flex">
          <Link
            href="/login"
            style={navLinkStyle}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#e1c391'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#FAF8F5'}
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

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle navigation menu"
        >
          <span style={{ backgroundColor: '#FAF8F5', height: '2px', width: '24px', display: 'block', borderRadius: '2px' }} />
          <span style={{ backgroundColor: '#FAF8F5', height: '2px', width: '24px', display: 'block', borderRadius: '2px' }} />
          <span style={{ backgroundColor: '#FAF8F5', height: '2px', width: '24px', display: 'block', borderRadius: '2px' }} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ backgroundColor: '#2c2c2c', borderTop: '1px solid #444', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}
          className="md:hidden">
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
              style={{ color: '#FAF8F5', fontSize: '14px', letterSpacing: '1px', textDecoration: 'none', textTransform: 'uppercase' as const, fontWeight: '500' }}
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
        </div>
      )}
    </nav>
  )
}