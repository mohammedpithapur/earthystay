'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [bookingRef] = useState(() => `ES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)

  const name = searchParams.get('name') || 'Guest'
  const email = searchParams.get('email') || ''
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const total = Number(searchParams.get('total')) || 0

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric',
      month: 'long', year: 'numeric'
    })
  }

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>

        {/* Success Icon */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px', height: '80px',
            backgroundColor: '#C9A84C',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '36px'
          }}>
            ✓
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 40px)', color: '#1C1C1C', marginBottom: '12px', fontWeight: '400' }}>
            Booking Confirmed!
          </h1>
          <p style={{ color: '#555', fontSize: '15px', lineHeight: '1.7' }}>
            Thank you, <strong>{name}</strong>! Your booking has been confirmed. A confirmation email has been sent to <strong>{email}</strong>.
          </p>
        </div>

        {/* Booking Details Card */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8', padding: '32px', marginBottom: '24px' }}>

          {/* Booking Ref */}
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#FAF8F5', marginBottom: '28px', border: '1px dashed #C9A84C' }}>
            <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '8px' }}>Booking Reference</p>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: '28px', color: '#C9A84C', fontWeight: '600', letterSpacing: '4px' }}>
              {bookingRef}
            </p>
          </div>

          {/* Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {[
              { label: 'Check In', value: formatDate(checkIn) },
              { label: 'Check Out', value: formatDate(checkOut) },
              { label: 'Total Paid', value: `₹${total.toLocaleString('en-IN')}` },
              { label: 'Payment', value: '✅ Confirmed' },
            ].map(detail => (
              <div key={detail.label}>
                <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '6px' }}>
                  {detail.label}
                </p>
                <p style={{ fontSize: '15px', color: '#1C1C1C', fontWeight: '600' }}>
                  {detail.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Non Refundable Reminder */}
        <div style={{ backgroundColor: '#FFF8E7', border: '1px solid #F0D080', padding: '16px 20px', marginBottom: '32px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
            Reminder: This booking is <strong>non-refundable</strong>. Please save your booking reference number for your records.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link
            href="/dashboard"
            style={{
              flex: 1,
              backgroundColor: '#C9A84C', color: '#1C1C1C',
              padding: '16px', fontSize: '13px',
              letterSpacing: '1.5px', fontWeight: '700',
              textTransform: 'uppercase', textDecoration: 'none',
              textAlign: 'center', display: 'block'
            }}
          >
            View My Bookings
          </Link>
          <Link
            href="/properties"
            style={{
              flex: 1,
              border: '1.5px solid #C9A84C', color: '#C9A84C',
              padding: '16px', fontSize: '13px',
              letterSpacing: '1.5px', fontWeight: '700',
              textTransform: 'uppercase', textDecoration: 'none',
              textAlign: 'center', display: 'block'
            }}
          >
            Explore More
          </Link>
        </div>
      </div>
    </div>
  )
}