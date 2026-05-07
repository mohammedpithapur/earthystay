'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { dummyProperties } from '@/lib/data/properties'

const dummyBookings = [
  { id: "BK001", booking_ref: "ES-ABC123", property_id: "1", guest_name: "Mohammed Pithapur", guest_email: "mohammed@example.com", guest_phone: "+91 98765 43210", check_in: "2026-06-15", check_out: "2026-06-18", guests: 4, num_pets: 1, nights: 3, total_price: 28000, status: "confirmed", payment_status: "paid", created_at: "2026-05-01" },
  { id: "BK002", booking_ref: "ES-DEF456", property_id: "3", guest_name: "Priya Sharma", guest_email: "priya@example.com", guest_phone: "+91 98765 11111", check_in: "2026-07-20", check_out: "2026-07-22", guests: 2, num_pets: 0, nights: 2, total_price: 25500, status: "confirmed", payment_status: "paid", created_at: "2026-05-03" },
  { id: "BK003", booking_ref: "ES-GHI789", property_id: "2", guest_name: "Rahul Mehta", guest_email: "rahul@example.com", guest_phone: "+91 98765 22222", check_in: "2026-03-10", check_out: "2026-03-13", guests: 3, num_pets: 0, nights: 3, total_price: 20300, status: "completed", payment_status: "paid", created_at: "2026-02-15" },
  { id: "BK004", booking_ref: "ES-JKL012", property_id: "5", guest_name: "Anjali Kumar", guest_email: "anjali@example.com", guest_phone: "+91 98765 33333", check_in: "2026-08-05", check_out: "2026-08-08", guests: 6, num_pets: 0, nights: 3, total_price: 29700, status: "pending", payment_status: "pending", created_at: "2026-05-05" },
]

const statusColors: Record<string, { bg: string, color: string }> = {
  confirmed: { bg: '#E8F5E9', color: '#2E7D32' },
  pending: { bg: '#FFF8E7', color: '#F57F17' },
  completed: { bg: '#E3F2FD', color: '#1565C0' },
  cancelled: { bg: '#FFEBEE', color: '#C62828' },
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchBooking, setSearchBooking] = useState('')
  const [bookings, setBookings] = useState(dummyBookings)

  const totalRevenue = bookings.filter(b => b.payment_status === 'paid').reduce((acc, b) => acc + b.total_price, 0)
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length
  const pendingBookings = bookings.filter(b => b.status === 'pending').length
  const completedBookings = bookings.filter(b => b.status === 'completed').length

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

  const filteredBookings = bookings.filter(b =>
    b.guest_name.toLowerCase().includes(searchBooking.toLowerCase()) ||
    b.booking_ref.toLowerCase().includes(searchBooking.toLowerCase()) ||
    b.guest_email.toLowerCase().includes(searchBooking.toLowerCase())
  )

  const updateBookingStatus = (id: string, status: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const getProperty = (id: string) => dummyProperties.find(p => p.id === id)

  const renderBookingCard = (booking: typeof dummyBookings[number], showActions = false) => {
    const property = getProperty(booking.property_id)
    if (!property) return null

    return (
      <div key={booking.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e0d9c0', borderRadius: '14px', padding: '18px', boxShadow: '0 8px 24px rgba(26,26,26,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '14px' }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '10px', letterSpacing: '1.4px', textTransform: 'uppercase', color: '#888', fontWeight: '700', marginBottom: '4px' }}>Booking Ref</p>
            <p style={{ fontSize: '14px', color: '#e1c391', fontWeight: '800' }}>{booking.booking_ref}</p>
          </div>
          <span style={{ backgroundColor: statusColors[booking.status]?.bg, color: statusColors[booking.status]?.color, padding: '5px 10px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', borderRadius: '999px', letterSpacing: '0.6px', flexShrink: 0 }}>
            {booking.status}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <Image
            src={property.images.find(i => i.is_primary)?.image_url || property.images[0]?.image_url}
            alt={property.name}
            width={72}
            height={72}
            style={{ width: '72px', height: '72px', objectFit: 'cover', flexShrink: 0, borderRadius: '12px' }}
          />
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#1a1a1a', marginBottom: '4px' }}>{property.name}</h3>
            <p style={{ fontSize: '13px', color: '#888' }}>{booking.guest_name}</p>
            <p style={{ fontSize: '12px', color: '#888' }}>{property.city}, {property.state}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', marginBottom: '14px' }}>
          {[
            { label: 'Check In', value: formatDate(booking.check_in) },
            { label: 'Check Out', value: formatDate(booking.check_out) },
            { label: 'Guests', value: `${booking.guests}${booking.num_pets > 0 ? ` + ${booking.num_pets} pet${booking.num_pets > 1 ? 's' : ''}` : ''}` },
            { label: 'Amount', value: `₹${booking.total_price.toLocaleString('en-IN')}` },
          ].map(detail => (
            <div key={detail.label} style={{ backgroundColor: '#fafaf8', border: '1px solid #f0ead8', borderRadius: '10px', padding: '10px 12px' }}>
              <p style={{ fontSize: '10px', letterSpacing: '1.2px', textTransform: 'uppercase', color: '#888', fontWeight: '700', marginBottom: '4px' }}>{detail.label}</p>
              <p style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: '700', lineHeight: '1.35' }}>{detail.value}</p>
            </div>
          ))}
        </div>

        {showActions && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {booking.status === 'pending' && (
              <>
                <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} style={{ padding: '9px 12px', backgroundColor: '#E8F5E9', color: '#2E7D32', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '800', borderRadius: '8px' }}>
                  Confirm
                </button>
                <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} style={{ padding: '9px 12px', backgroundColor: '#FFEBEE', color: '#C62828', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '800', borderRadius: '8px' }}>
                  Cancel
                </button>
              </>
            )}
            {booking.status === 'confirmed' && (
              <button onClick={() => updateBookingStatus(booking.id, 'completed')} style={{ padding: '9px 12px', backgroundColor: '#E3F2FD', color: '#1565C0', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '800', borderRadius: '8px' }}>
                Complete
              </button>
            )}
            <button style={{ padding: '9px 12px', backgroundColor: '#f5f2eb', color: '#555', border: '1px solid #e0d9c0', fontSize: '12px', cursor: 'pointer', borderRadius: '8px', fontWeight: '700' }}>
              Voucher
            </button>
          </div>
        )}
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'properties', label: 'Properties' },
    { id: 'ical', label: 'iCal Sync' },
  ]

  const cardStyle = { backgroundColor: '#ffffff', border: '1px solid #e0d9c0', borderRadius: '12px', padding: '24px' }

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ backgroundColor: 'var(--color-navbar)', padding: '32px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ color: '#e1c391', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>Admin Panel</p>
            <h1 style={{ color: '#1a1a1a', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: '800' }}>
              Earthy Stay Dashboard
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/" style={{ border: '1px solid var(--color-navbar-border)', color: 'var(--color-navbar-text)', padding: '10px 20px', fontSize: '13px', textDecoration: 'none', letterSpacing: '1px', borderRadius: '8px', fontWeight: '600' }}>
              View Site
            </Link>
            <button style={{ backgroundColor: '#e1c391', color: '#1a1a1a', border: 'none', padding: '10px 20px', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer', borderRadius: '8px' }}>
              + Add Property
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0d9c0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 24px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #e1c391' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab.id ? '#e1c391' : '#888',
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
                { label: 'Total Revenue', value: `&#8377;${totalRevenue.toLocaleString('en-IN')}`, color: '#e1c391' },
                { label: 'Confirmed Bookings', value: confirmedBookings, color: '#2E7D32' },
                { label: 'Pending Bookings', value: pendingBookings, color: '#F57F17' },
                { label: 'Total Properties', value: dummyProperties.length, color: '#1565C0' },
                { label: 'Completed Stays', value: completedBookings, color: '#6A1B9A' },
                { label: 'Total Bookings', value: bookings.length, color: '#00838F' },
              ].map(stat => (
                <div key={stat.label} style={cardStyle}>
                  <p style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#888', marginBottom: '12px', fontWeight: '600' }}>{stat.label}</p>
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
                  <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a1a', marginBottom: '4px' }}>Recent Bookings</h2>
                  <p style={{ fontSize: '13px', color: '#888' }}>Latest confirmed and pending stays at a glance</p>
                </div>
                <button onClick={() => setActiveTab('bookings')} style={{ background: 'none', border: 'none', color: '#e1c391', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>
                  View All →
                </button>
              </div>
              <div className="hidden md:block" style={{ overflowX: 'auto' }}>
                <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e0d9c0' }}>
                      {['Ref', 'Guest', 'Property', 'Dates', 'Amount', 'Status'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', fontWeight: '700' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 4).map((booking, i) => {
                      const property = getProperty(booking.property_id)
                      return (
                        <tr key={booking.id} style={{ borderBottom: '1px solid #f5f2eb', backgroundColor: i % 2 === 0 ? '#ffffff' : '#fafaf8' }}>
                          <td data-label="Ref" style={{ padding: '14px 16px', fontSize: '13px', color: '#e1c391', fontWeight: '700' }}>{booking.booking_ref}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div className="responsive-table-label">Guest</div>
                            <p style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: '700', marginBottom: '2px' }}>{booking.guest_name}</p>
                            <p style={{ fontSize: '12px', color: '#888' }}>{booking.guest_email}</p>
                          </td>
                          <td data-label="Property" style={{ padding: '14px 16px', fontSize: '13px', color: '#555' }}>{property?.name}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div className="responsive-table-label">Dates</div>
                            <p style={{ fontSize: '12px', color: '#555' }}>{formatDate(booking.check_in)}</p>
                            <p style={{ fontSize: '12px', color: '#888' }}>to {formatDate(booking.check_out)}</p>
                          </td>
                          <td data-label="Amount" style={{ padding: '14px 16px', fontSize: '14px', color: '#1a1a1a', fontWeight: '700' }}>&#8377;{booking.total_price.toLocaleString('en-IN')}</td>
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
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a1a' }}>Properties</h2>
                <button onClick={() => setActiveTab('properties')} style={{ background: 'none', border: 'none', color: '#e1c391', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>
                  Manage All →
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {dummyProperties.slice(0, 3).map(property => (
                  <div key={property.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '16px', border: '1px solid #e0d9c0', borderRadius: '10px' }}>
                    <Image src={property.images.find(i => i.is_primary)?.image_url || property.images[0]?.image_url} alt={property.name} width={64} height={48} style={{ width: '64px', height: '48px', objectFit: 'cover', flexShrink: 0, borderRadius: '6px' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', color: '#1a1a1a', fontWeight: '700', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.name}</p>
                      <p style={{ fontSize: '12px', color: '#888' }}>&#8377;{property.price_per_night.toLocaleString('en-IN')}/night · &#9733;{property.avg_rating}</p>
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
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by guest name, email or booking ref..."
                value={searchBooking}
                onChange={e => setSearchBooking(e.target.value)}
                style={{ flex: 1, minWidth: 0, padding: '12px 16px', border: '1px solid #e0d9c0', borderRadius: '8px', fontSize: '14px', color: '#1a1a1a', outline: 'none', backgroundColor: '#ffffff' }}
              />
              <select style={{ padding: '12px 16px', border: '1px solid #e0d9c0', borderRadius: '8px', fontSize: '14px', color: '#1a1a1a', outline: 'none', backgroundColor: '#ffffff', cursor: 'pointer' }}>
                <option>All Statuses</option>
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e0d9c0', borderRadius: '12px', overflow: 'hidden' }}>
              <div className="hidden md:block" style={{ overflowX: 'auto' }}>
                <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-navbar)' }}>
                      {['Ref', 'Guest', 'Property', 'Check In', 'Check Out', 'Guests', 'Amount', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#e1c391', fontWeight: '700', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking, i) => {
                      const property = getProperty(booking.property_id)
                      return (
                        <tr key={booking.id} style={{ borderBottom: '1px solid #f5f2eb', backgroundColor: i % 2 === 0 ? '#ffffff' : '#fafaf8' }}>
                          <td data-label="Ref" style={{ padding: '14px 16px', fontSize: '13px', color: '#e1c391', fontWeight: '700', whiteSpace: 'nowrap' }}>{booking.booking_ref}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <div className="responsive-table-label">Guest</div>
                            <p style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: '700', marginBottom: '2px', whiteSpace: 'nowrap' }}>{booking.guest_name}</p>
                            <p style={{ fontSize: '11px', color: '#888' }}>{booking.guest_phone}</p>
                          </td>
                          <td data-label="Property" style={{ padding: '14px 16px', fontSize: '13px', color: '#555', whiteSpace: 'nowrap' }}>{property?.city}</td>
                          <td data-label="Check In" style={{ padding: '14px 16px', fontSize: '13px', color: '#555', whiteSpace: 'nowrap' }}>{formatDate(booking.check_in)}</td>
                          <td data-label="Check Out" style={{ padding: '14px 16px', fontSize: '13px', color: '#555', whiteSpace: 'nowrap' }}>{formatDate(booking.check_out)}</td>
                          <td data-label="Guests" style={{ padding: '14px 16px', fontSize: '13px', color: '#555' }}>
                            {booking.guests}{booking.num_pets > 0 ? ` + ${booking.num_pets} pet${booking.num_pets > 1 ? 's' : ''}` : ''}
                          </td>
                          <td data-label="Amount" style={{ padding: '14px 16px', fontSize: '13px', color: '#1a1a1a', fontWeight: '700', whiteSpace: 'nowrap' }}>&#8377;{booking.total_price.toLocaleString('en-IN')}</td>
                          <td data-label="Status" style={{ padding: '14px 16px' }}>
                            <span style={{ backgroundColor: statusColors[booking.status]?.bg, color: statusColors[booking.status]?.color, padding: '4px 10px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap', borderRadius: '6px' }}>
                              {booking.status}
                            </span>
                          </td>
                          <td data-label="Actions" style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {booking.status === 'pending' && (
                                <>
                                  <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} style={{ padding: '6px 10px', backgroundColor: '#E8F5E9', color: '#2E7D32', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '700', borderRadius: '6px' }}>
                                    Confirm
                                  </button>
                                  <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} style={{ padding: '6px 10px', backgroundColor: '#FFEBEE', color: '#C62828', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '700', borderRadius: '6px' }}>
                                    Cancel
                                  </button>
                                </>
                              )}
                              {booking.status === 'confirmed' && (
                                <button onClick={() => updateBookingStatus(booking.id, 'completed')} style={{ padding: '6px 10px', backgroundColor: '#E3F2FD', color: '#1565C0', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '700', borderRadius: '6px' }}>
                                  Complete
                                </button>
                              )}
                              <button style={{ padding: '6px 10px', backgroundColor: '#f5f2eb', color: '#555', border: '1px solid #e0d9c0', fontSize: '12px', cursor: 'pointer', borderRadius: '6px', fontWeight: '600' }}>
                                Voucher
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredBookings.map(booking => renderBookingCard(booking, true))}
              </div>

              {filteredBookings.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px', color: '#888' }}>
                  No bookings found matching your search
                </div>
              )}
            </div>
          </div>
        )}

        {/* Properties Tab */}
        {activeTab === 'properties' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
              <button style={{ backgroundColor: '#e1c391', color: '#1a1a1a', border: 'none', padding: '12px 24px', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer', borderRadius: '8px' }}>
                + Add New Property
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dummyProperties.map(property => (
                <div key={property.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e0d9c0', borderRadius: '12px', padding: '24px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Image src={property.images.find(i => i.is_primary)?.image_url || property.images[0]?.image_url} alt={property.name} width={120} height={90} style={{ width: '120px', height: '90px', objectFit: 'cover', flexShrink: 0, borderRadius: '8px' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{property.name}</h3>
                      <span style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '3px 10px', fontSize: '11px', fontWeight: '700', borderRadius: '6px' }}>Published</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>{property.city}, {property.state}</p>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      {[
                        { label: `${property.bedrooms} beds` },
                        { label: `${property.bathrooms} baths` },
                        { label: `${property.max_guests} guests` },
                        { label: `★ ${property.avg_rating}` },
                        { label: `${property.review_count} reviews` },
                        { label: property.pets_allowed ? 'Pet friendly' : 'No pets' },
                      ].map(detail => (
                        <span key={detail.label} style={{ fontSize: '12px', color: '#555', fontWeight: '500' }}>
                          {detail.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: '22px', color: '#1a1a1a', fontWeight: '800', marginBottom: '4px' }}>
                      &#8377;{property.price_per_night.toLocaleString('en-IN')}
                    </p>
                    <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>per night</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button style={{ padding: '8px 16px', border: '1px solid #e1c391', borderRadius: '8px', backgroundColor: 'transparent', color: '#1a1a1a', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>
                        Edit
                      </button>
                      <Link href={`/properties/${property.id}`} style={{ padding: '8px 16px', border: '1px solid #e0d9c0', borderRadius: '8px', backgroundColor: 'transparent', color: '#555', fontSize: '13px', cursor: 'pointer', textDecoration: 'none', display: 'inline-block', fontWeight: '600' }}>
                        View
                      </Link>
                      <button style={{ padding: '8px 16px', border: '1px solid #FFEBEE', borderRadius: '8px', backgroundColor: '#FFEBEE', color: '#C62828', fontSize: '13px', cursor: 'pointer', fontWeight: '700' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* iCal Tab */}
        {activeTab === 'ical' && (
          <div>
            <div style={{ ...cardStyle, marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a1a', marginBottom: '8px' }}>iCal Calendar Sync</h2>
              <div style={{ width: '40px', height: '2px', backgroundColor: '#e1c391', marginBottom: '16px' }} />
              <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.7', maxWidth: '760px' }}>
                Keep your availability in sync across all platforms. Import calendars from Airbnb or Booking.com to block those dates here automatically. Export your calendar link to paste into other platforms.
              </p>
            </div>

            {dummyProperties.map(property => (
              <div key={property.id} style={{ ...cardStyle, marginBottom: '16px', boxShadow: '0 8px 24px rgba(26,26,26,0.04)' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <Image src={property.images.find(i => i.is_primary)?.image_url || property.images[0]?.image_url} alt={property.name} width={60} height={45} style={{ width: '60px', height: '45px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#1a1a1a', marginBottom: '4px' }}>{property.name}</h3>
                    <p style={{ fontSize: '13px', color: '#888' }}>{property.city}, {property.state}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ padding: '20px', backgroundColor: '#f0f7f0', border: '1px solid #C8E6C9', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#2E7D32', marginBottom: '8px', fontWeight: '700' }}>Export Calendar</h4>
                    <p style={{ fontSize: '13px', color: '#555', marginBottom: '12px', lineHeight: '1.5' }}>
                      Copy this link and paste it into Airbnb, Booking.com or any other platform to sync your availability.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input readOnly value={`https://earthystay.com/api/ical/export/${property.id}`} style={{ flex: 1, padding: '10px 12px', border: '1px solid #C8E6C9', borderRadius: '8px', fontSize: '12px', color: '#555', backgroundColor: '#ffffff', outline: 'none' }} />
                      <button onClick={() => navigator.clipboard.writeText(`https://earthystay.com/api/ical/export/${property.id}`)} style={{ padding: '10px 16px', backgroundColor: '#2E7D32', color: '#ffffff', border: 'none', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '700', borderRadius: '8px' }}>
                        Copy
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '20px', backgroundColor: '#E3F2FD', border: '1px solid #BBDEFB', borderRadius: '12px' }}>
                    <h4 style={{ fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#1565C0', marginBottom: '8px', fontWeight: '700' }}>Import Calendar</h4>
                    <p style={{ fontSize: '13px', color: '#555', marginBottom: '12px', lineHeight: '1.5' }}>
                      Paste a calendar link from Airbnb or Booking.com to automatically block those dates here.
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input placeholder="Paste .ics URL here..." style={{ flex: 1, padding: '10px 12px', border: '1px solid #BBDEFB', borderRadius: '8px', fontSize: '12px', color: '#555', backgroundColor: '#ffffff', outline: 'none' }} />
                      <button style={{ padding: '10px 16px', backgroundColor: '#1565C0', color: '#ffffff', border: 'none', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '700', borderRadius: '8px' }}>
                        Sync
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f9f8f5', border: '1px solid #e0d9c0', borderRadius: '12px' }}>
                  <p style={{ fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '12px', fontWeight: '700' }}>Connected Calendars</p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {['Airbnb', 'Booking.com'].map(platform => (
                      <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#ffffff', border: '1px solid #e0d9c0', borderRadius: '999px', flexWrap: 'wrap' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2E7D32' }} />
                        <span style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: '500' }}>{platform}</span>
                        <span style={{ fontSize: '11px', color: '#888' }}>Last synced: Today</span>
                        <button style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: '16px', lineHeight: 1, fontWeight: '700' }}>x</button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#e1c391', cursor: 'pointer', fontWeight: '700' }}>
                      + Add Platform
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}