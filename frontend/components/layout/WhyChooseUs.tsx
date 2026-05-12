"use client"

import Link from 'next/link'

export default function WhyChooseUs() {
  const reasons = [
    {
      symbol: '✦',
      title: 'Handpicked Properties',
      description: 'Every property is personally verified and curated to meet our luxury standards. No surprises — only exceptional stays.'
    },
    {
      symbol: '◈',
      title: 'Instant Booking',
      description: "Book your stay in minutes with our seamless booking system. Real-time availability so you always know what's free."
    },
    {
      symbol: '◉',
      title: 'Best Price Guarantee',
      description: 'Book directly with us and get the best possible rate. No hidden fees — what you see is exactly what you pay.'
    },
    {
      symbol: '◎',
      title: 'Secure Payments',
      description: 'All payments are processed securely through Razorpay. Your financial information is always protected.'
    },
    {
      symbol: '◆',
      title: 'Pet Friendly Options',
      description: 'Travelling with your furry friends? We have a curated selection of pet-friendly properties just for you.'
    },
    {
      symbol: '◇',
      title: '24/7 Support',
      description: "Our team is always available to assist you before, during, and after your stay. We've got you covered."
    },
  ]

  return (
    <section className="section-shell" style={{ backgroundColor: 'var(--color-navbar)' }}>
      <div className="content-shell">

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{
            color: 'var(--color-navbar-text)',
            fontSize: '11px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            marginBottom: '12px',
            fontWeight: '600',
          }}>
            The Earthy Stay Difference
          </p>
          <h2 style={{
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: '800',
            color: 'var(--color-navbar-text)',
            marginBottom: '12px',
            lineHeight: '1.2',
          }}>
            Why Choose Us
          </h2>
          <div style={{ width: '50px', height: '2px', backgroundColor: 'var(--color-navbar-text)', margin: '0 auto 16px' }} />
          <p style={{
            color: 'rgba(255,255,255,0.84)',
            fontSize: '15px',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: '1.6',
          }}>
            We go beyond just a place to stay — we create memories that last a lifetime
          </p>
        </div>

        {/* Grid */}
        <div className="responsive-feature-grid" style={{ backgroundColor: 'var(--color-border)' }}>
          {reasons.map((reason, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'var(--color-navbar)',
              padding: '36px 32px',
                transition: 'background-color 0.3s ease',
                cursor: 'default',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-navbar)'}
            >
              <div style={{ fontSize: '32px', color: 'var(--color-navbar-text)', marginBottom: '20px', lineHeight: '1' }}>
                {reason.symbol}
              </div>
              <div style={{ width: '32px', height: '2px', backgroundColor: 'var(--color-navbar-text)', marginBottom: '20px' }} />
              <h3 style={{
                fontSize: '22px',
                fontWeight: '700',
                color: 'var(--color-navbar-text)',
                marginBottom: '16px',
                lineHeight: '1.3',
              }}>
                {reason.title}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.84)', fontSize: '14px', lineHeight: '1.8' }}>
                {reason.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="why-cta-banner" style={{
          marginTop: '56px',
          border: '1px solid var(--color-navbar-border)',
          borderRadius: '12px',
          padding: 'clamp(20px, 3vw, 40px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--color-navbar-text)', marginBottom: '6px' }}>
              Ready for your next escape?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.84)', fontSize: '16px' }}>
              Browse our collection of handpicked luxury properties across India
            </p>
          </div>
          <Link
            href="/properties"
            style={{
              backgroundColor: 'var(--color-gold)',
              color: 'var(--color-text-primary)',
              border: 'none',
              padding: '14px 42px',
              fontSize: '12px',
              letterSpacing: '2px',
              fontWeight: '700',
              textTransform: 'uppercase',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              borderRadius: '8px',
              maxWidth: '100%',
              boxSizing: 'border-box',
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
            Explore Properties
          </Link>
        </div>
      </div>
    </section>
  )
}
