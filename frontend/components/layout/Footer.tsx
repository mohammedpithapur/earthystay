"use client"
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Copy from '@/lib/copy'

export default function Footer() {
  const [year, setYear] = useState(2024)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer style={{ backgroundColor: 'var(--color-navbar)', color: 'var(--color-navbar-text)' }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '56px 24px 40px',
        display: 'grid',
        gridTemplateColumns: 'minmax(220px, 1fr) minmax(180px, 0.8fr) minmax(220px, 1fr)',
        gap: '24px',
        alignItems: 'start',
      }}>

        {/* Brand column */}
        <div>
          <h2 style={{ color: 'var(--color-navbar-text)', fontSize: '22px', letterSpacing: '3px', marginBottom: '16px', fontWeight: '800' }}>
            EARTHY STAYS
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: '18px', lineHeight: '1.8', marginBottom: '28px' }}>
            {Copy.footerDescription}
          </p>

          {/* Social icons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { label: 'Instagram', src: '/instagram.png', href: '#' },
              { label: 'Facebook', src: '/facebook.png', href: '#' },
              { label: 'Twitter', src: '/twitter.png', href: '#' },
            ].map(social => (
              <a
                key={social.label}
                href={social.href}
                title={social.label}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '1px solid var(--color-navbar-border)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(255,255,255,0.82)',
                  textDecoration: 'none',
                  transition: 'border-color 0.3s ease',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.borderColor = 'var(--color-navbar-text)'
                }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.currentTarget.style.borderColor = 'var(--color-navbar-border)'
                }}
              >
                <Image
                  src={social.src}
                  alt={social.label}
                  width={24}
                  height={24}
                  suppressHydrationWarning
                  style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links column */}
        <div>
          <h4 style={{ color: 'var(--color-navbar-text)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '24px', fontWeight: '700' }}>
            Quick Links
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Our Hotels', href: '/properties' },
              { label: 'About Us', href: '/about' },
              { label: 'Contact Us', href: '/contact' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  color: 'rgba(255,255,255,0.82)',
                  fontSize: '13px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = 'var(--color-navbar-text)' }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = 'rgba(255,255,255,0.82)' }}
              >
                <span style={{ color: 'var(--color-navbar-text)', fontSize: '9px' }}>→</span>
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Contact + Policies column */}
        <div>
          <h4 style={{ color: 'var(--color-navbar-text)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '24px', fontWeight: '700' }}>
            Contact Us
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {[
              { symbol: '•', text: 'India' },
              { symbol: '•', text: 'staysearthy@gmail.com' },
              { symbol: '•', text: 'WhatsApp us +91 9874827631' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--color-navbar-text)', fontSize: '14px', lineHeight: '1.2', flexShrink: 0 }}>{item.symbol}</span>
                <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: '13px', lineHeight: '1.4' }}>{item.text}</span>
              </div>
            ))}
          </div>

          <h4 style={{ color: 'var(--color-navbar-text)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '700' }}>
            Policies
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms & Conditions', href: '/terms' },
              { label: 'FAQ', href: '/faq' },
              { label: 'Cancellation Policy', href: '/cancellation' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{ color: 'rgba(255,255,255,0.82)', fontSize: '13px', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = 'var(--color-navbar-text)' }}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = 'rgba(255,255,255,0.82)' }}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--color-navbar-border)' }} />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
          &copy; {year} Earthy Stays. All rights reserved.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
          Payments secured by <span style={{ color: 'var(--color-navbar-text)' }}>Razorpay</span>
        </p>
      </div>
    </footer>
  )
}