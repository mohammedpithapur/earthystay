'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { buildApiUrl } from '@/lib/api'
import type { Property } from '@/lib/types'

export default function BookingPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const propertyId = Array.isArray(id) ? id[0] : id
  const [property, setProperty] = useState<Property | null>(null)
  const [pageLoading, setPageLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const guests = Number(searchParams.get('guests')) || 1
  const pets = Number(searchParams.get('pets')) || 0
  const nights = Number(searchParams.get('nights')) || 0
  const total = Number(searchParams.get('total')) || 0

  const [form, setForm] = useState({ full_name: '', email: '', phone: '', special_requests: '' })
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!propertyId) return
    let isMounted = true

    const load = async () => {
      try {
        setPageLoading(true)
        setLoadError(null)
        const response = await fetch(buildApiUrl(`/properties/${propertyId}`), { cache: 'no-store' })
        if (!response.ok) {
          throw new Error(`Failed to load property (${response.status})`)
        }
        const data = await response.json()
        if (isMounted) {
          setProperty(data)
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error instanceof Error ? error.message : 'Failed to load property')
        }
      } finally {
        if (isMounted) {
          setPageLoading(false)
        }
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [propertyId])

  if (pageLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>Loading property...</h2>
      </div>
    )
  }

  if (loadError) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '16px' }}>{loadError}</h2>
        <button onClick={() => router.push('/properties')} style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-text-primary)', border: 'none', padding: '14px 32px', fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer', borderRadius: '8px' }}>
          Back to Properties
        </button>
      </div>
    )
  }

  if (!property) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Property not found</h2>
        <button onClick={() => router.push('/properties')} style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-text-primary)', border: 'none', padding: '14px 32px', fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer', borderRadius: '8px' }}>
          Back to Properties
        </button>
      </div>
    )
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })

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
    border: `1px solid ${errors[field] ? '#E53E3E' : 'var(--color-border)'}`,
    borderRadius: '8px',
    fontSize: '14px',
    color: 'var(--color-text-primary)',
    outline: 'none',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box' as const,
  })

  const labelStyle = {
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    color: 'var(--color-text-muted)',
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600' as const,
  }

  const cardStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '24px',
  }

  return (
    <div className="page-shell" style={{ backgroundColor: '#ffffff' }}>

      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-navbar)', padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-gold)', fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>
          Almost There
        </p>
        <h1 style={{ color: 'var(--color-text-primary)', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: '800' }}>
          Complete Your Booking
        </h1>
      </div>

      <div className="content-shell" style={{ padding: '48px 0 72px' }}>
      <div className="responsive-grid-detail">

        {/* Left */}
        <div>

          {/* Guest Info */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              1. Guest Information
            </h2>
            <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-gold)', marginBottom: '28px' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Full Name</label>
                <input type="text" placeholder="John Doe" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} style={inputStyle('full_name')} />
                {errors.full_name && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.full_name}</p>}
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle('email')} />
                {errors.email && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.email}</p>}
              </div>
              <div>
                <label style={labelStyle}>Phone Number</label>
                <input type="tel" placeholder="+91 9874827631" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={inputStyle('phone')} />
                {errors.phone && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '4px' }}>{errors.phone}</p>}
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Special Requests (Optional)</label>
                <textarea
                  placeholder="Any special requests or notes for your stay..."
                  value={form.special_requests}
                  onChange={e => setForm({ ...form, special_requests: e.target.value })}
                  rows={4}
                  style={{ ...inputStyle('special_requests'), resize: 'vertical' }}
                />
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              2. Booking Summary
            </h2>
            <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-gold)', marginBottom: '28px' }} />

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <Image
                src={property.images.find(i => i.is_primary)?.image_url || property.images[0]?.image_url}
                alt={property.name}
                width={120}
                height={90}
                style={{ width: '120px', height: '90px', objectFit: 'cover', flexShrink: 0, borderRadius: '8px' }}
              />
              <div style={{ flex: '1 1 0', minWidth: 0 }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{property.name}</h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '12px' }}>{property.city}, {property.state}</p>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Check In', value: formatDate(checkIn) },
                    { label: 'Check Out', value: formatDate(checkOut) },
                    { label: 'Guests', value: `${guests} Guest${guests > 1 ? 's' : ''}` },
                    ...(pets > 0 ? [{ label: 'Pets', value: `${pets} Pet${pets > 1 ? 's' : ''}` }] : []),
                    { label: 'Duration', value: `${nights} Night${nights > 1 ? 's' : ''}` },
                  ].map(detail => (
                    <div key={detail.label}>
                      <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px', fontWeight: '600' }}>{detail.label}</p>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '700' }}>{detail.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-gold)', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              3. Cancellation Policy
            </h2>
            <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-gold)', marginBottom: '20px' }} />

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Important: This booking is 100% Non-Refundable
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>
                Once your payment is confirmed, this booking cannot be cancelled or modified for a refund. The full amount of ₹{total.toLocaleString('en-IN')} will be charged and is non-refundable under any circumstances including weather, illness, or change of plans.
              </p>
            </div>

            <button
              onClick={() => setAgreed(!agreed)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
            >
              <div style={{
                width: '20px', height: '20px', flexShrink: 0,
                border: `2px solid ${errors.agreed ? '#E53E3E' : agreed ? 'var(--color-gold)' : 'var(--color-text-muted)'}`,
                borderRadius: '4px',
                backgroundColor: agreed ? 'var(--color-gold)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: '2px', transition: 'all 0.2s ease',
              }}>
                {agreed && <span style={{ color: 'var(--color-text-primary)', fontSize: '12px', fontWeight: '700' }}>&#10003;</span>}
              </div>
              <span style={{ fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: '1.6' }}>
                I understand and agree that this booking is <strong>non-refundable</strong>. I have reviewed all booking details and confirm they are correct.
              </span>
            </button>
            {errors.agreed && <p style={{ color: '#E53E3E', fontSize: '12px', marginTop: '8px', paddingLeft: '32px' }}>{errors.agreed}</p>}
          </div>
        </div>

        {/* Right — Price Summary */}
        <div className="sticky-desktop">

          <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '12px', padding: 'clamp(20px, 5vw, 28px)', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '20px' }}>Price Breakdown</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                <span>₹{property.price_per_night.toLocaleString('en-IN')} x {nights} nights</span>
                <span>₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              {pets > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                  <span>{pets} pet{pets > 1 ? 's' : ''} x {nights} nights</span>
                  <span>₹{petCharge.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                <span>Cleaning fee</span>
                <span>₹{property.cleaning_fee.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--color-border)', marginBottom: '16px' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-primary)' }}>Total</span>
              <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-primary)' }}>₹{total.toLocaleString('en-IN')}</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Includes all fees and taxes</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? 'var(--color-gold)' : 'var(--color-gold)',
              color: 'var(--color-text-primary)',
              border: 'none',
              padding: '20px',
              fontSize: '14px',
              letterSpacing: '2px',
              fontWeight: '700',
              textTransform: 'uppercase',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
              borderRadius: '8px',
              transition: 'opacity 0.2s ease',
            }}
          >
            {loading ? 'Processing...' : `Pay ₹${total.toLocaleString('en-IN')}`}
          </button>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
              Secured by Razorpay
            </p>
            <p style={{ fontSize: '11px', color: '#aaa', lineHeight: '1.6' }}>
              Your payment information is encrypted and secure. We never store your card details.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
