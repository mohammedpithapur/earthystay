'use client'
import { useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { dummyProperties } from '@/lib/data/properties'

export default function BookingPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const property = dummyProperties.find(p => p.id === id)

  // Get booking details from URL params
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests = Number(searchParams.get('guests')) || 1
  const pets = Number(searchParams.get('pets')) || 0
  const nights = Number(searchParams.get('nights')) || 0
  const total = Number(searchParams.get('total')) || 0

  // Form state
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    special_requests: '',
  })
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!property) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', marginBottom: '16px' }}>
          Property not found
        </h2>
        <button
          onClick={() => router.push('/properties')}
          style={{ backgroundColor: '#C9A84C', color: '#1C1C1C', border: 'none', padding: '14px 32px', fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer' }}
        >
          Back to Properties
        </button>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric',
      month: 'long', year: 'numeric'
    })
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!form.full_name.trim()) newErrors.full_name = 'Full name is required'
    if (!form.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email'
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (form.phone.length < 10) newErrors.phone = 'Enter a valid phone number'
    if (!agreed) newErrors.agreed = 'You must agree to the non-refundable policy'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)

    // Simulate payment processing
    // In real app this will call FastAPI → Razorpay
    setTimeout(() => {
      setLoading(false)
      router.push(`/booking/${id}/confirmation?name=${form.full_name}&email=${form.email}&checkIn=${checkIn}&checkOut=${checkOut}&total=${total}`)
    }, 1500)
  }

  const basePrice = property.price_per_night * nights
  const petCharge = pets * nights * property.pet_charge_per_night

  const inputStyle = (field: string) => ({
    width: '100%',
    padding: '14px 16px',
    border: `1px solid ${errors[field] ? '#E53E3E' : '#E5E0D8'}`,
    fontSize: '14px',
    color: '#1C1C1C',
    outline: 'none',
    backgroundColor: '#FAF8F5',
    boxSizing: 'border-box' as const
  })

  const labelStyle = {
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    color: '#888',
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600' as const
  }

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#1C1C1C', padding: '32px 24px', textAlign: 'center' }}>
        <p style={{ color: '#C9A84C', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '8px' }}>
          Almost There
        </p>
        <h1 style={{ fontFamily: 'Georgia, serif', color: '#FAF8F5', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: '400' }}>
          Complete Your Booking
        </h1>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'flex-start' }}>

        {/* Left — Guest Details Form */}
        <div>

          {/* Step 1 — Guest Info */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8', padding: '32px', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1C1C1C', marginBottom: '8px' }}>
              1. Guest Information
            </h2>
            <div style={{ width: '40px', height: '1px', backgroundColor: '#C9A84C', marginBottom: '28px' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

              {/* Full Name */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  style={inputStyle('full_name')}
                />
                {errors.full_name && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.full_name}</p>}
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  style={inputStyle('email')}
                />
                {errors.email && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  style={inputStyle('phone')}
                />
                {errors.phone && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.phone}</p>}
              </div>

              {/* Special Requests */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Special Requests (Optional)</label>
                <textarea
                  placeholder="Any special requests or notes for your stay..."
                  value={form.special_requests}
                  onChange={e => setForm({ ...form, special_requests: e.target.value })}
                  rows={4}
                  style={{
                    ...inputStyle('special_requests'),
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Step 2 — Booking Summary */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8', padding: '32px', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1C1C1C', marginBottom: '8px' }}>
              2. Booking Summary
            </h2>
            <div style={{ width: '40px', height: '1px', backgroundColor: '#C9A84C', marginBottom: '28px' }} />

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

              {/* Property Image */}
              <img
                src={property.images.find(i => i.is_primary)?.image_url || property.images[0]?.image_url}
                alt={property.name}
                style={{ width: '120px', height: '90px', objectFit: 'cover', flexShrink: 0 }}
              />

              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1C1C1C', marginBottom: '4px' }}>
                  {property.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>
                  📍 {property.city}, {property.state}
                </p>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  <div>
                    <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>Check In</p>
                    <p style={{ fontSize: '13px', color: '#1C1C1C', fontWeight: '600' }}>{formatDate(checkIn)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>Check Out</p>
                    <p style={{ fontSize: '13px', color: '#1C1C1C', fontWeight: '600' }}>{formatDate(checkOut)}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>Guests</p>
                    <p style={{ fontSize: '13px', color: '#1C1C1C', fontWeight: '600' }}>{guests} Guest{guests > 1 ? 's' : ''}</p>
                  </div>
                  {pets > 0 && (
                    <div>
                      <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>Pets</p>
                      <p style={{ fontSize: '13px', color: '#1C1C1C', fontWeight: '600' }}>🐾 {pets} Pet{pets > 1 ? 's' : ''}</p>
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '4px' }}>Duration</p>
                    <p style={{ fontSize: '13px', color: '#1C1C1C', fontWeight: '600' }}>{nights} Night{nights > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Step 3 — Cancellation Policy */}
          <div style={{ backgroundColor: '#FFF8E7', border: '1px solid #F0D080', padding: '32px', marginBottom: '24px' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1C1C1C', marginBottom: '8px' }}>
              3. Cancellation Policy
            </h2>
            <div style={{ width: '40px', height: '1px', backgroundColor: '#C9A84C', marginBottom: '20px' }} />

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
              <span style={{ fontSize: '28px' }}>⚠️</span>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1C1C1C', marginBottom: '8px' }}>
                  This booking is 100% Non-Refundable
                </h4>
                <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.7' }}>
                  Once your payment is confirmed, this booking cannot be cancelled or modified for a refund. The full amount of ₹{total.toLocaleString('en-IN')} will be charged and is non-refundable under any circumstances including weather, illness, or change of plans.
                </p>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <button
              onClick={() => setAgreed(!agreed)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
            >
              <div style={{
                width: '20px', height: '20px', flexShrink: 0,
                border: `2px solid ${errors.agreed ? '#E53E3E' : agreed ? '#C9A84C' : '#888'}`,
                backgroundColor: agreed ? '#C9A84C' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: '2px', transition: 'all 0.2s ease'
              }}>
                {agreed && <span style={{ color: '#1C1C1C', fontSize: '12px', fontWeight: '700' }}>✓</span>}
              </div>
              <span style={{ fontSize: '13px', color: '#1C1C1C', lineHeight: '1.6' }}>
                I understand and agree that this booking is <strong>non-refundable</strong>. I have reviewed all booking details and confirm they are correct.
              </span>
            </button>
            {errors.agreed && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '8px', paddingLeft: '32px' }}>{errors.agreed}</p>}
          </div>
        </div>

        {/* Right — Price Summary & Pay Button */}
        <div style={{ position: 'sticky', top: '100px' }}>

          {/* Price Breakdown */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8', padding: '28px', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '20px', color: '#1C1C1C', marginBottom: '20px' }}>
              Price Breakdown
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555' }}>
                <span>₹{property.price_per_night.toLocaleString('en-IN')} × {nights} nights</span>
                <span>₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              {pets > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555' }}>
                  <span>🐾 {pets} pet{pets > 1 ? 's' : ''} × {nights} nights</span>
                  <span>₹{petCharge.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#555' }}>
                <span>Cleaning fee</span>
                <span>₹{property.cleaning_fee.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#E5E0D8', marginBottom: '16px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '18px', fontWeight: '600', color: '#1C1C1C' }}>Total</span>
              <span style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: '600', color: '#1C1C1C' }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <p style={{ fontSize: '12px', color: '#888' }}>Includes all fees and taxes</p>
          </div>

          {/* Pay Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#E8D5A3' : '#C9A84C',
              color: '#1C1C1C',
              border: 'none',
              padding: '20px',
              fontSize: '14px',
              letterSpacing: '2px',
              fontWeight: '700',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
              transition: 'opacity 0.2s ease'
            }}
          >
            {loading ? 'Processing...' : `Pay ₹${total.toLocaleString('en-IN')}`}
          </button>

          {/* Security Note */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>
              🔒 Secured by Razorpay
            </p>
            <p style={{ fontSize: '11px', color: '#aaa', lineHeight: '1.6' }}>
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}