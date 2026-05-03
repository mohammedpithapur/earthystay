'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{ backgroundColor: '#1C1C1C' }} className="fixed top-0 left-0 right-0 z-50">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span style={{
            fontFamily: 'Georgia, serif',
            color: '#C9A84C',
            fontSize: '22px',
            fontWeight: '600',
            letterSpacing: '2px'
          }}>
            EARTHY STAY
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Our Properties', href: '/properties' },
            { label: 'Destinations', href: '/destinations' },
            { label: 'Offers', href: '/offers' },
            { label: 'Contact Us', href: '/contact' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{ color: '#FAF8F5', fontSize: '13px', letterSpacing: '1px' }}
              className="hover:text-yellow-400 transition-colors uppercase"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            style={{ color: '#FAF8F5', fontSize: '13px', letterSpacing: '1px' }}
            className="hover:text-yellow-400 transition-colors uppercase"
          >
            Login
          </Link>
          <Link
            href="/properties"
            style={{
              backgroundColor: '#C9A84C',
              color: '#1C1C1C',
              padding: '10px 24px',
              fontSize: '13px',
              letterSpacing: '1px',
              fontWeight: '600'
            }}
            className="hover:opacity-90 transition-opacity uppercase"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
        >
          <span style={{ backgroundColor: '#FAF8F5', height: '2px', width: '24px', display: 'block' }} />
          <span style={{ backgroundColor: '#FAF8F5', height: '2px', width: '24px', display: 'block' }} />
          <span style={{ backgroundColor: '#FAF8F5', height: '2px', width: '24px', display: 'block' }} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ backgroundColor: '#1C1C1C', borderTop: '1px solid #333' }} className="md:hidden px-6 py-4 flex flex-col gap-4">
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
              style={{ color: '#FAF8F5', fontSize: '14px', letterSpacing: '1px' }}
              className="hover:text-yellow-400 transition-colors uppercase"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/properties"
            style={{
              backgroundColor: '#C9A84C',
              color: '#1C1C1C',
              padding: '12px 24px',
              fontSize: '13px',
              letterSpacing: '1px',
              fontWeight: '600',
              textAlign: 'center'
            }}
            className="hover:opacity-90 transition-opacity uppercase"
            onClick={() => setMenuOpen(false)}
          >
            Book Now
          </Link>
        </div>
      )}
    </nav>
  )
}