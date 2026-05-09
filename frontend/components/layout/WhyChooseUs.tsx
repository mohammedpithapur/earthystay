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
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
          <p style={{
            color: 'var(--color-navbar-text)',
            fontSize: '12px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: '16px',
            fontWeight: '600',
          }}>
            The Earthy Stay Difference
          </p>
          <h2 style={{
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: '800',
            color: 'var(--color-navbar-text)',
            marginBottom: '16px',
            lineHeight: '1.2',
          }}>
            Why Choose Us
          </h2>
          <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--color-navbar-text)', margin: '0 auto 24px' }} />
          <p style={{
            color: 'rgba(255,255,255,0.84)',
            fontSize: '16px',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: '1.7',
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
                padding: '48px 40px',
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
          marginTop: '80px',
          border: '1px solid var(--color-navbar-border)',
          borderRadius: '12px',
          padding: 'clamp(24px, 4vw, 48px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
        }}>
          <div>
            <h3 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--color-navbar-text)', marginBottom: '8px' }}>
              Ready for your next escape?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.84)', fontSize: '18px' }}>
              Browse our collection of handpicked luxury properties across India
            </p>
          </div>
          <Link
            href="/properties"
            style={{
              backgroundColor: 'rgba(255,255,255,0.14)',
              color: 'var(--color-navbar-text)',
              border: '1px solid var(--color-navbar-border)',
              padding: '18px 48px',
              fontSize: '13px',
              letterSpacing: '2px',
              fontWeight: '700',
              textTransform: 'uppercase',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              display: 'inline-block',
              borderRadius: '8px',
              maxWidth: '100%',
              boxSizing: 'border-box',
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}
          >
            Explore Properties
          </Link>
        </div>
      </div>
    </section>
  )
}
