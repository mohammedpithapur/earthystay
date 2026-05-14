'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [logoHover, setLogoHover] = useState(false)

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
      <div className="px-5 py-4 md:px-6 md:py-5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1400px', margin: '0 auto', width: '100%', minHeight: '74px', paddingInline: '16px' }}>
        <Link
          href="/"
          style={{ textDecoration: 'none', cursor: 'pointer' }}
          onMouseEnter={() => setLogoHover(true)}
          onMouseLeave={() => setLogoHover(false)}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Image
              src="/Untitled_design-removebg-preview.png"
              alt="EARTHY STAYS"
              width={45}
              height={45}
              priority
              style={{
                objectFit: 'contain',
                transform: logoHover ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 150ms ease',
                display: 'block',
              }}
            />
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {[
            { label: 'Our Properties', href: '/properties' },
            { label: 'Corporate', href: '/corporate' },
            { label: 'Wedding', href: '/wedding' },
            { label: 'Contact Us', href: '/contact' },
            
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={navLinkStyle}
              onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-gold)'}
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
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-gold)'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-navbar-text)'}
          >
            Login
          </Link>
          <Link
            href="/properties"
            style={{
              backgroundColor: 'var(--color-gold)',
              color: 'var(--color-text-primary)',
              border: 'none',
              padding: '10px 20px',
              fontSize: '12px',
              letterSpacing: '1px',
              fontWeight: '700',
              textDecoration: 'none',
              borderRadius: '8px',
              textTransform: 'uppercase' as const,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.opacity = '0.9'
              el.style.transform = 'scale(1.03)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.opacity = '1'
              el.style.transform = 'scale(1)'
            }}
          >
            Book Now
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-3" style={{ marginLeft: 'auto', flexShrink: 0 }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-3 flex flex-col gap-1.5"
            aria-label="Toggle navigation menu"
            style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span style={{ backgroundColor: 'var(--color-navbar-text)', height: '2px', width: '24px', display: 'block', borderRadius: '2px' }} />
            <span style={{ backgroundColor: 'var(--color-navbar-text)', height: '2px', width: '24px', display: 'block', borderRadius: '2px' }} />
            <span style={{ backgroundColor: 'var(--color-navbar-text)', height: '2px', width: '24px', display: 'block', borderRadius: '2px' }} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden flex flex-col w-full" style={{ backgroundColor: 'var(--color-navbar)', borderTop: '1px solid var(--color-navbar-border)', padding: '16px 24px', gap: '16px', maxWidth: '1400px', margin: '0 auto' }}>
          {[
            { label: 'Our Properties', href: '/properties' },
            { label: 'Corporate', href: '/corporate' },
            { label: 'Wedding', href: '/wedding' },
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
              backgroundColor: 'var(--color-gold)',
              color: 'var(--color-text-primary)',
              border: 'none',
              padding: '12px 24px',
              fontSize: '12px',
              letterSpacing: '1px',
              fontWeight: '700',
              textAlign: 'center' as const,
              textDecoration: 'none',
              borderRadius: '8px',
              textTransform: 'uppercase' as const,
              transition: 'all 0.2s ease',
            }}
            onClick={() => setMenuOpen(false)}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.opacity = '0.9'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.opacity = '1'
            }}
          >
            Book Now
          </Link>
        </div>
      )}
    </nav>
  )
}