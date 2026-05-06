'use client'
import { useState } from 'react'
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

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'bookings', label: '📅 Bookings' },
    { id: 'properties', label: '🏡 Properties' },
    { id: 'ical', label: '📆 iCal Sync' },
  ]

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#1C1C1C', padding: '32px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ color: '#C9A84C', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }}>Admin Panel</p>
            <h1 style={{ fontFamily: 'Georgia, serif', color: '#FAF8F5', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: '400' }}>
              Earthy Stay Dashboard
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/" style={{ border: '1px solid #555', color: '#FAF8F5', padding: '10px 20px', fontSize: '13px', textDecoration: 'none', letterSpacing: '1px' }}>
              View Site
            </Link>
            <button style={{ backgroundColor: '#C9A84C', color: '#1C1C1C', border: 'none', padding: '10px 20px', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer' }}>
              + Add Property
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E0D8' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', overflowX: 'auto' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 24px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #C9A84C' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab.id ? '#C9A84C' : '#888',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? '700' : '400',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '40px' }}>
              {[
                { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: '💰', color: '#C9A84C' },
                { label: 'Confirmed Bookings', value: confirmedBookings, icon: '✅', color: '#2E7D32' },
                { label: 'Pending Bookings', value: pendingBookings, icon: '⏳', color: '#F57F17' },
                { label: 'Total Properties', value: dummyProperties.length, icon: '🏡', color: '#1565C0' },
                { label: 'Completed Stays', value: completedBookings, icon: '🎯', color: '#6A1B9A' },
                { label: 'Total Bookings', value: bookings.length, icon: '📋', color: '#00838F' },
              ].map(stat => (
                <div key={stat.label} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{stat.icon}</span>
                    <span style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase', color: '#888' }}>{stat.label}</span>
                  </div>
                  <p style={{ fontFamily: 'Georgia, serif', fontSize: '32px', color: stat.color, fontWeight: '600' }}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8', padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1C1C1C' }}>Recent Bookings</h2>
                <button onClick={() => setActiveTab('bookings')} style={{ background: 'none', border: 'none', color: '#C9A84C', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                  View All →
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E5E0D8' }}>
                      {['Ref', 'Guest', 'Property', 'Dates', 'Amount', 'Status'].map(h => (
                        <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', fontWeight: '600' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 4).map((booking, i) => {
                      const property = getProperty(booking.property_id)
                      return (
                        <tr key={booking.id} style={{ borderBottom: '1px solid #F0EDEA', backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#C9A84C', fontWeight: '600' }}>{booking.booking_ref}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <p style={{ fontSize: '13px', color: '#1C1C1C', fontWeight: '600', marginBottom: '2px' }}>{booking.guest_name}</p>
                            <p style={{ fontSize: '12px', color: '#888' }}>{booking.guest_email}</p>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#555' }}>{property?.name}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <p style={{ fontSize: '12px', color: '#555' }}>{formatDate(booking.check_in)}</p>
                            <p style={{ fontSize: '12px', color: '#888' }}>→ {formatDate(booking.check_out)}</p>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1C1C1C', fontWeight: '600' }}>₹{booking.total_price.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ backgroundColor: statusColors[booking.status]?.bg, color: statusColors[booking.status]?.color, padding: '4px 10px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase' }}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Properties Summary */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8', padding: '32px', marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1C1C1C' }}>Properties</h2>
                <button onClick={() => setActiveTab('properties')} style={{ background: 'none', border: 'none', color: '#C9A84C', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                  Manage All →
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {dummyProperties.slice(0, 3).map(property => (
                  <div key={property.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '16px', border: '1px solid #E5E0D8' }}>
                    <img src={property.images.find(i => i.is_primary)?.image_url || property.images[0]?.image_url} alt={property.name} style={{ width: '64px', height: '48px', objectFit: 'cover', flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', color: '#1C1C1C', fontWeight: '600', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{property.name}</p>
                      <p style={{ fontSize: '12px', color: '#888' }}>₹{property.price_per_night.toLocaleString('en-IN')}/night · ★{property.avg_rating}</p>
                    </div>
                    <span style={{ fontSize: '11px', backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '3px 8px', fontWeight: '600', flexShrink: 0 }}>Live</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            {/* Search + Filter */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by guest name, email or booking ref..."
                value={searchBooking}
                onChange={e => setSearchBooking(e.target.value)}
                style={{ flex: 1, minWidth: '250px', padding: '12px 16px', border: '1px solid #E5E0D8', fontSize: '14px', color: '#1C1C1C', outline: 'none', backgroundColor: '#FFFFFF' }}
              />
              <select style={{ padding: '12px 16px', border: '1px solid #E5E0D8', fontSize: '14px', color: '#1C1C1C', outline: 'none', backgroundColor: '#FFFFFF', cursor: 'pointer' }}>
                <option>All Statuses</option>
                <option>Confirmed</option>
                <option>Pending</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>
            </div>

            {/* Bookings Table */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#1C1C1C' }}>
                      {['Ref', 'Guest', 'Property', 'Check In', 'Check Out', 'Guests', 'Amount', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#C9A84C', fontWeight: '600', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking, i) => {
                      const property = getProperty(booking.property_id)
                      return (
                        <tr key={booking.id} style={{ borderBottom: '1px solid #F0EDEA', backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#C9A84C', fontWeight: '600', whiteSpace: 'nowrap' }}>{booking.booking_ref}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <p style={{ fontSize: '13px', color: '#1C1C1C', fontWeight: '600', marginBottom: '2px', whiteSpace: 'nowrap' }}>{booking.guest_name}</p>
                            <p style={{ fontSize: '11px', color: '#888' }}>{booking.guest_phone}</p>
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#555', whiteSpace: 'nowrap' }}>{property?.city}</td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#555', whiteSpace: 'nowrap' }}>{formatDate(booking.check_in)}</td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#555', whiteSpace: 'nowrap' }}>{formatDate(booking.check_out)}</td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#555' }}>
                            {booking.guests}{booking.num_pets > 0 ? ` + 🐾${booking.num_pets}` : ''}
                          </td>
                          <td style={{ padding: '14px 16px', fontSize: '13px', color: '#1C1C1C', fontWeight: '600', whiteSpace: 'nowrap' }}>₹{booking.total_price.toLocaleString('en-IN')}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ backgroundColor: statusColors[booking.status]?.bg, color: statusColors[booking.status]?.color, padding: '4px 10px', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                              {booking.status}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {booking.status === 'pending' && (
                                <>
                                  <button onClick={() => updateBookingStatus(booking.id, 'confirmed')} style={{ padding: '6px 10px', backgroundColor: '#E8F5E9', color: '#2E7D32', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                                    ✓ Confirm
                                  </button>
                                  <button onClick={() => updateBookingStatus(booking.id, 'cancelled')} style={{ padding: '6px 10px', backgroundColor: '#FFEBEE', color: '#C62828', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                                    ✕ Cancel
                                  </button>
                                </>
                              )}
                              {booking.status === 'confirmed' && (
                                <button onClick={() => updateBookingStatus(booking.id, 'completed')} style={{ padding: '6px 10px', backgroundColor: '#E3F2FD', color: '#1565C0', border: 'none', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>
                                  ✓ Complete
                                </button>
                              )}
                              <button style={{ padding: '6px 10px', backgroundColor: '#FAF8F5', color: '#555', border: '1px solid #E5E0D8', fontSize: '12px', cursor: 'pointer' }}>
                                📄 Voucher
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
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
              <button style={{ backgroundColor: '#C9A84C', color: '#1C1C1C', border: 'none', padding: '12px 24px', fontSize: '13px', fontWeight: '700', letterSpacing: '1px', cursor: 'pointer' }}>
                + Add New Property
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dummyProperties.map(property => (
                <div key={property.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8', padding: '24px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>

                  <img
                    src={property.images.find(i => i.is_primary)?.image_url || property.images[0]?.image_url}
                    alt={property.name}
                    style={{ width: '120px', height: '90px', objectFit: 'cover', flexShrink: 0 }}
                  />

                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1C1C1C' }}>{property.name}</h3>
                      <span style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '3px 10px', fontSize: '11px', fontWeight: '600' }}>Published</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>📍 {property.city}, {property.state}</p>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      {[
                        { label: '🛏', value: `${property.bedrooms} beds` },
                        { label: '🚿', value: `${property.bathrooms} baths` },
                        { label: '👥', value: `${property.max_guests} guests` },
                        { label: '★', value: property.avg_rating },
                        { label: '💬', value: `${property.review_count} reviews` },
                        { label: '🐾', value: property.pets_allowed ? 'Pet friendly' : 'No pets' },
                      ].map(detail => (
                        <span key={detail.label} style={{ fontSize: '12px', color: '#555' }}>
                          {detail.label} {detail.value}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1C1C1C', fontWeight: '600', marginBottom: '4px' }}>
                      ₹{property.price_per_night.toLocaleString('en-IN')}
                    </p>
                    <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>per night</p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button style={{ padding: '8px 16px', border: '1px solid #C9A84C', backgroundColor: 'transparent', color: '#C9A84C', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>
                        ✏️ Edit
                      </button>
                      <Link href={`/properties/${property.id}`} style={{ padding: '8px 16px', border: '1px solid #E5E0D8', backgroundColor: 'transparent', color: '#555', fontSize: '13px', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}>
                        👁 View
                      </Link>
                      <button style={{ padding: '8px 16px', border: '1px solid #FFEBEE', backgroundColor: '#FFEBEE', color: '#C62828', fontSize: '13px', cursor: 'pointer' }}>
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* iCal Sync Tab */}
        {activeTab === 'ical' && (
          <div>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8', padding: '32px', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#1C1C1C', marginBottom: '8px' }}>
                iCal Calendar Sync
              </h2>
              <div style={{ width: '40px', height: '1px', backgroundColor: '#C9A84C', marginBottom: '16px' }} />
              <p style={{ color: '#555', fontSize: '14px', lineHeight: '1.7', marginBottom: '0' }}>
                Keep your availability in sync across all platforms. Import calendars from Airbnb or Booking.com to block those dates here automatically. Export your calendar link to paste into other platforms.
              </p>
            </div>

            {dummyProperties.map(property => (
              <div key={property.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8', padding: '28px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
                  <img src={property.images.find(i => i.is_primary)?.image_url || property.images[0]?.image_url} alt={property.name} style={{ width: '60px', height: '45px', objectFit: 'cover' }} />
                  <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '18px', color: '#1C1C1C' }}>{property.name}</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                  {/* Export */}
                  <div style={{ padding: '20px', backgroundColor: '#F0F7F0', border: '1px solid #C8E6C9' }}>
                    <h4 style={{ fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#2E7D32', marginBottom: '8px', fontWeight: '700' }}>
                      📤 Export Calendar
                    </h4>
                    <p style={{ fontSize: '13px', color: '#555', marginBottom: '12px', lineHeight: '1.5' }}>
                      Copy this link and paste it into Airbnb, Booking.com or any other platform to sync your availability.
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        readOnly
                        value={`https://earthystay.com/api/ical/export/${property.id}`}
                        style={{ flex: 1, padding: '10px 12px', border: '1px solid #C8E6C9', fontSize: '12px', color: '#555', backgroundColor: '#FFFFFF', outline: 'none' }}
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(`https://earthystay.com/api/ical/export/${property.id}`)}
                        style={{ padding: '10px 16px', backgroundColor: '#2E7D32', color: '#FFFFFF', border: 'none', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600' }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Import */}
                  <div style={{ padding: '20px', backgroundColor: '#E3F2FD', border: '1px solid #BBDEFB' }}>
                    <h4 style={{ fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#1565C0', marginBottom: '8px', fontWeight: '700' }}>
                      📥 Import Calendar
                    </h4>
                    <p style={{ fontSize: '13px', color: '#555', marginBottom: '12px', lineHeight: '1.5' }}>
                      Paste a calendar link from Airbnb or Booking.com to automatically block those dates here.
                    </p>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        placeholder="Paste .ics URL here..."
                        style={{ flex: 1, padding: '10px 12px', border: '1px solid #BBDEFB', fontSize: '12px', color: '#555', backgroundColor: '#FFFFFF', outline: 'none' }}
                      />
                      <button style={{ padding: '10px 16px', backgroundColor: '#1565C0', color: '#FFFFFF', border: 'none', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '600' }}>
                        Sync
                      </button>
                    </div>
                  </div>
                </div>

                {/* Synced Calendars */}
                <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#FAF8F5', border: '1px solid #E5E0D8' }}>
                  <p style={{ fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '12px', fontWeight: '600' }}>
                    Connected Calendars
                  </p>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {['Airbnb', 'Booking.com'].map(platform => (
                      <div key={platform} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2E7D32' }} />
                        <span style={{ fontSize: '13px', color: '#1C1C1C' }}>{platform}</span>
                        <span style={{ fontSize: '11px', color: '#888' }}>Last synced: Today</span>
                        <button style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#C9A84C', cursor: 'pointer' }}>
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