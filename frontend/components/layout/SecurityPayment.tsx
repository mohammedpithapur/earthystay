'use client'

export default function SecurityPayment() {
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
          textAlign: 'center',
          marginBottom: '40px',
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: 'var(--color-text-primary)',
            marginBottom: '8px',
          }}>
            Trusted & Secure
          </h3>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: '14px',
          }}>
            Your safety and privacy are our top priorities
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
        }}>
          <div style={{
            padding: '24px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>🔒</div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
              marginBottom: '6px',
            }}>
              Secure Payments
            </h4>
            <p style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.5',
            }}>
              All payments processed through Razorpay with SSL encryption
            </p>
          </div>

          <div style={{
            padding: '24px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>✓</div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
              marginBottom: '6px',
            }}>
              Verified Hosts
            </h4>
            <p style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.5',
            }}>
              Every property owner verified and reviewed before listing
            </p>
          </div>

          <div style={{
            padding: '24px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid var(--color-border)',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>💬</div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: '700',
              color: 'var(--color-text-primary)',
              marginBottom: '6px',
            }}>
              Real Reviews
            </h4>
            <p style={{
              fontSize: '13px',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.5',
            }}>
              Unverified guest reviews for authentic experiences
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
