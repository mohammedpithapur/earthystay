'use client'

export default function TrustSignals() {
  const signals = [
    {
      icon: '★',
      metric: '4.9/5',
      label: 'Average Rating',
    },
    {
      icon: '✓',
      metric: '2,500+',
      label: 'Happy Guests',
    },
    {
      icon: '🏠',
      metric: '50+',
      label: 'Verified Properties',
    },
    {
      icon: '🔒',
      metric: '100%',
      label: 'Secure Payments',
    },
  ]

  return (
    <section style={{
      backgroundColor: 'var(--color-bg-page)',
      padding: '48px 24px',
      borderTop: '1px solid var(--color-border)',
    }}>
      <div style={{
        width: 'min(1200px, calc(100% - 48px))',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
        }}>
          {signals.map((signal, index) => (
            <div key={index} style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{
                fontSize: '32px',
                lineHeight: '1',
              }}>
                {signal.icon}
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: 'var(--color-text-primary)',
              }}>
                {signal.metric}
              </div>
              <div style={{
                fontSize: '13px',
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.5px',
                fontWeight: '500',
              }}>
                {signal.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
