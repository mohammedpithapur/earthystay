'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

export default function ConfirmationPage() {
  const searchParams = useSearchParams()
  const [bookingRef] = useState(() => `ES-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)

  const name = searchParams.get('name') || 'Guest'
  const email = searchParams.get('email') || ''
  const checkIn = searchParams.get('checkIn') || ''
  const checkOut = searchParams.get('checkOut') || ''
  const total = Number(searchParams.get('total')) || 0

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="auth-shell" style={{ backgroundColor: '#ffffff' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>

        {/* Success */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px', height: '80px',
            backgroundColor: '#e1c391',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '32px',
            fontWeight: '700',
            color: '#1a1a1a',
          }}>
            &#10003;
          </div>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800', color: '#1a1a1a', marginBottom: '12px' }}>
            Booking Confirmed!
          </h1>
          <p style={{ color: '#555', fontSize: '15px', lineHeight: '1.7' }}>
            Thank you, <strong>{name}</strong>! Your booking has been confirmed. A confirmation email has been sent to <strong>{email}</strong>.
          </p>
        </div>

        {/* Booking Details */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e0d9c0', borderRadius: '12px', padding: '32px', marginBottom: '24px' }}>

          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'var(--color-navbar)', borderRadius: '8px', marginBottom: '28px', border: '1px dashed var(--color-navbar-border)' }}>
            <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888', marginBottom: '8px', fontWeight: '600' }}>Booking Reference</p>
            <p style={{ fontSize: '28px', color: '#1a1a1a', fontWeight: '800', letterSpacing: '4px' }}>
              {bookingRef}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Check In', value: formatDate(checkIn) },
              { label: 'Check Out', value: formatDate(checkOut) },
              { label: 'Total Paid', value: `&#8377;${total.toLocaleString('en-IN')}` },
              { label: 'Payment', value: 'Confirmed' },
            ].map(detail => (
              <div key={detail.label}>
                <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '6px', fontWeight: '600' }}>
                  {detail.label}
                </p>
                <p style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: '700' }}
                  dangerouslySetInnerHTML={{ __html: detail.value }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Warning */}
        <div style={{ backgroundColor: '#fffdf5', border: '1px solid #e1c391', borderRadius: '12px', padding: '16px 20px', marginBottom: '32px' }}>
          <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>
            <strong>Reminder:</strong> This booking is <strong>non-refundable</strong>. Please save your booking reference number for your records.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link
            href="/dashboard"
            style={{
              flex: 1,
              backgroundColor: '#e1c391',
              color: '#1a1a1a',
              padding: '16px',
              fontSize: '13px',
              letterSpacing: '1.5px',
              fontWeight: '700',
              textTransform: 'uppercase',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'block',
              borderRadius: '8px',
              minWidth: '220px',
            }}
          >
            View My Bookings
          </Link>
          <Link
            href="/properties"
            style={{
              flex: 1,
              border: '2px solid #e1c391',
              color: '#1a1a1a',
              padding: '16px',
              fontSize: '13px',
              letterSpacing: '1.5px',
              fontWeight: '700',
              textTransform: 'uppercase',
              textDecoration: 'none',
              textAlign: 'center',
              display: 'block',
              borderRadius: '8px',
              minWidth: '220px',
            }}
          >
            Explore More
          </Link>
        </div>
      </div>
    </div>
  )
}