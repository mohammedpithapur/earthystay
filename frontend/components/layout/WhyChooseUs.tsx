"use client"

export default function WhyChooseUs() {
  const reasons = [
    {
      icon: '🏡',
      title: 'Handpicked Properties',
      description: 'Every property is personally verified and curated to meet our luxury standards. No surprises — only exceptional stays.'
    },
    {
      icon: '📅',
      title: 'Instant Booking',
      description: 'Book your stay in minutes with our seamless booking system. Real-time availability so you always know what\'s free.'
    },
    {
      icon: '💰',
      title: 'Best Price Guarantee',
      description: 'Book directly with us and get the best possible rate. No hidden fees — what you see is exactly what you pay.'
    },
    {
      icon: '🔒',
      title: 'Secure Payments',
      description: 'All payments are processed securely through Razorpay. Your financial information is always protected.'
    },
    {
      icon: '🐾',
      title: 'Pet Friendly Options',
      description: 'Travelling with your furry friends? We have a curated selection of pet-friendly properties just for you.'
    },
    {
      icon: '📞',
      title: '24/7 Support',
      description: 'Our team is always available to assist you before, during, and after your stay. We\'ve got you covered.'
    },
  ]

  return (
    <section style={{
      backgroundColor: '#1C1C1C',
      padding: '100px 24px',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
          <p style={{
            color: '#C9A84C',
            fontSize: '12px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            marginBottom: '16px'
          }}>
            The Earthy Stay Difference
          </p>
          <h2 style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: '400',
            color: '#FAF8F5',
            marginBottom: '16px',
            lineHeight: '1.2'
          }}>
            Why Choose Us
          </h2>
          <div style={{
            width: '60px',
            height: '1px',
            backgroundColor: '#C9A84C',
            margin: '0 auto 24px'
          }} />
          <p style={{
            color: 'rgba(250,248,245,0.6)',
            fontSize: '16px',
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: '1.7'
          }}>
            We go beyond just a place to stay — we create memories that last a lifetime
          </p>
        </div>

        {/* Reasons Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2px',
          backgroundColor: '#333'
        }}>
          {reasons.map((reason, index) => (
            <div
              key={index}
              style={{
                backgroundColor: '#1C1C1C',
                padding: '48px 40px',
                transition: 'background-color 0.3s ease',
                cursor: 'default'
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = '#242424'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = '#1C1C1C'
              }}
            >
              {/* Icon */}
              <div style={{
                fontSize: '40px',
                marginBottom: '24px'
              }}>
                {reason.icon}
              </div>

              {/* Gold Line */}
              <div style={{
                width: '32px',
                height: '2px',
                backgroundColor: '#C9A84C',
                marginBottom: '20px'
              }} />

              {/* Title */}
              <h3 style={{
                fontFamily: 'Georgia, serif',
                fontSize: '22px',
                fontWeight: '500',
                color: '#FAF8F5',
                marginBottom: '16px',
                lineHeight: '1.3'
              }}>
                {reason.title}
              </h3>

              {/* Description */}
              <p style={{
                color: 'rgba(250,248,245,0.6)',
                fontSize: '14px',
                lineHeight: '1.8',
              }}>
                {reason.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div style={{
          marginTop: '80px',
          border: '1px solid #333',
          padding: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div>
            <h3 style={{
              fontFamily: 'Georgia, serif',
              fontSize: '28px',
              fontWeight: '400',
              color: '#FAF8F5',
              marginBottom: '8px'
            }}>
              Ready for your next escape?
            </h3>
            <p style={{
              color: 'rgba(250,248,245,0.6)',
              fontSize: '14px'
            }}>
              Browse our collection of handpicked luxury properties across India
            </p>
          </div>
          <a
            href="/properties"
            style={{
              backgroundColor: '#C9A84C',
              color: '#1C1C1C',
              padding: '18px 48px',
              fontSize: '13px',
              letterSpacing: '2px',
              fontWeight: '700',
              textTransform: 'uppercase',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              display: 'inline-block'
            }}
          >
            Explore Properties
          </a>
        </div>
      </div>
    </section>
  )
}