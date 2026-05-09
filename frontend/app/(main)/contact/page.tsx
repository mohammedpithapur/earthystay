'use client'
import { useState } from 'react'
import MapWrapper from '@/components/shared/MapWrapper'

const faqs = [
  { q: 'How do I make a booking?', a: 'Browse our properties, select your dates and guests, then proceed to checkout. Payment is processed securely via Razorpay.' },
  { q: 'Are all bookings non-refundable?', a: 'Yes, all bookings on Earthy Stay are non-refundable. Please review your dates carefully before confirming payment.' },
  { q: 'Can I bring my pets?', a: 'Many of our properties are pet-friendly. Look for the "Pets Welcome" badge on the property page. An additional nightly charge applies per pet.' },
  { q: 'How do I get my booking confirmation?', a: 'A confirmation email with your booking reference and PDF voucher is sent to your email immediately after payment.' },
  { q: 'Can I modify my booking dates?', a: 'Booking dates cannot be modified after payment due to our non-refundable policy. Please contact us before booking if you need flexibility.' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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
            { symbol: '•', title: 'Email Us', detail: 'hello@earthystay.com', sub: 'We reply within 24 hours', href: 'mailto:hello@earthystay.com' },
            { symbol: '•', title: 'Call Us', detail: '+91 98765 43210', sub: 'Mon–Sat, 9am–7pm IST', href: 'tel:+919876543210' },
            { symbol: '•', title: 'WhatsApp', detail: '+91 98765 43210', sub: 'Quick responses on WhatsApp', href: 'https://wa.me/919876543210' },
            { symbol: '•', title: 'Location', detail: 'India', sub: 'Serving properties pan-India', href: '#map' },
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
                    <input type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle('phone')} />
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
              We operate across India with handpicked properties in Goa, Coorg, Jaipur, Munnar, Jaisalmer and Rishikesh — with more destinations added regularly.
            </p>
            <div id="map" style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
              <MapWrapper
                latitude={20.5937}
                longitude={78.9629}
                propertyName="Earthy Stay — India"
                address="Serving luxury properties across India"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ backgroundColor: 'var(--color-bg-soft)', padding: 'clamp(64px, 8vw, 100px) 24px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ color: 'var(--color-gold)', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: '600' }}>
              Quick Answers
            </p>
            <h2 style={{ fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '16px' }}>
              Frequently Asked Questions
            </h2>
            <div style={{ width: '60px', height: '2px', backgroundColor: 'var(--color-gold)', margin: '0 auto' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', padding: '20px 24px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'inherit'
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)', lineHeight: '1.4', paddingRight: '16px' }}>
                    {faq.q}
                  </span>
                  <span style={{
                    fontSize: '20px', color: 'var(--color-gold)', flexShrink: 0, fontWeight: '700',
                    transition: 'transform 0.2s ease',
                    transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)'
                  }}>
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div style={{ padding: '0 24px 20px', borderTop: '1px solid var(--color-border)' }}>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.8', paddingTop: '16px' }}>
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
