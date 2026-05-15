'use client'
import { useState } from 'react'
import MapWrapper from '@/components/shared/MapWrapper'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.name.trim()) newErrors.name = 'Name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email'
    if (!form.subject.trim()) newErrors.subject = 'Subject is required'
    if (!form.message.trim()) newErrors.message = 'Message is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1500)
  }

  const inputStyle = (field: string) => ({
    width: '100%', padding: '14px 16px',
    border: `1px solid ${errors[field] ? '#E53E3E' : 'var(--color-border)'}`,
    borderRadius: '8px', fontSize: '14px', color: 'var(--color-text-primary)',
    outline: 'none', backgroundColor: '#ffffff',
    boxSizing: 'border-box' as const, fontFamily: 'inherit'
  })

  const labelStyle = {
    fontSize: '11px', letterSpacing: '2px',
    textTransform: 'uppercase' as const, color: 'var(--color-text-muted)',
    display: 'block', marginBottom: '8px', fontWeight: '600' as const
  }

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-bg-soft)', padding: 'clamp(48px, 8vw, 80px) 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-gold)', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>
          Get In Touch
        </p>
        <h1 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
          Contact Us
        </h1>
        <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--color-gold)', margin: '0 auto 16px' }} />
        <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', maxWidth: '480px', margin: '0 auto', lineHeight: '1.7' }}>
          Have a question about a property or your booking? We&apos;re here to help.
        </p>
      </div>

      {/* Contact Info Cards */}
      <section style={{ padding: 'clamp(48px, 6vw, 72px) 24px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '64px' }}>
          {[
            { symbol: '•', title: 'Email Us', detail: 'staysearthy@gmail.com', sub: 'We reply within 24 hours', href: 'mailto:staysearthy@gmail.com' },
            { symbol: '•', title: 'WhatsApp', detail: 'Chat with us on WhatsApp', sub: 'Quick responses on WhatsApp', href: 'https://wa.me/919874827631' },
            { symbol: '•', title: 'Location', detail: 'Kolkata', sub: 'Based in Kolkata', href: '#map' },
          ].map((item, i) => (
            <a key={i} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                backgroundColor: '#ffffff', border: '1px solid var(--color-border)',
                borderRadius: '12px', padding: '24px 20px',
                transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                cursor: 'pointer'
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
                  el.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.boxShadow = 'none'
                  el.style.transform = 'translateY(0)'
                }}
              >
                <span style={{ fontSize: '24px', color: 'var(--color-gold)', display: 'block', marginBottom: '12px' }}>{item.symbol}</span>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '6px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-gold)', fontWeight: '600', marginBottom: '4px' }}>{item.detail}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{item.sub}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Form + Map Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>

          {/* Contact Form */}
          <div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Send a Message
            </h2>
            <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-gold)', marginBottom: '28px' }} />

            {!submitted ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div>
                    <label style={labelStyle}>Full Name</label>
                    <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle('name')} />
                    {errors.name && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Phone (Optional)</label>
                    <input type="tel" placeholder="+91 9874827631" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle('phone')} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle('email')} />
                  {errors.email && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Subject</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    style={{ ...inputStyle('subject'), cursor: 'pointer' }}
                  >
                    <option value="">Select a subject...</option>
                    <option value="booking">Booking Question</option>
                    <option value="property">Property Enquiry</option>
                    <option value="cancellation">Cancellation Request</option>
                    <option value="complaint">Complaint</option>
                    <option value="partnership">Partnership / List My Property</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.subject && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.subject}</p>}
                </div>

                <div>
                  <label style={labelStyle}>Message</label>
                  <textarea
                    placeholder="Tell us how we can help..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    rows={5}
                    style={{ ...inputStyle('message'), resize: 'vertical' }}
                  />
                  {errors.message && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.message}</p>}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? 'var(--color-gold)' : 'var(--color-gold)',
                    color: 'var(--color-text-primary)', border: 'none', padding: '16px 32px',
                    fontSize: '13px', letterSpacing: '2px', fontWeight: '700',
                    textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                    borderRadius: '8px', width: '100%'
                  }}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            ) : (
              <div style={{ backgroundColor: 'var(--color-bg-soft)', borderRadius: '12px', padding: '40px 32px', textAlign: 'center' }}>
                <div style={{
                  width: '64px', height: '64px', backgroundColor: 'var(--color-gold)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', margin: '0 auto 20px',
                  fontSize: '28px', fontWeight: '700', color: 'var(--color-text-primary)'
                }}>
                  &#10003;
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '12px' }}>Message Sent!</h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>
                  Thank you for reaching out, <strong>{form.name}</strong>. We&apos;ll get back to you at <strong>{form.email}</strong> within 24 hours.
                </p>
              </div>
            )}
          </div>

          {/* Map */}
          <div>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Our Reach
            </h2>
            <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-gold)', marginBottom: '28px' }} />
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px', lineHeight: '1.7' }}>
              We operate across Kolkata with handpicked properties in the city — with more properties added regularly.
            </p>
            <div id="map" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <MapWrapper
                latitude={22.5726}
                longitude={88.3639}
                propertyName="Earthy Stays — Kolkata"
                address="Serving earthy properties across Kolkata"
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
