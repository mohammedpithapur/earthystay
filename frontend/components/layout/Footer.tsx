'use client'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--color-navbar)', color: 'var(--color-navbar-text)' }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 24px 48px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '48px',
      }}>
        <div>
          <h2 style={{
            color: 'var(--color-navbar-text)',
            fontSize: '22px',
            letterSpacing: '3px',
            marginBottom: '16px',
            fontWeight: '800',
          }}>
            EARTHY STAY
          </h2>
          <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-navbar-text)', marginBottom: '20px' }} />
          <p style={{
            color: 'rgba(255,255,255,0.82)',
            fontSize: '18px',
            lineHeight: '1.8',
            marginBottom: '28px',
          }}>
            Curated luxury properties across India&apos;s most breathtaking destinations. Your perfect escape awaits.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            {[
              { label: 'Instagram', text: 'Insta', href: '#' },
              { label: 'Facebook', text: 'FB', href: '#' },
              { label: 'Twitter', text: 'TW', href: '#' },
            ].map(social => (
              <a
                key={social.label}
                href={social.href}
                title={social.label}
                style={{
                  width: '40px', height: '40px',
                  border: '1px solid var(--color-navbar-border)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: 'rgba(255,255,255,0.82)',
                  textDecoration: 'none',
                  transition: 'border-color 0.3s ease, color 0.3s ease',
                  letterSpacing: '0.5px',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-navbar-text)'
                  ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-navbar-text)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--color-navbar-border)'
                  ;(e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.82)'
                }}
              >
                {social.text}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ color: 'var(--color-navbar-text)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '24px', fontWeight: '700' }}>
            Quick Links
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Our Properties', href: '/properties' },
              { label: 'Destinations', href: '/destinations' },
              { label: 'Special Offers', href: '/offers' },
              { label: 'About Us', href: '/about' },
              { label: 'Contact Us', href: '/contact' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: 'rgba(255,255,255,0.82)',
                  fontSize: '14px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-navbar-text)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.82)'}
              >
                <span style={{ color: 'var(--color-navbar-text)', fontSize: '10px' }}>→</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ color: 'var(--color-navbar-text)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '24px', fontWeight: '700' }}>
            Destinations
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Goa', href: '/properties?location=Goa' },
              { label: 'Coorg', href: '/properties?location=Coorg' },
              { label: 'Jaipur', href: '/properties?location=Jaipur' },
              { label: 'Munnar', href: '/properties?location=Munnar' },
              { label: 'Rishikesh', href: '/properties?location=Rishikesh' },
              { label: 'Jaisalmer', href: '/properties?location=Jaisalmer' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  color: 'rgba(255,255,255,0.82)',
                  fontSize: '14px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-navbar-text)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.82)'}
              >
                <span style={{ color: 'var(--color-navbar-text)', fontSize: '10px' }}>→</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 style={{ color: 'var(--color-navbar-text)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '24px', fontWeight: '700' }}>
            Contact Us
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {[
              { symbol: '•', text: 'India' },
              { symbol: '•', text: 'hello@earthystay.com' },
              { symbol: '•', text: '+91 98765 43210' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--color-navbar-text)', fontSize: '18px', lineHeight: '1.2', flexShrink: 0 }}>{item.symbol}</span>
                <span style={{ color: 'rgba(255,255,255,0.82)', fontSize: '14px', lineHeight: '1.5' }}>{item.text}</span>
              </div>
            ))}
          </div>

          <h4 style={{ color: 'var(--color-navbar-text)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '700' }}>
            Policies
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Terms & Conditions', href: '/terms' },
              { label: 'Cancellation Policy', href: '/cancellation' },
            ].map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{ color: 'rgba(255,255,255,0.82)', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s ease' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-navbar-text)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.82)'}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--color-navbar-border)' }} />

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
          &copy; {new Date().getFullYear()} Earthy Stay. All rights reserved.
        </p>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
          Payments secured by <span style={{ color: 'var(--color-navbar-text)' }}>Razorpay</span>
        </p>
      </div>
    </footer>
  )
}