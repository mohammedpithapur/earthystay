'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/auth/useRequireAuth'
import { useAuth } from '@/lib/auth/AuthContext'
import {
  getUserDashboard, listMyBookings, updateUserProfile, changeUserPassword, getPublicProperty,
  type UserDashboard, type MyBooking,
} from '@/lib/api'
import type { Property } from '@/lib/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  confirmed: { bg: '#E8F5E9', color: '#2E7D32' },
  pending:   { bg: '#FFF8E7', color: '#F57F17' },
  completed: { bg: '#E3F2FD', color: '#1565C0' },
  cancelled: { bg: '#FFEBEE', color: '#C62828' },
}

const PAYMENT_STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  paid:     { bg: '#E8F5E9', color: '#2E7D32', label: '✓ Paid' },
  unpaid:   { bg: '#FFF8E7', color: '#E65100', label: 'Unpaid' },
  refunded: { bg: '#E3F2FD', color: '#1565C0', label: 'Refunded' },
}

// ─── Voucher Modal ────────────────────────────────────────────────────────────

function VoucherModal({ booking, property, onClose }: {
  booking: MyBooking
  property: Property | null
  onClose: () => void
}) {
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
    >
      <div
        id="voucher-print"
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '40px', maxWidth: '520px', width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.2)' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: '700', marginBottom: '6px' }}>Booking Confirmation</p>
          <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'var(--color-text-primary)', letterSpacing: '3px' }}>{booking.booking_ref}</h2>
          <span style={{ ...STATUS_COLORS[booking.status], padding: '4px 14px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', borderRadius: '999px', letterSpacing: '0.8px', display: 'inline-block', marginTop: '8px' }}>
            {booking.status}
          </span>
        </div>

        {/* Property */}
        {property && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '700', marginBottom: '4px' }}>Property</p>
            <p style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)' }}>{property.name}</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>{property.address}, {property.city}</p>
          </div>
        )}

        {/* Dates grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Check In', value: formatDate(booking.check_in) },
            { label: 'Check Out', value: formatDate(booking.check_out) },
            { label: 'Nights', value: `${booking.nights} night${booking.nights !== 1 ? 's' : ''}` },
            { label: 'Guests', value: `${booking.guests}${(booking.pets || 0) > 0 ? ` + ${booking.pets} pet${booking.pets > 1 ? 's' : ''}` : ''}` },
          ].map(item => (
            <div key={item.label} style={{ backgroundColor: 'var(--color-bg-card)', borderRadius: '10px', padding: '12px 14px' }}>
              <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '700', marginBottom: '4px' }}>{item.label}</p>
              <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Price breakdown */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '18px', marginBottom: '24px' }}>
          {[
            { label: `Base price (${booking.nights} nights)`, amount: booking.base_price },
            ...(booking.pet_charge > 0 ? [{ label: 'Pet charge', amount: booking.pet_charge }] : []),
            { label: 'Cleaning fee', amount: booking.cleaning_fee },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
              <span>{row.label}</span>
              <span>&#8377;{row.amount.toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)', borderTop: '1px solid var(--color-border)', paddingTop: '10px', marginTop: '8px' }}>
            <span>Total</span>
            <span>&#8377;{booking.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Check-in/out times */}
        {property && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '700', marginBottom: '4px' }}>Check-in time</p>
              <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{property.check_in_time || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '700', marginBottom: '4px' }}>Check-out time</p>
              <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{property.check_out_time || '—'}</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'transparent', fontSize: '13px', cursor: 'pointer', fontWeight: '600', color: 'var(--color-text-secondary)' }}>
            Close
          </button>
          <button onClick={() => window.print()} style={{ padding: '10px 20px', border: 'none', borderRadius: '8px', backgroundColor: 'var(--color-gold)', fontSize: '13px', cursor: 'pointer', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            Print Voucher
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Booking Card ─────────────────────────────────────────────────────────────

function BookingCard({ booking, property, expanded, onToggle, onVoucher }: {
  booking: MyBooking
  property: Property | null
  expanded: boolean
  onToggle: () => void
  onVoucher: () => void
}) {
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', transition: 'box-shadow 0.2s ease' }}>

      {/* Main row */}
      <div className="p-6 flex flex-col md:flex-row gap-5 items-stretch md:items-start">

        {/* Property thumbnail */}
        {(() => {
          const src = property?.images?.find(i => i.is_primary)?.image_url || property?.images?.[0]?.image_url
          if (src) return (
            <div className="relative w-full h-48 md:w-[120px] md:h-[90px] flex-shrink-0 rounded-lg overflow-hidden">
              <Image src={src} alt={property?.name || 'Property'} fill style={{ objectFit: 'cover' }} unoptimized />
            </div>
          )
          return <div className="w-full h-48 md:w-[120px] md:h-[90px] rounded-lg bg-[var(--color-bg-card)] flex-shrink-0" />
        })()}

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                {property?.name || 'Loading…'}
              </h3>
              {property && (
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{property.city}, {property.state}</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: STATUS_COLORS[booking.status]?.bg, color: STATUS_COLORS[booking.status]?.color, padding: '4px 12px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', borderRadius: '6px', flexShrink: 0 }}>
                {booking.status}
              </span>
              {booking.payment_status && PAYMENT_STATUS_COLORS[booking.payment_status] && (
                <span style={{ backgroundColor: PAYMENT_STATUS_COLORS[booking.payment_status].bg, color: PAYMENT_STATUS_COLORS[booking.payment_status].color, padding: '4px 12px', fontSize: '11px', fontWeight: '700', borderRadius: '6px', flexShrink: 0 }}>
                  {PAYMENT_STATUS_COLORS[booking.payment_status].label}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
            {[
              { label: 'Check In',  value: formatDate(booking.check_in) },
              { label: 'Check Out', value: formatDate(booking.check_out) },
              { label: 'Nights',    value: `${booking.nights} night${booking.nights !== 1 ? 's' : ''}` },
              { label: 'Guests',    value: `${booking.guests}${(booking.pets || 0) > 0 ? ` + ${booking.pets} pet${booking.pets > 1 ? 's' : ''}` : ''}` },
            ].map(d => (
              <div key={d.label}>
                <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '2px', fontWeight: '600' }}>{d.label}</p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '700' }}>{d.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — total + actions */}
        <div className="text-left md:text-right flex-shrink-0 mt-4 md:mt-0 flex flex-col items-start md:items-end justify-between">
          <div>
            <p style={{ fontSize: '24px', color: 'var(--color-text-primary)', fontWeight: '900', marginBottom: '2px' }}>
              &#8377;{booking.total.toLocaleString('en-IN')}
            </p>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '14px', letterSpacing: '0.5px' }}>Total</p>
          </div>
          <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto mt-2">
            <button onClick={onToggle}
              style={{ padding: '8px 16px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: 'transparent', fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer', fontWeight: '600', transition: 'all 0.15s' }}
              className="flex-1 md:flex-initial">
              {expanded ? 'Hide Details' : 'View Details'}
            </button>
            <button onClick={onVoucher}
              style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', backgroundColor: 'var(--color-gold)', color: 'var(--color-text-primary)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.15s' }}
              className="flex-1 md:flex-initial">
              Booking Voucher
            </button>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--color-border)', padding: '24px', backgroundColor: 'var(--color-bg-soft)', animation: 'fadeDown 0.2s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>

            <div>
              <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: '700' }}>Booking Reference</p>
              <p style={{ fontSize: '22px', color: 'var(--color-gold)', fontWeight: '900', letterSpacing: '2px' }}>{booking.booking_ref}</p>
            </div>

            {property?.check_in_time && (
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: '700' }}>Check-in Time</p>
                <p style={{ fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: '700' }}>{property.check_in_time}</p>
              </div>
            )}

            {property?.check_out_time && (
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: '700' }}>Check-out Time</p>
                <p style={{ fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: '700' }}>{property.check_out_time}</p>
              </div>
            )}

            {property?.address && (
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: '700' }}>Address</p>
                <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: '1.5' }}>{property.address}, {property.city}</p>
              </div>
            )}

            {(property?.contact_phone || property?.contact_email) && (
              <div>
                <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: '700' }}>Property Contact</p>
                {property.contact_phone && <p style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>{property.contact_phone}</p>}
                {property.contact_email && <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{property.contact_email}</p>}
              </div>
            )}

            <div>
              <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px', fontWeight: '700' }}>Price Breakdown</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {[
                  { label: `Base (${booking.nights} nights)`, amount: booking.base_price },
                  ...(booking.pet_charge > 0 ? [{ label: 'Pet charge', amount: booking.pet_charge }] : []),
                  { label: 'Cleaning fee', amount: booking.cleaning_fee },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                    <span>{row.label}</span><span>&#8377;{row.amount.toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800', color: 'var(--color-text-primary)', borderTop: '1px solid var(--color-border)', paddingTop: '4px', marginTop: '4px' }}>
                  <span>Total</span><span>&#8377;{booking.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-gold)', borderRadius: '8px', padding: '12px 16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              <strong>Important:</strong> This booking is <strong>non-refundable</strong>. Cancellation will not result in a refund. For emergencies contact the property directly.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading, logout, fetchWithAuth } = useAuth()
  useRequireAuth()

  // ── State ──
  const [activeTab, setActiveTab] = useState('bookings')
  const [dashStats, setDashStats] = useState<UserDashboard | null>(null)
  const [upcomingBookings, setUpcomingBookings] = useState<MyBooking[]>([])
  const [pastBookings, setPastBookings] = useState<MyBooking[]>([])
  const [pendingBookings, setPendingBookings] = useState<MyBooking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [propertiesCache, setPropertiesCache] = useState<Record<string, Property>>({})
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null)
  const [voucherBooking, setVoucherBooking] = useState<MyBooking | null>(null)

  // Profile
  const [profileForm, setProfileForm] = useState({ full_name: '', email: '', phone: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileError, setProfileError] = useState('')

  // Password
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Sync profile form from user object
  const profileSynced = useRef(false)
  useEffect(() => {
    if (user && !profileSynced.current) {
      setProfileForm({ full_name: user.full_name, email: user.email, phone: user.phone || '' })
      profileSynced.current = true
    }
  }, [user])

  // ── Fetch property from cache or API ──
  const fetchProperty = useCallback(async (propertyId: string) => {
    if (propertiesCache[propertyId]) return
    try {
      const p = await getPublicProperty(propertyId)
      setPropertiesCache(prev => ({ ...prev, [propertyId]: p }))
    } catch { /* property might be unpublished */ }
  }, [propertiesCache])

  // ── Load stats + bookings ──
  const loadAll = useCallback(async () => {
    setBookingsLoading(true)
    try {
      const [stats, upcoming, past, pending] = await Promise.all([
        getUserDashboard(fetchWithAuth),
        listMyBookings({ status: 'confirmed', limit: 50 }, fetchWithAuth),
        listMyBookings({ status: 'completed', limit: 50 }, fetchWithAuth),
        listMyBookings({ status: 'pending',   limit: 50 }, fetchWithAuth),
      ])
      setDashStats(stats)
      setUpcomingBookings(upcoming.items)
      setPastBookings(past.items)
      setPendingBookings(pending.items)

      // Prefetch all property details
      const allIds = new Set([
        ...upcoming.items.map(b => b.property_id),
        ...past.items.map(b => b.property_id),
        ...pending.items.map(b => b.property_id),
      ])
      allIds.forEach(id => fetchProperty(id))
    } catch { /* fail silently */ }
    finally { setBookingsLoading(false) }
  }, [fetchWithAuth, fetchProperty])

  useEffect(() => {
    if (!loading && user) void loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user])

  // ── Guard ──
  if (loading || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }`}</style>
      </div>
    )
  }

  // ── Stats ──
  const totalBookings   = dashStats ? (dashStats.upcoming_bookings + dashStats.past_stays) : 0
  const upcomingCount   = dashStats?.upcoming_bookings ?? upcomingBookings.length + pendingBookings.length
  const pastCount       = dashStats?.past_stays ?? pastBookings.length
  const totalSpent      = dashStats?.total_spent ?? 0

  // ── Profile save ──
  const handleSaveProfile = async () => {
    setProfileSaving(true); setProfileError(''); setProfileSuccess('')
    try {
      await updateUserProfile({ full_name: profileForm.full_name, phone: profileForm.phone || undefined }, fetchWithAuth)
      setProfileSuccess('Profile updated successfully!')
      setTimeout(() => setProfileSuccess(''), 3000)
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : 'Failed to update profile')
    } finally { setProfileSaving(false) }
  }

  // ── Password change ──
  const handleChangePassword = async () => {
    setPasswordError(''); setPasswordSuccess('')
    if (!passwordForm.old_password || !passwordForm.new_password) { setPasswordError('All fields are required'); return }
    if (passwordForm.new_password !== passwordForm.confirm) { setPasswordError('New passwords do not match'); return }
    if (passwordForm.new_password.length < 8) { setPasswordError('New password must be at least 8 characters'); return }
    setPasswordSaving(true)
    try {
      await changeUserPassword({ old_password: passwordForm.old_password, new_password: passwordForm.new_password }, fetchWithAuth)
      setPasswordForm({ old_password: '', new_password: '', confirm: '' })
      setPasswordSuccess('Password changed successfully!')
      setTimeout(() => setPasswordSuccess(''), 3000)
    } catch (e) {
      setPasswordError(e instanceof Error ? e.message : 'Failed to change password')
    } finally { setPasswordSaving(false) }
  }

  // ── Shared booking list renderer ──
  const renderBookingList = (bookings: MyBooking[], emptyTitle: string, emptyBody: string) => {
    if (bookingsLoading) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2].map(i => (
            <div key={i} style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '24px', height: '130px', animation: 'pulse 1.5s infinite' }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
      )
    }
    if (bookings.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '14px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏡</div>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '10px' }}>{emptyTitle}</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginBottom: '24px' }}>{emptyBody}</p>
          <Link href="/properties" style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-text-primary)', padding: '14px 32px', fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700', textDecoration: 'none', borderRadius: '8px', display: 'inline-block' }}>
            Explore Properties
          </Link>
        </div>
      )
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {bookings.map(booking => (
          <BookingCard
            key={booking.id}
            booking={booking}
            property={propertiesCache[booking.property_id] ?? null}
            expanded={expandedBooking === booking.id}
            onToggle={() => setExpandedBooking(prev => prev === booking.id ? null : booking.id)}
            onVoucher={() => setVoucherBooking(booking)}
          />
        ))}
      </div>
    )
  }

  const tabs = [
    { id: 'bookings', label: 'Upcoming',    count: upcomingCount + pendingBookings.length },
    { id: 'past',     label: 'Past Stays',  count: pastCount },
    { id: 'profile',  label: 'My Profile',  count: null },
  ]

  const inputStyle = {
    width: '100%', padding: '14px 16px', border: '1px solid var(--color-border)',
    borderRadius: '8px', fontSize: '14px', color: 'var(--color-text-primary)',
    outline: 'none', backgroundColor: '#ffffff', boxSizing: 'border-box' as const,
    fontFamily: "'Figtree', sans-serif",
  }
  const labelStyle = {
    fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase' as const,
    color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px', fontWeight: '600' as const,
  }

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeDown { from { opacity:0; transform:translateY(-8px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.45} }
        @media print { body > *:not(#voucher-print) { display: none !important; } }
      `}</style>

      {/* Voucher Modal */}
      {voucherBooking && (
        <VoucherModal
          booking={voucherBooking}
          property={propertiesCache[voucherBooking.property_id] ?? null}
          onClose={() => setVoucherBooking(null)}
        />
      )}

      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(135deg, var(--color-navbar) 0%, #1a1a1a 100%)', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ color: 'var(--color-gold)', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' }}>Welcome back</p>
            <h1 style={{ color: 'var(--color-text-primary)', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: '900', letterSpacing: '-0.5px' }}>
              {user.full_name}
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', marginTop: '4px' }}>{user.email}</p>
          </div>
          <Link href="/properties"
            style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-text-primary)', padding: '14px 28px', fontSize: '13px', letterSpacing: '1.5px', fontWeight: '800', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '8px', display: 'inline-block' }}>
            + Book New Stay
          </Link>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--color-border)' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-6" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {[
            { label: 'Total Bookings',  value: totalBookings },
            { label: 'Upcoming Stays', value: upcomingCount },
            { label: 'Past Stays',     value: pastCount },
            { label: 'Total Spent',    value: `&#8377;${totalSpent.toLocaleString('en-IN')}` },
          ].map((stat) => (
            <div key={stat.label}
              style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px 16px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
              <p style={{ fontSize: '28px', color: 'var(--color-text-primary)', fontWeight: '900', marginBottom: '4px' }}
                dangerouslySetInnerHTML={{ __html: String(stat.value) }} />
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '600' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', marginBottom: '32px', borderBottom: '1px solid var(--color-border)', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 24px', border: 'none', whiteSpace: 'nowrap',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-gold)' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab.id ? 'var(--color-gold)' : 'var(--color-text-muted)',
                fontSize: '14px', cursor: 'pointer',
                fontWeight: activeTab === tab.id ? '700' : '500',
                display: 'flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.2s ease',
              }}>
              {tab.label}
              {tab.count !== null && (
                <span style={{
                  backgroundColor: activeTab === tab.id ? 'var(--color-gold)' : 'var(--color-border)',
                  color: activeTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  borderRadius: '50%', width: '22px', height: '22px', fontSize: '11px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700',
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Upcoming Bookings ── */}
        {activeTab === 'bookings' && (
          <div>
            {pendingBookings.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <span style={{ width: '10px', height: '10px', backgroundColor: '#F57F17', borderRadius: '50%', display: 'inline-block' }} />
                  <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)' }}>Awaiting Confirmation</h2>
                </div>
                {renderBookingList(pendingBookings, '', '')}
              </div>
            )}
            {(upcomingBookings.length > 0 || pendingBookings.length === 0) && (
              <div>
                {pendingBookings.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <span style={{ width: '10px', height: '10px', backgroundColor: '#2E7D32', borderRadius: '50%', display: 'inline-block' }} />
                    <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)' }}>Confirmed Stays</h2>
                  </div>
                )}
                {renderBookingList(upcomingBookings, 'No upcoming bookings', "Ready for your next escape? Browse our properties.")}
              </div>
            )}
          </div>
        )}

        {/* ── Past Stays ── */}
        {activeTab === 'past' && renderBookingList(pastBookings, 'No past stays yet', 'Your completed stays will appear here.')}

        {/* ── Profile ── */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: '600px' }}>

            {/* Profile card */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '32px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
                <div style={{ width: '72px', height: '72px', backgroundColor: 'var(--color-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '900', color: 'var(--color-text-primary)', flexShrink: 0 }}>
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '2px' }}>{user.full_name}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{user.role === 'admin' ? '✦ Admin Account' : 'Guest Account'}</p>
                </div>
              </div>

              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px' }}>Personal Details</h2>
              <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-gold)', marginBottom: '24px' }} />

              {[
                { label: 'Full Name',     field: 'full_name', type: 'text',  placeholder: 'Your name', readOnly: false },
                { label: 'Email Address', field: 'email',     type: 'email', placeholder: 'you@example.com', readOnly: true },
                { label: 'Phone Number',  field: 'phone',     type: 'tel',   placeholder: '+91 9876543210', readOnly: false },
              ].map(item => (
                <div key={item.field} style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>{item.label}</label>
                  <input
                    type={item.type}
                    placeholder={item.placeholder}
                    readOnly={item.readOnly}
                    value={profileForm[item.field as keyof typeof profileForm]}
                    onChange={e => !item.readOnly && setProfileForm({ ...profileForm, [item.field]: e.target.value })}
                    style={{ ...inputStyle, backgroundColor: item.readOnly ? 'var(--color-bg-soft)' : '#ffffff', color: item.readOnly ? 'var(--color-text-muted)' : 'var(--color-text-primary)', cursor: item.readOnly ? 'not-allowed' : 'text' }}
                  />
                  {item.readOnly && <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Email cannot be changed</p>}
                </div>
              ))}

              {profileError && <p style={{ color: '#C62828', fontSize: '13px', marginBottom: '12px', fontWeight: '600' }}>{profileError}</p>}
              {profileSuccess && <p style={{ color: '#2E7D32', fontSize: '13px', marginBottom: '12px', fontWeight: '600' }}>✓ {profileSuccess}</p>}

              <button
                onClick={handleSaveProfile}
                disabled={profileSaving}
                style={{ backgroundColor: profileSaving ? 'var(--color-border)' : 'var(--color-gold)', color: profileSaving ? '#aaa' : 'var(--color-text-primary)', border: 'none', padding: '14px 32px', fontSize: '13px', letterSpacing: '1.5px', fontWeight: '700', textTransform: 'uppercase', cursor: profileSaving ? 'not-allowed' : 'pointer', borderRadius: '8px', transition: 'background 0.2s' }}>
                {profileSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>

            {/* Change Password card */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '32px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '6px' }}>Change Password</h3>
              <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-gold)', marginBottom: '24px' }} />

              {[
                { label: 'Current Password', field: 'old_password' },
                { label: 'New Password',     field: 'new_password' },
                { label: 'Confirm New Password', field: 'confirm' },
              ].map(item => (
                <div key={item.field} style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>{item.label}</label>
                  <input
                    type="password" placeholder="••••••••"
                    value={passwordForm[item.field as keyof typeof passwordForm]}
                    onChange={e => setPasswordForm({ ...passwordForm, [item.field]: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              ))}

              {passwordError && <p style={{ color: '#C62828', fontSize: '13px', marginBottom: '12px', fontWeight: '600' }}>{passwordError}</p>}
              {passwordSuccess && <p style={{ color: '#2E7D32', fontSize: '13px', marginBottom: '12px', fontWeight: '600' }}>✓ {passwordSuccess}</p>}

              <button
                onClick={handleChangePassword}
                disabled={passwordSaving}
                style={{ backgroundColor: passwordSaving ? 'var(--color-border)' : 'var(--color-text-primary)', color: passwordSaving ? '#aaa' : '#ffffff', border: 'none', padding: '14px 32px', fontSize: '13px', letterSpacing: '1.5px', fontWeight: '700', textTransform: 'uppercase', cursor: passwordSaving ? 'not-allowed' : 'pointer', borderRadius: '8px' }}>
                {passwordSaving ? 'Updating…' : 'Update Password'}
              </button>
            </div>

            {/* Sign out */}
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button
                onClick={async () => { await logout(); router.push('/') }}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}>
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
