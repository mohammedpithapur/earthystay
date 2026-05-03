import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#141414', color: '#FAF8F5' }}>

      {/* Main Footer */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 24px 48px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '48px'
      }}>

        {/* Brand Column */}
        <div>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            color: '#C9A84C',
            fontSize: '24px',
            letterSpacing: '3px',
            marginBottom: '16px'
          }}>
            EARTHY STAY
          </h2>
          <div style={{
            width: '40px', height: '1px',
            backgroundColor: '#C9A84C',
            marginBottom: '20px'
          }} />
          <p style={{
            color: 'rgba(250,248,245,0.55)',
            fontSize: '14px',
            lineHeight: '1.8',
            marginBottom: '28px'
          }}>
            Curated luxury properties across India's most breathtaking destinations. Your perfect escape awaits.
          </p>

          {/* Social Links */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {[
              { label: 'Instagram', icon: '📷', href: '#' },
              { label: 'Facebook', icon: '👍', href: '#' },
              { label: 'Twitter', icon: '🐦', href: '#' },
            ].map(social => (
              
                key={social.label}
                href={social.href}
                title={social.label}
                style={{
                  width: '40px', height: '40px',
                  border: '1px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'border-color 0.3s ease',
                  textDecoration: 'none'
                }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = '#C9A84C'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = '#333'}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{
            color: '#FAF8F5',
            fontSize: '12px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '24px'
          }}>
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
                  color: 'rgba(250,248,245,0.55)',
                  fontSize: '14px',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(250,248,245,0.55)'}
              >
                <span style={{ color: '#C9A84C', fontSize: '10px' }}>→</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Destinations */}
        <div>
          <h4 style={{
            color: '#FAF8F5',
            fontSize: '12px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '24px'
          }}>
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
                  color: 'rgba(250,248,245,0.55)',
                  fontSize: '14px',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(250,248,245,0.55)'}
              >
                <span style={{ color: '#C9A84C', fontSize: '10px' }}>→</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact & Policy */}
        <div>
          <h4 style={{
            color: '#FAF8F5',
            fontSize: '12px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '24px'
          }}>
            Contact Us
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {[
              { icon: '📍', text: 'India' },
              { icon: '📧', text: 'hello@earthystay.com' },
              { icon: '📞', text: '+91 98765 43210' },
            ].map(item => (
              <div key={item.text} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span style={{ color: 'rgba(250,248,245,0.55)', fontSize: '14px', lineHeight: '1.5' }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          <h4 style={{
            color: '#FAF8F5',
            fontSize: '12px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}>
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
                style={{
                  color: 'rgba(250,248,245,0.55)',
                  fontSize: '14px',
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#C9A84C'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(250,248,245,0.55)'}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid #222' }} />

      {/* Bottom Bar */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <p style={{
          color: 'rgba(250,248,245,0.35)',
          fontSize: '13px'
        }}>
          © {new Date().getFullYear()} Earthy Stay. All rights reserved.
        </p>
        <p style={{
          color: 'rgba(250,248,245,0.35)',
          fontSize: '13px'
        }}>
          Payments secured by{' '}
          <span style={{ color: '#C9A84C' }}>Razorpay</span>
        </p>
      </div>
    </footer>
  )
}