import Link from 'next/link'

const values = [
  { symbol: '✦', title: 'Curated Excellence', description: 'Every property we list is personally verified. We visit, we stay, we approve. No shortcuts, no compromises.' },
  { symbol: '◈', title: 'Earthy Luxury', description: 'We believe luxury and nature are not opposites. Our properties blend comfort with the raw beauty of India.' },
  { symbol: '◉', title: 'Honest Pricing', description: 'What you see is what you pay. No hidden charges, no last-minute surprises. Just transparent, fair pricing.' },
  { symbol: '◆', title: 'Guest First', description: 'Every decision we make starts with one question — is this better for our guests? That will never change.' },
]

const team = [
  { name: 'Priya Sharma', role: 'Founder & CEO', initial: 'P', description: 'Former hospitality executive with 12 years at luxury hotel chains across India.' },
  { name: 'Rahul Mehta', role: 'Head of Curation', initial: 'R', description: 'Travels 200+ days a year personally vetting each property before it goes live.' },
  { name: 'Anjali Kumar', role: 'Guest Experience', initial: 'A', description: 'Ensures every guest interaction — before, during and after — exceeds expectations.' },
]

const stats = [
  { number: '50+', label: 'Curated Properties' },
  { number: '20+', label: 'Destinations' },
  { number: '4.9', label: 'Average Rating' },
  { number: '2,000+', label: 'Happy Guests' },
]

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={{
        backgroundColor: 'var(--color-bg-soft)',
        padding: 'clamp(64px, 10vw, 120px) 24px',
        textAlign: 'center'
      }}>
        <p style={{ color: 'var(--color-gold)', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '600' }}>
          Our Story
        </p>
        <h1 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '24px', lineHeight: '1.15', maxWidth: '800px', margin: '0 auto 24px' }}>
          We believe every stay should feel like a discovery
        </h1>
        <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--color-gold)', margin: '0 auto 24px' }} />
        <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', maxWidth: '580px', margin: '0 auto', lineHeight: '1.8' }}>
          Earthy Stay was born from a simple frustration — it was impossible to find truly special properties in India without endless scrolling and disappointment.
        </p>
      </div>

      {/* Story Section */}
      <section style={{ padding: 'clamp(64px, 8vw, 100px) 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: '600', marginBottom: '16px' }}>
              How It Started
            </p>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '24px', lineHeight: '1.2' }}>
              A weekend trip that changed everything
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.9', marginBottom: '20px' }}>
              In 2022, our founder Priya booked what was described as a &ldquo;luxury villa&rdquo; in Coorg. What she found was a poorly maintained house with no real connection to the stunning landscape around it. The experience was frustrating — not because the area wasn&rsquo;t beautiful, but because the booking platform had no real standards.
            </p>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.9' }}>
              That weekend, she decided to build something different. A platform where every single property had been personally experienced, where luxury meant something real, and where guests could book with genuine confidence.
            </p>
          </div>

          {/* Visual placeholder */}
          <div style={{
            backgroundColor: 'var(--color-bg-soft)', borderRadius: '12px',
            height: '380px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexDirection: 'column', gap: '12px'
          }}>
            <div style={{ fontSize: '64px', color: 'var(--color-gold)', fontWeight: '800', letterSpacing: '-2px' }}>ES</div>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', letterSpacing: '3px', textTransform: 'uppercase' }}>Est. 2022</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ backgroundColor: 'var(--color-text-primary)', padding: 'clamp(48px, 6vw, 80px) 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0' }}>
          {stats.map((stat, i) => (
            <div key={stat.label} style={{
              textAlign: 'center', padding: '32px 24px',
              borderRight: i < stats.length - 1 ? '1px solid #333' : 'none'
            }}>
              <p style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: '800', color: 'var(--color-gold)', marginBottom: '8px', lineHeight: '1' }}>
                {stat.number}
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(250,248,245,0.6)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: '600' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: 'clamp(64px, 8vw, 100px) 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{ color: 'var(--color-gold)', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '600' }}>
            What We Stand For
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            Our Values
          </h2>
          <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--color-gold)', margin: '0 auto' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          {values.map((value, i) => (
            <div key={i} style={{
              backgroundColor: '#ffffff', border: '1px solid var(--color-border)',
              borderRadius: '12px', padding: '32px 28px'
            }}>
              <div style={{ fontSize: '28px', color: 'var(--color-gold)', marginBottom: '16px' }}>{value.symbol}</div>
              <div style={{ width: '32px', height: '2px', backgroundColor: 'var(--color-gold)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '12px' }}>{value.title}</h3>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ backgroundColor: 'var(--color-bg-soft)', padding: 'clamp(64px, 8vw, 100px) 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ color: 'var(--color-gold)', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '600' }}>
              The People Behind It
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
              Meet the Team
            </h2>
            <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--color-gold)', margin: '0 auto' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {team.map((member, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff', borderRadius: '12px',
                padding: '32px 28px', border: '1px solid var(--color-border)', textAlign: 'center'
              }}>
                <div style={{
                  width: '72px', height: '72px', backgroundColor: 'var(--color-gold)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 20px',
                  fontSize: '28px', fontWeight: '800', color: 'var(--color-text-primary)'
                }}>
                  {member.initial}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px' }}>{member.name}</h3>
                <p style={{ fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: '600', marginBottom: '16px' }}>{member.role}</p>
                <div style={{ width: '32px', height: '2px', backgroundColor: 'var(--color-border)', margin: '0 auto 16px' }} />
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(64px, 8vw, 100px) 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
          Ready to find your escape?
        </h2>
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px', lineHeight: '1.7' }}>
          Browse our handpicked collection of luxury properties across India&aposs most beautiful destinations.
        </p>
        <Link
          href="/properties"
          style={{
            display: 'inline-block', backgroundColor: 'var(--color-gold)',
            color: 'var(--color-text-primary)', padding: '18px 48px', fontSize: '13px',
            letterSpacing: '2px', fontWeight: '700', textTransform: 'uppercase',
            textDecoration: 'none', borderRadius: '8px'
          }}
        >
          Explore Properties
        </Link>
      </section>
    </div>
  )
}

