'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRequireAuth } from '@/lib/auth/useRequireAuth'
import {
  listPropertyGroups, createPropertyGroup, updatePropertyGroup, deletePropertyGroup,
  addPropertyGroupMember, removePropertyGroupMember, updatePropertyGroupMember,
  listAdminProperties, deleteAdminProperty,
  getAdminDashboard, listAdminBookings, updateAdminBookingStatus, updateAdminBookingWithRefund,
  createAdminReview, deleteAdminReview, fetchPropertyReviews,
  listICalLinks, createICalLink, deleteICalLink, getICalExportUrl,
  listAdminEvents, updateAdminEventStatus,
  type PropertyGroup, type CreateReviewPayload, type AdminBooking, type AdminDashboard, type ICalLink,
  type EventRequest, type EventStatus,
} from '@/lib/api'
import type { Property, Review } from '@/lib/types'
import CalendarModal from './properties/CalendarModal'

const BOOKINGS_PER_PAGE = 15
const E2E_SKIP_AUTH = process.env.NEXT_PUBLIC_E2E_SKIP_AUTH === '1'

const E2E_SEED_PROPERTY: Property = {
  id: 'e2e-seed-property',
  name: 'Seed Property',
  description: 'Seed property used by Playwright tests',
  price_per_night: 12500,
  cleaning_fee: 1500,
  max_guests: 4,
  bedrooms: 2,
  bathrooms: 1,
  bathrooms_detail: [],
  city: 'Goa',
  state: 'Goa',
  country: 'India',
  latitude: 15.2993,
  longitude: 74.124,
  is_published: true,
  min_nights: 1,
  pets_allowed: false,
  pet_charge_per_night: 0,
  images: [],
  amenities: [],
  avg_rating: 4.8,
  review_count: 12,
  created_at: '2026-05-31T00:00:00.000Z',
  address: 'Test Address',
  contact_phone: '9999999999',
  contact_email: 'test@example.com',
  check_in_time: '2:00 PM',
  check_out_time: '11:00 AM',
  house_rules: [],
}

const statusColors: Record<string, { bg: string, color: string }> = {
  confirmed: { bg: '#E8F5E9', color: '#2E7D32' },
  pending: { bg: '#FFF8E7', color: '#F57F17' },
  completed: { bg: '#E3F2FD', color: '#1565C0' },
  cancelled: { bg: '#FFEBEE', color: '#C62828' },
}

export default function AdminPage() {
  const router = useRouter()
  const { user, loading } = useRequireAuth({ requireAdmin: true })
  const { fetchWithAuth } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  // ── Dashboard stats ───────────────────────────────────────────────────────
  const [dashStats, setDashStats] = useState<AdminDashboard | null>(null)

  // ── Bookings state ────────────────────────────────────────────────────────
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [bookingsTotal, setBookingsTotal] = useState(0)
  const [bookingsPage, setBookingsPage] = useState(1)
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [searchBooking, setSearchBooking] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [voucherBooking, setVoucherBooking] = useState<AdminBooking | null>(null)

  // ── Groups state ──────────────────────────────────────────────────────────
  const [groups, setGroups] = useState<PropertyGroup[]>([])
  const [apiProperties, setApiProperties] = useState<Property[]>([])
  const [groupsLoading, setGroupsLoading] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingGroupName, setEditingGroupName] = useState('')
  const [addingMemberGroupId, setAddingMemberGroupId] = useState<string | null>(null)
  const [memberPropertyId, setMemberPropertyId] = useState('')
  const [memberIsWhole, setMemberIsWhole] = useState(false)
  const [groupError, setGroupError] = useState('')
  const [groupSuccess, setGroupSuccess] = useState('')

  // ── Reviews state ─────────────────────────────────────────────────────────
  const [reviewsGroupId, setReviewsGroupId] = useState<string | null>(null)
  const [groupReviews, setGroupReviews] = useState<Review[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [newReview, setNewReview] = useState({ guest_name: '', rating: 5, comment: '', platform: '' })
  const [addingReview, setAddingReview] = useState(false)

  // ── iCal state ────────────────────────────────────────────────────────────
  const [icalLinks, setIcalLinks] = useState<Record<string, ICalLink[]>>({})
  const [icalInputs, setIcalInputs] = useState<Record<string, { name: string; url: string }>>({})
  const [icalSaving, setIcalSaving] = useState<Record<string, boolean>>({})
  const [icalCopied, setIcalCopied] = useState<Record<string, boolean>>({})

  // ── Events state ──────────────────────────────────────────────────────────
  const [events, setEvents] = useState<EventRequest[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [eventsSearch, setEventsSearch] = useState('')
  const [eventsStatusFilter, setEventsStatusFilter] = useState('')
  const eventsSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Calendar / date-blocking state ───────────────────────────────────────
  const [calendarProperty, setCalendarProperty] = useState<{ id: string; name: string } | null>(null)

  // ── Load bookings ─────────────────────────────────────────────────────────
  const loadBookings = useCallback(async (page = 1, search = '', status = '') => {
    if (loading || !user) return
    setBookingsLoading(true)
    try {
      const data = await listAdminBookings(
        { search: search || undefined, status: status || undefined, page, limit: BOOKINGS_PER_PAGE },
        fetchWithAuth,
      )
      setBookings(data.items)
      setBookingsTotal(data.total)
      setBookingsPage(data.page)
    } catch { /* noop */ } finally {
      setBookingsLoading(false)
    }
  }, [fetchWithAuth, loading, user])

  // ── Load dashboard stats ──────────────────────────────────────────────────
  const loadDashboard = useCallback(async () => {
    if (loading || !user) return
    try {
      const [stats, props] = await Promise.all([
        getAdminDashboard(fetchWithAuth),
        listAdminProperties(fetchWithAuth),
      ])
      setDashStats(stats)
      setApiProperties(props)
    } catch { /* noop */ }
  }, [fetchWithAuth, loading, user])

  // ── Load groups ───────────────────────────────────────────────────────────
  const loadGroups = useCallback(async () => {
    if (loading || !user) return
    setGroupsLoading(true)
    try {
      const [gs, props] = await Promise.all([
        listPropertyGroups(fetchWithAuth),
        listAdminProperties(fetchWithAuth),
      ])
      setGroups(gs)
      setApiProperties(props)
    } catch {
      setGroupError('Failed to load groups')
    } finally {
      setGroupsLoading(false)
    }
  }, [fetchWithAuth, loading, user])

  // ── Load iCal links for a property ───────────────────────────────────────
  const loadIcalLinks = useCallback(async (propertyId: string) => {
    try {
      const links = await listICalLinks(propertyId, fetchWithAuth)
      setIcalLinks(prev => ({ ...prev, [propertyId]: links }))
    } catch { /* noop */ }
  }, [fetchWithAuth])

  // ── Load event requests ───────────────────────────────────────────────────
  const loadEvents = useCallback(async (search = '', status = '') => {
    if (loading || !user) return
    setEventsLoading(true)
    try {
      const data = await listAdminEvents(fetchWithAuth, status || undefined, search || undefined)
      setEvents(data)
    } catch { /* noop */ }
    finally { setEventsLoading(false) }
  }, [fetchWithAuth, loading, user])

  // ── Effects: load data when tab changes ──────────────────────────────────
  useEffect(() => {
    if (activeTab === 'overview') { void loadDashboard(); void loadBookings(1, '', '') }
    if (activeTab === 'bookings') { void loadBookings(1, searchBooking, statusFilter) }
    if (activeTab === 'groups')   { void loadGroups() }
    if (activeTab === 'properties') {
      listAdminProperties(fetchWithAuth).then(setApiProperties).catch(() => {})
    }
    if (activeTab === 'ical') {
      listAdminProperties(fetchWithAuth).then(props => {
        setApiProperties(props)
        props.forEach(p => loadIcalLinks(p.id))
      }).catch(() => {})
    }
    if (activeTab === 'events') {
      void loadEvents(eventsSearch, eventsStatusFilter)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

  // ── Loading guard — must come AFTER all hooks ──────────────────────────────
  if (loading || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const totalRevenue = dashStats?.total_revenue ?? 0
  const confirmedBookings = dashStats ? (dashStats.total_bookings - dashStats.pending_bookings) : 0
  const pendingBookings = dashStats?.pending_bookings ?? 0
  const completedBookings = 0  // not in dashboard summary — use booking list
  const totalBookingsCount = dashStats?.total_bookings ?? 0

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })



  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const updated = await updateAdminBookingStatus(id, status, fetchWithAuth)
      setBookings(prev => prev.map(b => b.id === id ? updated : b))
    } catch { /* noop */ }
  }

  const handleCancelWithRefund = async (booking: AdminBooking) => {
    const isPaid = (booking as AdminBooking & { payment_status?: string }).payment_status === 'paid'
    const msg = isPaid
      ? `Cancel booking ${booking.booking_ref} and issue a full refund of ₹${booking.total.toLocaleString('en-IN')}? This cannot be undone.`
      : `Cancel booking ${booking.booking_ref}? This cannot be undone.`
    if (!confirm(msg)) return
    try {
      const updated = await updateAdminBookingWithRefund(booking.id, 'cancelled', undefined, fetchWithAuth)
      setBookings(prev => prev.map(b => b.id === booking.id ? updated : b))
    } catch (e) { alert((e as Error).message || 'Failed to cancel booking') }
  }

  const handleDeleteProperty = async (propertyId: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    try {
      await deleteAdminProperty(propertyId, fetchWithAuth)
      setApiProperties(prev => prev.filter(p => p.id !== propertyId))
    } catch { alert('Failed to delete property') }
  }

  const handleIcalSync = async (propertyId: string) => {
    const input = icalInputs[propertyId]
    if (!input?.url?.trim()) return
    setIcalSaving(prev => ({ ...prev, [propertyId]: true }))
    try {
      await createICalLink(propertyId, {
        calendar_name: input.name.trim() || 'Import',
        ical_url: input.url.trim(),
        direction: 'import',
      }, fetchWithAuth)
      setIcalInputs(prev => ({ ...prev, [propertyId]: { name: '', url: '' } }))
      await loadIcalLinks(propertyId)
    } catch { /* noop */ } finally {
      setIcalSaving(prev => ({ ...prev, [propertyId]: false }))
    }
  }

  const handleIcalDelete = async (propertyId: string, linkId: string) => {
    try {
      await deleteICalLink(linkId, fetchWithAuth)
      setIcalLinks(prev => ({ ...prev, [propertyId]: (prev[propertyId] || []).filter(l => l.id !== linkId) }))
    } catch { /* noop */ }
  }

  const handleCopyIcal = (propertyId: string, url: string) => {
    navigator.clipboard.writeText(url)
    setIcalCopied(prev => ({ ...prev, [propertyId]: true }))
    setTimeout(() => setIcalCopied(prev => ({ ...prev, [propertyId]: false })), 2000)
  }

  // Debounced search for bookings
  const handleBookingSearch = (value: string) => {
    setSearchBooking(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => loadBookings(1, value, statusFilter), 400)
  }

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    void loadBookings(1, searchBooking, value)
  }

  // Debounced search for event requests
  const handleEventsSearch = (value: string) => {
    setEventsSearch(value)
    if (eventsSearchTimer.current) clearTimeout(eventsSearchTimer.current)
    eventsSearchTimer.current = setTimeout(() => loadEvents(value, eventsStatusFilter), 400)
  }

  const handleEventsStatusFilter = (value: string) => {
    setEventsStatusFilter(value)
    void loadEvents(eventsSearch, value)
  }

  const handleUpdateEventStatus = async (id: string, status: EventStatus) => {
    try {
      const updated = await updateAdminEventStatus(id, status, fetchWithAuth)
      setEvents(prev => prev.map(ev => ev.id === id ? updated : ev))
    } catch { alert('Failed to update event status') }
  }

  const getProperty = (id: string) => apiProperties.find(p => p.id === id)
  const propertiesForDisplay = apiProperties.length > 0
    ? apiProperties
    : (E2E_SKIP_AUTH ? [E2E_SEED_PROPERTY] : [])

  const renderBookingCard = (booking: AdminBooking, showActions = false) => {
    const property = getProperty(booking.property_id)
    if (!property) return null

    return (
      <div key={booking.id} style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '18px', boxShadow: '0 8px 24px rgba(26,26,26,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '10px', letterSpacing: '1.4px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '700', marginBottom: '4px' }}>Booking Ref</p>
            <p style={{ fontSize: '14px', color: 'var(--color-gold)', fontWeight: '800' }}>{booking.booking_ref}</p>
          </div>
          <span style={{ backgroundColor: statusColors[booking.status]?.bg, color: statusColors[booking.status]?.color, padding: '5px 10px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', borderRadius: '999px', letterSpacing: '0.6px', flexShrink: 0 }}>
            {booking.status}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          {(() => {
            const primaryImage = property.images.find(i => i.is_primary)?.image_url || property.images[0]?.image_url
            if (primaryImage) {
              return (
                <Image
                  src={primaryImage}
                  alt={property.name}
                  width={72}
                  height={72}
                  style={{ width: '72px', height: '72px', objectFit: 'cover', flexShrink: 0, borderRadius: '12px' }}
                />
              )
            }
            return <div style={{ width: 72, height: 72, borderRadius: 12, backgroundColor: 'var(--color-bg-card)' }} />
          })()}
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{property.name}</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{booking.guest_name}</p>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{property.city}, {property.state}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', marginBottom: '14px' }}>
          {[
            { label: 'Check In', value: formatDate(booking.check_in) },
            { label: 'Check Out', value: formatDate(booking.check_out) },
            { label: 'Guests', value: `${booking.guests}${(booking.pets || 0) > 0 ? ` + ${booking.pets} pet${(booking.pets || 0) > 1 ? 's' : ''}` : ''}` },
            { label: 'Amount', value: `₹${booking.total.toLocaleString('en-IN')}` },
          ].map(detail => (
            <div key={detail.label} style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '10px 12px' }}>
              <p style={{ fontSize: '10px', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '700', marginBottom: '4px' }}>{detail.label}</p>
              <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '700', lineHeight: '1.35' }}>{detail.value}</p>
            </div>
          ))}
        </div>

        {showActions && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {booking.status === 'pending' && (
              <>
                <button onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')} style={{ padding: '9px 12px', backgroundColor: '#E8F5E9', color: '#2E7D32', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '800', borderRadius: '8px' }}>
                  Confirm
                </button>
                <button onClick={() => handleCancelWithRefund(booking)} style={{ padding: '9px 12px', backgroundColor: '#FFEBEE', color: '#C62828', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '800', borderRadius: '8px' }}>
                  {(booking as AdminBooking & { payment_status?: string }).payment_status === 'paid' ? 'Cancel + Refund' : 'Cancel'}
                </button>
              </>
            )}
            {booking.status === 'confirmed' && (
              <button onClick={() => handleUpdateBookingStatus(booking.id, 'completed')} style={{ padding: '9px 12px', backgroundColor: '#E3F2FD', color: '#1565C0', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '800', borderRadius: '8px' }}>
                Complete
              </button>
            )}
            <button style={{ padding: '9px 12px', backgroundColor: 'var(--color-bg-soft)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', fontSize: '12px', cursor: 'pointer', borderRadius: '8px', fontWeight: '700' }}>
              Voucher
            </button>
          </div>
        )}
      </div>
    )
  }


  const loadGroupReviews = async (propertyId: string) => {
    setReviewsLoading(true)
    try {
      setGroupReviews(await fetchPropertyReviews(propertyId))
    } catch { /* noop */ } finally { setReviewsLoading(false) }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return
    setGroupError('')
    try {
      const g = await createPropertyGroup(newGroupName.trim(), fetchWithAuth)
      setGroups(prev => [g, ...prev])
      setNewGroupName('')
      setGroupSuccess('Group created!')
      setTimeout(() => setGroupSuccess(''), 2500)
    } catch { setGroupError('Failed to create group') }
  }

  const handleRenameGroup = async (groupId: string) => {
    if (!editingGroupName.trim()) return
    setGroupError('')
    try {
      const updated = await updatePropertyGroup(groupId, editingGroupName.trim(), fetchWithAuth)
      setGroups(prev => prev.map(g => g.id === groupId ? updated : g))
      setEditingGroupId(null)
      setGroupSuccess('Group renamed!')
      setTimeout(() => setGroupSuccess(''), 2500)
    } catch { setGroupError('Failed to rename group') }
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Delete this group? Properties won\'t be deleted.')) return
    setGroupError('')
    try {
      await deletePropertyGroup(groupId, fetchWithAuth)
      setGroups(prev => prev.filter(g => g.id !== groupId))
      if (expandedGroup === groupId) setExpandedGroup(null)
    } catch { setGroupError('Failed to delete group') }
  }

  const handleAddMember = async (groupId: string) => {
    if (!memberPropertyId) return
    setGroupError('')
    try {
      const updated = await addPropertyGroupMember(groupId, memberPropertyId, memberIsWhole, fetchWithAuth)
      setGroups(prev => prev.map(g => g.id === groupId ? updated : g))
      setAddingMemberGroupId(null)
      setMemberPropertyId('')
      setMemberIsWhole(false)
    } catch (e: unknown) {
      setGroupError(e instanceof Error ? e.message : 'Failed to add member')
    }
  }

  const handleRemoveMember = async (groupId: string, memberId: string) => {
    setGroupError('')
    try {
      const updated = await removePropertyGroupMember(groupId, memberId, fetchWithAuth)
      setGroups(prev => prev.map(g => g.id === groupId ? updated : g))
    } catch { setGroupError('Failed to remove member') }
  }

  const handleToggleWhole = async (groupId: string, memberId: string, current: boolean) => {
    try {
      const updated = await updatePropertyGroupMember(groupId, memberId, !current, fetchWithAuth)
      setGroups(prev => prev.map(g => g.id === groupId ? updated : g))
    } catch { setGroupError('Failed to update member') }
  }

  const handleAddReview = async (propertyId: string) => {
    if (!newReview.guest_name.trim()) return
    setAddingReview(true)
    try {
      const payload: CreateReviewPayload = {
        property_id: propertyId,
        guest_name: newReview.guest_name.trim(),
        rating: newReview.rating,
        comment: newReview.comment.trim() || undefined,
        platform: newReview.platform.trim() || undefined,
      }
      await createAdminReview(payload, fetchWithAuth)
      setNewReview({ guest_name: '', rating: 5, comment: '', platform: '' })
      await loadGroupReviews(propertyId)
    } catch { setGroupError('Failed to add review') }
    setAddingReview(false)
  }

  const handleDeleteReview = async (reviewId: string, propertyId: string) => {
    try {
      await deleteAdminReview(reviewId, fetchWithAuth)
      await loadGroupReviews(propertyId)
    } catch { setGroupError('Failed to delete review') }
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'properties', label: 'Properties' },
    { id: 'groups', label: 'Groups' },
    { id: 'ical', label: 'iCal Sync' },
    { id: 'events', label: 'Events' },
  ]

  const cardStyle = { backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px' }
  const buttonStyle = {
    border: '1px solid var(--color-gold)',
    backgroundColor: '#ffffff',
    color: 'var(--color-text-primary)',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '700' as const,
    letterSpacing: '1px',
    borderRadius: '8px',
    cursor: 'pointer',
    textTransform: 'uppercase' as const,
  }
  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'var(--color-gold)',
  }

  // Show spinner while checking session / redirecting
  if (loading || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-navbar)', padding: '32px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ color: 'var(--color-gold)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>Admin Panel</p>
            <h1 style={{ color: 'var(--color-text-primary)', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: '800' }}>
              Earthy Stays Dashboard
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => router.push('/')} style={buttonStyle} onMouseEnter={e => { const target = e.currentTarget as HTMLButtonElement; target.style.borderColor = 'var(--color-gold)'; target.style.color = 'var(--color-gold)' }} onMouseLeave={e => { const target = e.currentTarget as HTMLButtonElement; target.style.borderColor = 'var(--color-gold)'; target.style.color = 'var(--color-text-primary)' }}>
              View Site
            </button>
            <Link href="/admin/properties" style={{ ...primaryButtonStyle, display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
              + Add Property
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 24px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-gold)' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab.id ? 'var(--color-gold)' : 'var(--color-text-muted)',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? '700' : '500',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' }}>
              {[
                { label: 'Total Revenue', value: `&#8377;${totalRevenue.toLocaleString('en-IN')}`, color: 'var(--color-gold)' },
                { label: 'Confirmed Bookings', value: confirmedBookings, color: '#2E7D32' },
                { label: 'Pending Bookings', value: pendingBookings, color: '#F57F17' },
                { label: 'Total Properties', value: dashStats?.total_properties ?? apiProperties.length, color: '#1565C0' },
                { label: 'Completed Stays', value: completedBookings, color: '#6A1B9A' },
                { label: 'Total Bookings', value: totalBookingsCount, color: '#00838F' },
              ].map(stat => (
                <div key={stat.label} style={cardStyle}>
                  <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px', fontWeight: '600' }}>{stat.label}</p>
                  <p style={{ fontSize: '32px', color: stat.color, fontWeight: '800' }}
                    dangerouslySetInnerHTML={{ __html: String(stat.value) }}
                  />
                </div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div style={{ ...cardStyle, marginBottom: '16px', boxShadow: '0 8px 24px rgba(26,26,26,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '4px' }}>Recent Bookings</h2>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Latest confirmed and pending stays at a glance</p>
                </div>
                <button onClick={() => setActiveTab('bookings')} style={{ background: 'none', border: 'none', color: 'var(--color-gold)', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>
                  View All →
                </button>
              </div>
              <div className="hidden md:block" style={{ overflowX: 'auto' }}>
                <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                      {['Ref', 'Guest', 'Property', 'Dates', 'Amount', 'Status'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '700' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 4).map((booking, i) => {
                      const property = getProperty(booking.property_id)
                      return (
                        <tr key={booking.id} style={{ borderBottom: '1px solid var(--color-bg-soft)', backgroundColor: i % 2 === 0 ? '#ffffff' : 'var(--color-bg-card)' }}>
                          <td data-label="Ref" style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--color-gold)', fontWeight: '700' }}>{booking.booking_ref}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div className="responsive-table-label">Guest</div>
                            <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '700', marginBottom: '2px' }}>{booking.guest_name}</p>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{booking.guest_email}</p>
                          </td>
                          <td data-label="Property" style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>{property?.name}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div className="responsive-table-label">Dates</div>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{formatDate(booking.check_in)}</p>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>to {formatDate(booking.check_out)}</p>
                          </td>
                          <td data-label="Amount" style={{ padding: '14px 16px', fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '700' }}>&#8377;{booking.total.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div className="responsive-table-label">Status</div>
                            <span style={{ backgroundColor: statusColors[booking.status]?.bg, color: statusColors[booking.status]?.color, padding: '4px 10px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', borderRadius: '6px' }}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {bookings.slice(0, 4).map(booking => renderBookingCard(booking))}
              </div>
            </div>

            {/* Properties Summary */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-primary)' }}>Properties</h2>
                <button onClick={() => setActiveTab('properties')} style={{ background: 'none', border: 'none', color: 'var(--color-gold)', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>
                  Manage All →
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {(apiProperties.slice(0, 3) || []).map(property => (
                  <div key={property.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '16px', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    {(() => {
                      const src = property.images.find(i => i.is_primary)?.image_url || property.images[0]?.image_url
                      if (src) return <Image src={src} alt={property.name} width={64} height={48} style={{ width: '64px', height: '48px', objectFit: 'cover', flexShrink: 0, borderRadius: '6px' }} />
                      return <div style={{ width: 64, height: 48, borderRadius: 6, backgroundColor: 'var(--color-bg-card)' }} />
                    })()}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '700', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>&#8377;{property.price_per_night.toLocaleString('en-IN')}/night · &#9733;{property.avg_rating}</p>
                    </div>
                    <span style={{ fontSize: '11px', backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '3px 8px', fontWeight: '700', flexShrink: 0, borderRadius: '6px' }}>Live</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            {/* Voucher Modal */}
            {voucherBooking && (
              <div onClick={() => setVoucherBooking(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '36px', maxWidth: '520px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                      <p style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '700', marginBottom: '6px' }}>Booking Voucher</p>
                      <p style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-gold)' }}>{voucherBooking.booking_ref}</p>
                    </div>
                    <button onClick={() => setVoucherBooking(null)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1 }}>×</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { label: 'Guest', value: voucherBooking.guest_name },
                      { label: 'Email', value: voucherBooking.guest_email },
                      { label: 'Phone', value: voucherBooking.guest_phone || '—' },
                      { label: 'Property', value: getProperty(voucherBooking.property_id)?.name || '—' },
                      { label: 'Check In', value: formatDate(voucherBooking.check_in) },
                      { label: 'Check Out', value: formatDate(voucherBooking.check_out) },
                      { label: 'Guests', value: String(voucherBooking.guests) },
                      { label: 'Pets', value: String(voucherBooking.pets || 0) },
                      { label: 'Nights', value: String(voucherBooking.nights) },
                      { label: 'Status', value: voucherBooking.status.toUpperCase() },
                    ].map(row => (
                      <div key={row.label} style={{ padding: '10px 14px', backgroundColor: 'var(--color-bg-card)', borderRadius: '8px' }}>
                        <p style={{ fontSize: '10px', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '700', marginBottom: '4px' }}>{row.label}</p>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '600' }}>{row.value}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginBottom: '2px' }}>Total Amount</p>
                      <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text-primary)' }}>&#8377;{voucherBooking.total.toLocaleString('en-IN')}</p>
                    </div>
                    <button onClick={() => window.print()} style={{ padding: '10px 20px', backgroundColor: 'var(--color-gold)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>🖨 Print</button>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by guest name, email or booking ref..."
                value={searchBooking}
                onChange={e => handleBookingSearch(e.target.value)}
                style={{ flex: 1, minWidth: 0, padding: '12px 16px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', color: 'var(--color-text-primary)', outline: 'none', backgroundColor: '#ffffff' }}
              />
              <select
                value={statusFilter}
                onChange={e => handleStatusFilter(e.target.value)}
                style={{ padding: '12px 16px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', color: 'var(--color-text-primary)', outline: 'none', backgroundColor: '#ffffff', cursor: 'pointer' }}
              >
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
              {bookingsLoading ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>Loading bookings…</div>
              ) : (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: 'var(--color-navbar)' }}>
                          {['Ref', 'Guest', 'Property', 'Check In', 'Check Out', 'Guests', 'Amount', 'Status', 'Actions'].map(h => (
                            <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: '700', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((booking, i) => {
                          const property = getProperty(booking.property_id)
                          return (
                            <tr key={booking.id} style={{ borderBottom: '1px solid var(--color-bg-soft)', backgroundColor: i % 2 === 0 ? '#ffffff' : 'var(--color-bg-card)' }}>
                              <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--color-gold)', fontWeight: '700', whiteSpace: 'nowrap' }}>{booking.booking_ref}</td>
                              <td style={{ padding: '14px 16px' }}>
                                <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '700', marginBottom: '2px', whiteSpace: 'nowrap' }}>{booking.guest_name}</p>
                                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{booking.guest_phone}</p>
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{property?.name || '—'}</td>
                              <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(booking.check_in)}</td>
                              <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(booking.check_out)}</td>
                              <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                                {booking.guests}{(booking.pets || 0) > 0 ? ` + ${booking.pets} pet${booking.pets > 1 ? 's' : ''}` : ''}
                              </td>
                              <td style={{ padding: '14px 16px', fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '700', whiteSpace: 'nowrap' }}>&#8377;{booking.total.toLocaleString('en-IN')}</td>
                              <td style={{ padding: '14px 16px' }}>
                                <span style={{ backgroundColor: statusColors[booking.status]?.bg, color: statusColors[booking.status]?.color, padding: '4px 10px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap', borderRadius: '6px' }}>
                                  {booking.status}
                                </span>
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  {booking.status === 'pending' && (
                                    <>
                                      <button onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')} style={{ padding: '6px 10px', backgroundColor: '#E8F5E9', color: '#2E7D32', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '700', borderRadius: '6px' }}>Confirm</button>
                                      <button onClick={() => handleCancelWithRefund(booking)} style={{ padding: '6px 10px', backgroundColor: '#FFEBEE', color: '#C62828', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '700', borderRadius: '6px' }}>
                                        {(booking as AdminBooking & { payment_status?: string }).payment_status === 'paid' ? 'Cancel+Refund' : 'Cancel'}
                                      </button>
                                    </>
                                  )}
                                  {booking.status === 'confirmed' && (
                                    <button onClick={() => handleUpdateBookingStatus(booking.id, 'completed')} style={{ padding: '6px 10px', backgroundColor: '#E3F2FD', color: '#1565C0', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '700', borderRadius: '6px' }}>Complete</button>
                                  )}
                                  <button onClick={() => setVoucherBooking(booking)} style={{ padding: '6px 10px', backgroundColor: 'var(--color-bg-soft)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', fontSize: '12px', cursor: 'pointer', borderRadius: '6px', fontWeight: '600' }}>Voucher</button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {bookings.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-text-muted)' }}>No bookings found</div>
                  )}

                  {/* Pagination */}
                  {bookingsTotal > BOOKINGS_PER_PAGE && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: '12px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                        Showing {((bookingsPage - 1) * BOOKINGS_PER_PAGE) + 1}–{Math.min(bookingsPage * BOOKINGS_PER_PAGE, bookingsTotal)} of {bookingsTotal} bookings
                      </p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          disabled={bookingsPage <= 1}
                          onClick={() => loadBookings(bookingsPage - 1, searchBooking, statusFilter)}
                          style={{ padding: '8px 16px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#fff', cursor: bookingsPage <= 1 ? 'not-allowed' : 'pointer', opacity: bookingsPage <= 1 ? 0.4 : 1, fontSize: '13px', fontWeight: '600' }}
                        >← Prev</button>
                        <span style={{ padding: '8px 14px', fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Page {bookingsPage} of {Math.ceil(bookingsTotal / BOOKINGS_PER_PAGE)}</span>
                        <button
                          disabled={bookingsPage >= Math.ceil(bookingsTotal / BOOKINGS_PER_PAGE)}
                          onClick={() => loadBookings(bookingsPage + 1, searchBooking, statusFilter)}
                          style={{ padding: '8px 16px', border: '1px solid var(--color-border)', borderRadius: '8px', backgroundColor: '#fff', cursor: bookingsPage >= Math.ceil(bookingsTotal / BOOKINGS_PER_PAGE) ? 'not-allowed' : 'pointer', opacity: bookingsPage >= Math.ceil(bookingsTotal / BOOKINGS_PER_PAGE) ? 0.4 : 1, fontSize: '13px', fontWeight: '600' }}>Next →</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <button onClick={() => router.push('/admin/properties')} style={primaryButtonStyle}>
                + Add New Property
              </button>
            </div>

            {E2E_SKIP_AUTH && (
              <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '700', marginBottom: '4px' }}>E2E Seed</p>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{E2E_SEED_PROPERTY.name}</h3>
                </div>
                <Link href={`/properties/${E2E_SEED_PROPERTY.id}`} style={{ ...buttonStyle, display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>
                  View
                </Link>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {propertiesForDisplay.map(property => {
                const thumbSrc = property.images?.find(i => i.is_primary)?.image_url || property.images?.[0]?.image_url
                return (
                  <div key={property.id} style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {thumbSrc
                      ? <Image src={thumbSrc} alt={property.name} width={120} height={90} style={{ width: '120px', height: '90px', objectFit: 'cover', flexShrink: 0, borderRadius: '8px' }} />
                      : <div style={{ width: 120, height: 90, borderRadius: 8, backgroundColor: 'var(--color-bg-card)', flexShrink: 0 }} />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{property.name}</h3>
                        <span style={{
                          backgroundColor: property.is_published ? '#E8F5E9' : '#FFF8E7',
                          color: property.is_published ? '#2E7D32' : '#F57F17',
                          padding: '3px 10px', fontSize: '11px', fontWeight: '700', borderRadius: '6px'
                        }}>{property.is_published ? 'Published' : 'Draft'}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>{property.city}, {property.state}</p>
                      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        {[
                          `${property.bedrooms} beds`, `${property.bathrooms} baths`,
                          `${property.max_guests} guests`, `★ ${property.avg_rating}`,
                          `${property.review_count} reviews`, property.pets_allowed ? 'Pet friendly' : 'No pets',
                        ].map(label => (
                          <span key={label} style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>{label}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '22px', color: 'var(--color-text-primary)', fontWeight: '800', marginBottom: '4px' }}>&#8377;{property.price_per_night.toLocaleString('en-IN')}</p>
                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>per night</p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setCalendarProperty({ id: property.id, name: property.name })}
                          title="View & manage calendar"
                          style={{ padding: '8px 14px', border: '1px solid #3d3425', borderRadius: '8px', backgroundColor: '#1a1611', color: '#c9a84c', fontSize: '14px', cursor: 'pointer' }}
                        >📅 Calendar</button>
                        <button onClick={() => router.push(`/admin/properties?id=${property.id}`)} style={buttonStyle}>Edit</button>
                        <Link href={`/properties/${property.id}`} style={{ ...buttonStyle, display: 'inline-block', textDecoration: 'none', textAlign: 'center' }}>View</Link>
                        <button onClick={() => handleDeleteProperty(property.id, property.name)} style={{ padding: '8px 16px', border: '1px solid #FFCDD2', borderRadius: '8px', backgroundColor: '#FFEBEE', color: '#C62828', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>Delete</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === 'groups' && (
          <div>
            {groupError && (
              <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: '#FFEBEE', borderRadius: '8px', color: '#C62828', fontSize: '14px', fontWeight: '600' }}>{groupError}<button onClick={() => setGroupError('')} style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontWeight: '800' }}>×</button></div>
            )}
            {groupSuccess && (
              <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: '#E8F5E9', borderRadius: '8px', color: '#2E7D32', fontSize: '14px', fontWeight: '600' }}>{groupSuccess}</div>
            )}

            {/* Create Group */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 8px 24px rgba(26,26,26,0.04)' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '4px' }}>Property Groups</h2>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '20px' }}>Group sub-properties together. One property must be the &quot;Whole Property&quot; — it acts as the master for shared amenities, house rules, and reviews.</p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  id="new-group-name"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreateGroup()}
                  placeholder="Group name (e.g. Earthy Villa Estate)"
                  style={{ flex: 1, minWidth: '200px', padding: '12px 16px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', outline: 'none', color: 'var(--color-text-primary)' }}
                />
                <button
                  onClick={handleCreateGroup}
                  style={{ padding: '12px 24px', backgroundColor: 'var(--color-gold)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', letterSpacing: '0.5px' }}
                >
                  + Create Group
                </button>
              </div>
            </div>

            {/* Groups List */}
            {groupsLoading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>Loading groups…</div>
            ) : groups.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏘️</div>
                <p style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>No groups yet</p>
                <p style={{ fontSize: '13px' }}>Create your first group above to group sub-properties</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {groups.map(group => {
                  const isExpanded = expandedGroup === group.id
                  const isEditingName = editingGroupId === group.id
                  const masterMember = group.members.find(m => m.is_whole_property)
                  const isShowingReviews = reviewsGroupId === group.id

                  return (
                    <div key={group.id} style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '14px', boxShadow: '0 8px 24px rgba(26,26,26,0.04)', overflow: 'hidden' }}>
                      {/* Group header */}
                      <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap', cursor: 'pointer' }} onClick={() => setExpandedGroup(isExpanded ? null : group.id)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '20px' }}>🏘️</span>
                          {isEditingName ? (
                            <input
                              autoFocus
                              value={editingGroupName}
                              onChange={e => setEditingGroupName(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleRenameGroup(group.id); if (e.key === 'Escape') setEditingGroupId(null) }}
                              onClick={e => e.stopPropagation()}
                              style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--color-gold)', borderRadius: '6px', fontSize: '16px', fontWeight: '700', outline: 'none' }}
                            />
                          ) : (
                            <div>
                              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '2px' }}>{group.name}</h3>
                              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{group.members.length} propert{group.members.length === 1 ? 'y' : 'ies'} · {masterMember ? `Master: ${masterMember.property.name}` : 'No master set'}</p>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                          {isEditingName ? (
                            <>
                              <button onClick={() => handleRenameGroup(group.id)} style={{ padding: '7px 14px', backgroundColor: 'var(--color-gold)', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}>Save</button>
                              <button onClick={() => setEditingGroupId(null)} style={{ padding: '7px 14px', backgroundColor: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setEditingGroupId(group.id); setEditingGroupName(group.name) }} style={{ padding: '7px 14px', backgroundColor: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>Rename</button>
                              <button onClick={() => handleDeleteGroup(group.id)} style={{ padding: '7px 14px', backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: '#C62828' }}>Delete</button>
                              <span style={{ color: 'var(--color-text-muted)', fontSize: '18px' }}>{isExpanded ? '▲' : '▼'}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expanded panel */}
                      {isExpanded && (
                        <div style={{ borderTop: '1px solid var(--color-border)', padding: '20px 24px', backgroundColor: 'var(--color-bg-card)' }}>
                          {/* Members */}
                          <h4 style={{ fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '12px', fontWeight: '700' }}>Members</h4>
                          {group.members.length === 0 ? (
                            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>No properties in this group yet.</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                              {group.members.map(member => (
                                <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                    <span style={{ fontSize: '16px' }}>{member.is_whole_property ? '🏠' : '🛏️'}</span>
                                    <div style={{ minWidth: 0 }}>
                                      <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{member.property.name}</p>
                                      <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{member.property.city}, {member.property.state} · {member.is_whole_property ? <strong>Whole Property</strong> : 'Sub-property'}</p>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                                    <button onClick={() => handleToggleWhole(group.id, member.id, member.is_whole_property)} style={{ padding: '6px 12px', backgroundColor: member.is_whole_property ? '#E3F2FD' : 'var(--color-bg-soft)', border: `1px solid ${member.is_whole_property ? '#90CAF9' : 'var(--color-border)'}`, borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: member.is_whole_property ? '#1565C0' : 'var(--color-text-secondary)' }}>{member.is_whole_property ? 'Unset Master' : 'Set as Master'}</button>
                                    <button onClick={() => handleRemoveMember(group.id, member.id)} style={{ padding: '6px 12px', backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#C62828' }}>Remove</button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add member */}
                          {addingMemberGroupId === group.id ? (
                            <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                              <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '12px' }}>Add Property to Group</h5>
                              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                  <label style={{ fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block', fontWeight: '700' }}>Property</label>
                                  <select
                                    value={memberPropertyId}
                                    onChange={e => setMemberPropertyId(e.target.value)}
                                    style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}
                                  >
                                    <option value="">Select a property…</option>
                                    {apiProperties.map(p => (
                                      <option key={p.id} value={p.id}>{p.name} — {p.city}</option>
                                    ))}
                                  </select>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '600', cursor: 'pointer', paddingBottom: '10px' }}>
                                  <input type="checkbox" checked={memberIsWhole} onChange={e => setMemberIsWhole(e.target.checked)} />
                                  Whole Property (master)
                                </label>
                                <button onClick={() => handleAddMember(group.id)} style={{ padding: '10px 20px', backgroundColor: 'var(--color-gold)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer' }}>Add</button>
                                <button onClick={() => { setAddingMemberGroupId(null); setMemberPropertyId(''); setMemberIsWhole(false) }} style={{ padding: '10px 20px', backgroundColor: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <button onClick={() => { setAddingMemberGroupId(group.id); setGroupError('') }} style={{ padding: '9px 18px', backgroundColor: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>+ Add Property</button>
                          )}

                          {/* Reviews section */}
                          <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                              <h4 style={{ fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-gold)', fontWeight: '700' }}>Reviews (Shared across group)</h4>
                              {!isShowingReviews ? (
                                <button onClick={() => { setReviewsGroupId(group.id); if (masterMember) loadGroupReviews(masterMember.property_id) }} style={{ padding: '7px 14px', backgroundColor: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>Manage Reviews</button>
                              ) : (
                                <button onClick={() => setReviewsGroupId(null)} style={{ padding: '7px 14px', backgroundColor: 'var(--color-bg-soft)', border: '1px solid var(--color-border)', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>Close</button>
                              )}
                            </div>

                            {isShowingReviews && (
                              <div>
                                {/* Add review form */}
                                <div style={{ backgroundColor: '#f9f8f5', border: '1px solid var(--color-border)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
                                  <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '12px' }}>Add External Review</h5>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                                    <div>
                                      <label style={{ fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block', fontWeight: '700' }}>Guest Name *</label>
                                      <input value={newReview.guest_name} onChange={e => setNewReview(r => ({ ...r, guest_name: e.target.value }))} placeholder="Jane Doe" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' as const }} />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block', fontWeight: '700' }}>Platform</label>
                                      <input value={newReview.platform} onChange={e => setNewReview(r => ({ ...r, platform: e.target.value }))} placeholder="Airbnb / Booking.com" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fff', boxSizing: 'border-box' as const }} />
                                    </div>
                                    <div>
                                      <label style={{ fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block', fontWeight: '700' }}>Rating</label>
                                      <select value={newReview.rating} onChange={e => setNewReview(r => ({ ...r, rating: parseInt(e.target.value) }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fff', cursor: 'pointer' }}>
                                        {[5,4,3,2,1].map(n => <option key={n} value={n}>{'★'.repeat(n)} ({n}/5)</option>)}
                                      </select>
                                    </div>
                                  </div>
                                  <div style={{ marginBottom: '12px' }}>
                                    <label style={{ fontSize: '11px', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '6px', display: 'block', fontWeight: '700' }}>Comment</label>
                                    <textarea value={newReview.comment} onChange={e => setNewReview(r => ({ ...r, comment: e.target.value }))} rows={3} placeholder="What did the guest say?" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '14px', outline: 'none', backgroundColor: '#fff', resize: 'vertical', boxSizing: 'border-box' as const }} />
                                  </div>
                                  {masterMember && (
                                    <button disabled={addingReview || !newReview.guest_name.trim()} onClick={() => handleAddReview(masterMember!.property_id)} style={{ padding: '10px 24px', backgroundColor: addingReview ? '#ccc' : 'var(--color-gold)', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: addingReview ? 'not-allowed' : 'pointer' }}>
                                      {addingReview ? 'Adding…' : '+ Add Review'}
                                    </button>
                                  )}
                                  {!masterMember && <p style={{ fontSize: '13px', color: '#C62828' }}>Set a master (Whole Property) first to add reviews.</p>}
                                </div>

                                {/* Reviews list */}
                                {reviewsLoading ? (
                                  <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>Loading reviews…</p>
                                ) : groupReviews.length === 0 ? (
                                  <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No reviews yet for this group.</p>
                                ) : (
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {groupReviews.map(review => (
                                      <div key={review.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{review.guest_name}</p>
                                            {review.platform && <span style={{ fontSize: '11px', backgroundColor: '#E3F2FD', color: '#1565C0', padding: '2px 8px', borderRadius: '999px', fontWeight: '700' }}>{review.platform}</span>}
                                            <span style={{ color: 'var(--color-gold)', fontSize: '14px' }}>{'★'.repeat(review.rating)}</span>
                                          </div>
                                          {review.comment && <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{review.comment}</p>}
                                          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                        <button onClick={() => masterMember && handleDeleteReview(review.id, masterMember!.property_id)} style={{ padding: '6px 12px', backgroundColor: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', color: '#C62828', flexShrink: 0 }}>Delete</button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* iCal Tab */}
        {activeTab === 'ical' && (
          <div>
            <div style={{ ...cardStyle, marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '8px' }}>iCal Calendar Sync</h2>
              <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-gold)', marginBottom: '16px' }} />
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '1.7', maxWidth: '760px' }}>
                Keep your availability in sync across all platforms. Import calendars from Airbnb or Booking.com to block those dates here automatically. Export your calendar link to paste into other platforms.
              </p>
            </div>

            {(apiProperties || []).map(property => {
              const exportUrl = getICalExportUrl(property.id)
              const propLinks = icalLinks[property.id] || []
              const input = icalInputs[property.id] || { name: '', url: '' }
              const thumbSrc = property.images?.find(i => i.is_primary)?.image_url || property.images?.[0]?.image_url
              return (
                <div key={property.id} style={{ ...cardStyle, marginBottom: '16px', boxShadow: '0 8px 24px rgba(26,26,26,0.04)' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {thumbSrc
                      ? <Image src={thumbSrc} alt={property.name} width={60} height={45} style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                      : <div style={{ width: 60, height: 45, borderRadius: 8, backgroundColor: 'var(--color-bg-card)', flexShrink: 0 }} />
                    }
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{property.name}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{property.city}, {property.state}</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {/* Export */}
                    <div style={{ padding: '20px', backgroundColor: '#f0f7f0', border: '1px solid #C8E6C9', borderRadius: '12px' }}>
                      <h4 style={{ fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#2E7D32', marginBottom: '8px', fontWeight: '700' }}>Export Calendar</h4>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px', lineHeight: '1.5' }}>
                        Copy this link and paste it into Airbnb, Booking.com or any other platform to sync your availability.
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <input readOnly value={exportUrl} style={{ flex: 1, padding: '10px 12px', border: '1px solid #C8E6C9', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-secondary)', backgroundColor: '#ffffff', outline: 'none' }} />
                        <button
                          onClick={() => handleCopyIcal(property.id, exportUrl)}
                          style={{ padding: '10px 16px', backgroundColor: icalCopied[property.id] ? '#4CAF50' : '#2E7D32', color: '#ffffff', border: 'none', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '700', borderRadius: '8px', transition: 'background 0.3s' }}
                        >{icalCopied[property.id] ? '✓ Copied!' : 'Copy'}</button>
                      </div>
                    </div>

                    {/* Import */}
                    <div style={{ padding: '20px', backgroundColor: '#E3F2FD', border: '1px solid #BBDEFB', borderRadius: '12px' }}>
                      <h4 style={{ fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#1565C0', marginBottom: '8px', fontWeight: '700' }}>Import Calendar</h4>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px', lineHeight: '1.5' }}>
                        Paste a calendar link from Airbnb or Booking.com to automatically block those dates here.
                      </p>
                      <input
                        placeholder="Name (e.g. Airbnb)"
                        value={input.name}
                        onChange={e => setIcalInputs(prev => ({ ...prev, [property.id]: { ...input, name: e.target.value } }))}
                        style={{ width: '100%', padding: '10px 12px', border: '1px solid #BBDEFB', borderRadius: '8px', fontSize: '12px', backgroundColor: '#ffffff', outline: 'none', marginBottom: '8px', boxSizing: 'border-box' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <input
                          placeholder="Paste .ics URL here..."
                          value={input.url}
                          onChange={e => setIcalInputs(prev => ({ ...prev, [property.id]: { ...input, url: e.target.value } }))}
                          style={{ flex: 1, padding: '10px 12px', border: '1px solid #BBDEFB', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-secondary)', backgroundColor: '#ffffff', outline: 'none' }}
                        />
                        <button
                          disabled={!input.url?.trim() || icalSaving[property.id]}
                          onClick={() => handleIcalSync(property.id)}
                          style={{ padding: '10px 16px', backgroundColor: '#1565C0', color: '#ffffff', border: 'none', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '700', borderRadius: '8px', opacity: !input.url?.trim() ? 0.5 : 1 }}
                        >{icalSaving[property.id] ? 'Saving…' : 'Sync'}</button>
                      </div>
                    </div>
                  </div>

                  {/* Connected Calendars */}
                  <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f9f8f5', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <p style={{ fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '12px', fontWeight: '700' }}>Connected Calendars</p>
                    {propLinks.length === 0 ? (
                      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No calendars connected yet. Paste an import link above to get started.</p>
                    ) : (
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {propLinks.map(link => (
                          <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '999px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: link.direction === 'import' ? '#1565C0' : '#2E7D32' }} />
                            <span style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontWeight: '600' }}>{link.calendar_name}</span>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{link.direction}</span>
                            {link.last_synced && <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>· synced {new Date(link.last_synced).toLocaleDateString('en-IN')}</span>}
                            <button onClick={() => handleIcalDelete(property.id, link.id)} style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: '15px', lineHeight: 1, fontWeight: '700', padding: '0 2px' }}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            <div style={{ ...cardStyle, marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '8px' }}>Event Inquiry Requests</h2>
              <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-gold)', marginBottom: '16px' }} />
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '1.7', maxWidth: '760px' }}>
                View and manage wedding, corporate, and private event requests submitted by guests.
              </p>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                placeholder="Search by name, email, hotel, city..."
                value={eventsSearch}
                onChange={e => handleEventsSearch(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  flex: 1,
                  minWidth: '240px',
                }}
              />
              <select
                value={eventsStatusFilter}
                onChange={e => handleEventsStatusFilter(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '1px solid var(--color-border)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  minWidth: '160px',
                }}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* List */}
            {eventsLoading ? (
              <div style={{ textAlign: 'center', padding: '48px 0' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            ) : events.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '64px 24px', color: 'var(--color-text-muted)' }}>
                <p style={{ fontSize: '16px' }}>No event inquiries found matching filters.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {events.map(ev => (
                  <div key={ev.id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <span style={{
                          backgroundColor: ev.nature_of_event === 'Wedding' ? '#FCE4EC' : ev.nature_of_event === 'Corporate' ? '#E8EAF6' : '#F5F5F5',
                          color: ev.nature_of_event === 'Wedding' ? '#C2185B' : ev.nature_of_event === 'Corporate' ? '#3F51B5' : '#616161',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          borderRadius: '4px',
                          letterSpacing: '0.5px',
                        }}>
                          {ev.nature_of_event}
                        </span>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginTop: '8px', color: 'var(--color-text-primary)' }}>
                          {ev.name}
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          ✉ {ev.email} &bull; 📞 {ev.phone}
                        </p>
                      </div>

                      {/* Status badges & actions */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{
                          backgroundColor:
                            ev.status === 'confirmed' ? '#E8F5E9' :
                            ev.status === 'contacted' ? '#E3F2FD' :
                            ev.status === 'pending' ? '#FFF8E7' : '#FFEBEE',
                          color:
                            ev.status === 'confirmed' ? '#2E7D32' :
                            ev.status === 'contacted' ? '#1565C0' :
                            ev.status === 'pending' ? '#F57F17' : '#C62828',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '700',
                          borderRadius: '6px',
                          textTransform: 'capitalize',
                        }}>
                          {ev.status}
                        </span>

                        {ev.status !== 'confirmed' && ev.status !== 'cancelled' && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {ev.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateEventStatus(ev.id, 'contacted')}
                                style={{ ...buttonStyle, padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
                              >
                                Mark Contacted
                              </button>
                            )}
                            <button
                              onClick={() => handleUpdateEventStatus(ev.id, 'confirmed')}
                              style={{ ...buttonStyle, padding: '6px 12px', fontSize: '12px', cursor: 'pointer', backgroundColor: 'var(--color-gold)', border: 'none', fontWeight: '700' }}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => handleUpdateEventStatus(ev.id, 'cancelled')}
                              style={{ ...buttonStyle, padding: '6px 12px', fontSize: '12px', cursor: 'pointer', borderColor: '#C62828', color: '#C62828' }}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '16px' }}>
                      <div>
                        <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '2px', fontWeight: '600' }}>Destination / Hotel</p>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>{ev.destination} - {ev.hotel}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '2px', fontWeight: '600' }}>Dates</p>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{formatDate(ev.event_start_date)} to {formatDate(ev.event_end_date)}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '2px', fontWeight: '600' }}>Guests / Rooms</p>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
                          👤 {ev.no_of_guests} guests {ev.requires_rooms ? `& 🛌 ${ev.no_of_rooms} rooms` : '(No rooms)'}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '2px', fontWeight: '600' }}>Submitted On</p>
                        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{formatDate(ev.created_at)}</p>
                      </div>
                    </div>

                    {ev.additional_details && (
                      <div style={{ backgroundColor: 'var(--color-bg-soft)', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: 'var(--color-text-secondary)', borderLeft: '3px solid var(--color-gold)' }}>
                        <p style={{ fontWeight: '600', marginBottom: '4px', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Additional Details</p>
                        <p style={{ whiteSpace: 'pre-line' }}>{ev.additional_details}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Admin Calendar Modal — opened by clicking 📅 Calendar on any property card */}
      {calendarProperty && (
        <CalendarModal
          propertyId={calendarProperty.id}
          propertyName={calendarProperty.name}
          onClose={() => setCalendarProperty(null)}
          fetchWithAuth={fetchWithAuth}
        />
      )}
    </div>
  )
}
