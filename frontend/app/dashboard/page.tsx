'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { dummyProperties } from '@/lib/data/properties'

const dummyBookings = [
  { id: "BK001", booking_ref: "ES-ABC123", property_id: "1", check_in: "2026-06-15", check_out: "2026-06-18", guests: 4, num_pets: 1, nights: 3, base_price: 25500, pet_charge: 1500, cleaning_fee: 1000, total_price: 28000, status: "confirmed", payment_status: "paid", special_requests: "Early check-in if possible", created_at: "2026-05-01" },
  { id: "BK002", booking_ref: "ES-DEF456", property_id: "3", check_in: "2026-07-20", check_out: "2026-07-22", guests: 2, num_pets: 0, nights: 2, base_price: 24000, pet_charge: 0, cleaning_fee: 1500, total_price: 25500, status: "confirmed", payment_status: "paid", special_requests: "", created_at: "2026-05-03" },
  { id: "BK003", booking_ref: "ES-GHI789", property_id: "2", check_in: "2026-03-10", check_out: "2026-03-13", guests: 3, num_pets: 0, nights: 3, base_price: 19500, pet_charge: 0, cleaning_fee: 800, total_price: 20300, status: "completed", payment_status: "paid", special_requests: "", created_at: "2026-02-15" },
]

const statusColors: Record<string, { bg: string, color: string }> = {
  confirmed: { bg: '#E8F5E9', color: '#2E7D32' },
  pending: { bg: '#FFF8E7', color: '#F57F17' },
  completed: { bg: '#E3F2FD', color: '#1565C0' },
  cancelled: { bg: '#FFEBEE', color: '#C62828' },
}

export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('bookings')
  const [activeBooking, setActiveBooking] = useState<string | null>(null)
  const [profileForm, setProfileForm] = useState({ full_name: 'Mohammed Pithapur', email: 'mohammed@example.com', phone: '+91 98765 43210' })
  const [profileSaved, setProfileSaved] = useState(false)

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  const getProperty = (id: string) => dummyProperties.find(p => p.id === id)
  const upcomingBookings = dummyBookings.filter(b => b.status === 'confirmed')
  const pastBookings = dummyBookings.filter(b => b.status === 'completed')

  const tabs = [
    { id: 'bookings', label: 'My Bookings', count: upcomingBookings.length },
    { id: 'past', label: 'Past Stays', count: pastBookings.length },
    { id: 'profile', label: 'My Profile', count: null },
  ]

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    border: '1px solid #e0d9c0',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#1a1a1a',
    outline: 'none',
    backgroundColor: '#ffffff',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    fontSize: '11px',
    letterSpacing: '2px',
    textTransform: 'uppercase' as const,
    color: '#888',
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600' as const,
  }

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ backgroundColor: '#2c2c2c', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <p style={{ color: '#e1c391', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '600' }}>Welcome Back</p>
            <h1 style={{ color: '#ffffff', fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: '800' }}>
              Mohammed Pithapur
            </h1>
          </div>
          <Link
            href="/properties"
            style={{ backgroundColor: '#e1c391', color: '#1a1a1a', padding: '14px 28px', fontSize: '13px', letterSpacing: '1.5px', fontWeight: '700', textTransform: 'uppercase', textDecoration: 'none', borderRadius: '8px' }}
          >
            Book New Stay
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e0d9c0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px', display: 'flex', gap: '0', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Bookings', value: dummyBookings.length },
            { label: 'Upcoming Stays', value: upcomingBookings.length },
            { label: 'Past Stays', value: pastBookings.length },
            { label: 'Total Spent', value: `&#8377;${dummyBookings.reduce((acc, b) => acc + b.total_price, 0).toLocaleString('en-IN')}` },
          ].map((stat, i) => (
            <div key={stat.label} style={{ flex: '1 1 150px', padding: '16px 24px', borderRight: i < 3 ? '1px solid #e0d9c0' : 'none', textAlign: 'center' }}>
              <p style={{ fontSize: '28px', color: '#1a1a1a', fontWeight: '800', marginBottom: '4px' }}
                dangerouslySetInnerHTML={{ __html: String(stat.value) }}
              />
              <p style={{ fontSize: '12px', color: '#888', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '600' }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '32px', borderBottom: '1px solid #e0d9c0' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '14px 24px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #e1c391' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === tab.id ? '#e1c391' : '#888',
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: activeTab === tab.id ? '700' : '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {tab.label}
              {tab.count !== null && (
                <span style={{
                  backgroundColor: activeTab === tab.id ? '#e1c391' : '#e0d9c0',
                  color: activeTab === tab.id ? '#1a1a1a' : '#888',
                  borderRadius: '50%',
                  width: '20px', height: '20px',
                  fontSize: '11px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700',
                }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            {upcomingBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: '#ffffff', border: '1px solid #e0d9c0', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginBottom: '12px' }}>No upcoming bookings</h3>
                <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>Ready for your next escape?</p>
                <Link href="/properties" style={{ backgroundColor: '#e1c391', color: '#1a1a1a', padding: '14px 32px', fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700', textDecoration: 'none', borderRadius: '8px' }}>
                  Explore Properties
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {upcomingBookings.map(booking => {
                  const property = getProperty(booking.property_id)
                  if (!property) return null
                  const isExpanded = activeBooking === booking.id

                  return (
                    <div key={booking.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e0d9c0', borderRadius: '12px', overflow: 'hidden' }}>

                      <div style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <Image
                          src={property.images.find(i => i.is_primary)?.image_url || property.images[0]?.image_url}
                          alt={property.name}
                          width={120}
                          height={90}
                          style={{ objectFit: 'cover', flexShrink: 0, borderRadius: '8px' }}
                        />

                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a' }}>{property.name}</h3>
                            <span style={{ backgroundColor: statusColors[booking.status]?.bg, color: statusColors[booking.status]?.color, padding: '4px 12px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', borderRadius: '6px' }}>
                              {booking.status}
                            </span>
                          </div>
                          <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>{property.city}, {property.state}</p>
                          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                            {[
                              { label: 'Check In', value: formatDate(booking.check_in) },
                              { label: 'Check Out', value: formatDate(booking.check_out) },
                              { label: 'Nights', value: `${booking.nights} nights` },
                              { label: 'Guests', value: `${booking.guests} guests${booking.num_pets > 0 ? ` + ${booking.num_pets} pet${booking.num_pets > 1 ? 's' : ''}` : ''}` },
                            ].map(detail => (
                              <div key={detail.label}>
                                <p style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '2px', fontWeight: '600' }}>{detail.label}</p>
                                <p style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: '700' }}>{detail.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <p style={{ fontSize: '22px', color: '#1a1a1a', fontWeight: '800', marginBottom: '4px' }}>
                            &#8377;{booking.total_price.toLocaleString('en-IN')}
                          </p>
                          <p style={{ fontSize: '11px', color: '#888', marginBottom: '16px' }}>Total Paid</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button
                              onClick={() => setActiveBooking(isExpanded ? null : booking.id)}
                              style={{ padding: '8px 16px', border: '1px solid #e0d9c0', borderRadius: '8px', backgroundColor: 'transparent', fontSize: '13px', color: '#555', cursor: 'pointer', fontWeight: '500' }}
                            >
                              {isExpanded ? 'Hide Details' : 'View Details'}
                            </button>
                            <button style={{ padding: '8px 16px', border: '1px solid #e1c391', borderRadius: '8px', backgroundColor: '#e1c391', color: '#1a1a1a', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                              Download Voucher
                            </button>
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{ borderTop: '1px solid #e0d9c0', padding: '24px', backgroundColor: '#ede8d0' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                            <div>
                              <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '8px', fontWeight: '600' }}>Booking Reference</p>
                              <p style={{ fontSize: '20px', color: '#1a1a1a', fontWeight: '800', letterSpacing: '2px' }}>{booking.booking_ref}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '8px', fontWeight: '600' }}>Check In Time</p>
                              <p style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: '700' }}>{property.check_in_time}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '8px', fontWeight: '600' }}>Check Out Time</p>
                              <p style={{ fontSize: '15px', color: '#1a1a1a', fontWeight: '700' }}>{property.check_out_time}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '8px', fontWeight: '600' }}>Property Address</p>
                              <p style={{ fontSize: '14px', color: '#1a1a1a', lineHeight: '1.5' }}>{property.address}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '8px', fontWeight: '600' }}>Property Contact</p>
                              <p style={{ fontSize: '14px', color: '#1a1a1a' }}>{property.contact_phone}</p>
                              <p style={{ fontSize: '14px', color: '#1a1a1a' }}>{property.contact_email}</p>
                            </div>
                            <div>
                              <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '8px', fontWeight: '600' }}>Price Breakdown</p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555' }}>
                                  <span>Base price</span><span>&#8377;{booking.base_price.toLocaleString('en-IN')}</span>
                                </div>
                                {booking.pet_charge > 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555' }}>
                                    <span>Pet charge</span><span>&#8377;{booking.pet_charge.toLocaleString('en-IN')}</span>
                                  </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555' }}>
                                  <span>Cleaning fee</span><span>&#8377;{booking.cleaning_fee.toLocaleString('en-IN')}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#1a1a1a', fontWeight: '800', borderTop: '1px solid #e0d9c0', paddingTop: '4px', marginTop: '4px' }}>
                                  <span>Total</span><span>&#8377;{booking.total_price.toLocaleString('en-IN')}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {booking.special_requests && (
                            <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#ffffff', border: '1px solid #e0d9c0', borderRadius: '8px' }}>
                              <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', marginBottom: '8px', fontWeight: '600' }}>Special Requests</p>
                              <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>{booking.special_requests}</p>
                            </div>
                          )}

                          <div style={{ marginTop: '16px', backgroundColor: '#fffdf5', border: '1px solid #e1c391', borderRadius: '8px', padding: '12px 16px' }}>
                            <p style={{ fontSize: '12px', color: '#555' }}>
                              <strong>Important:</strong> This booking is <strong>non-refundable</strong>. Cancellation will not result in a refund.
                            </p>
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

        {/* Past Stays */}
        {activeTab === 'past' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pastBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: '#ffffff', border: '1px solid #e0d9c0', borderRadius: '12px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1a1a1a', marginBottom: '12px' }}>No past stays yet</h3>
                <p style={{ color: '#888', fontSize: '14px' }}>Your completed stays will appear here</p>
              </div>
            ) : (
              pastBookings.map(booking => {
                const property = getProperty(booking.property_id)
                if (!property) return null
                return (
                  <div key={booking.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e0d9c0', borderRadius: '12px', padding: '24px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <Image src={property.images.find(i => i.is_primary)?.image_url || property.images[0]?.image_url} alt={property.name} width={100} height={75} style={{ objectFit: 'cover', flexShrink: 0, opacity: 0.8, borderRadius: '8px' }} />
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>{property.name}</h3>
                      <p style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>
                        {formatDate(booking.check_in)} to {formatDate(booking.check_out)}
                      </p>
                      <span style={{ backgroundColor: statusColors.completed.bg, color: statusColors.completed.color, padding: '3px 10px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', borderRadius: '6px' }}>
                        Completed
                      </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '18px', color: '#1a1a1a', fontWeight: '800', marginBottom: '8px' }}>
                        &#8377;{booking.total_price.toLocaleString('en-IN')}
                      </p>
                      <button style={{ padding: '8px 16px', border: '1px solid #e1c391', borderRadius: '8px', backgroundColor: 'transparent', color: '#1a1a1a', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
                        Download Voucher
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <div style={{ maxWidth: '600px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e0d9c0', borderRadius: '12px', padding: '32px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a1a', marginBottom: '8px' }}>My Profile</h2>
              <div style={{ width: '40px', height: '2px', backgroundColor: '#e1c391', marginBottom: '28px' }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <div style={{ width: '72px', height: '72px', backgroundColor: '#e1c391', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', color: '#1a1a1a' }}>
                  M
                </div>
                <div>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a1a', marginBottom: '4px' }}>{profileForm.full_name}</p>
                  <p style={{ fontSize: '13px', color: '#888' }}>Guest Account</p>
                </div>
              </div>

              {[
                { label: 'Full Name', field: 'full_name', type: 'text', placeholder: 'Mohammed Pithapur' },
                { label: 'Email Address', field: 'email', type: 'email', placeholder: 'you@example.com' },
                { label: 'Phone Number', field: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
              ].map(item => (
                <div key={item.field} style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>{item.label}</label>
                  <input
                    type={item.type}
                    placeholder={item.placeholder}
                    value={profileForm[item.field as keyof typeof profileForm]}
                    onChange={e => setProfileForm({ ...profileForm, [item.field]: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              ))}

              <button
                onClick={() => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000) }}
                style={{ backgroundColor: '#e1c391', color: '#1a1a1a', border: 'none', padding: '14px 32px', fontSize: '13px', letterSpacing: '1.5px', fontWeight: '700', textTransform: 'uppercase', cursor: 'pointer', marginTop: '8px', borderRadius: '8px' }}
              >
                Save Changes
              </button>

              {profileSaved && (
                <p style={{ color: '#2E7D32', fontSize: '14px', marginTop: '12px', fontWeight: '600' }}>
                  Profile updated successfully!
                </p>
              )}
            </div>

            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e0d9c0', borderRadius: '12px', padding: '32px', marginTop: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#1a1a1a', marginBottom: '8px' }}>Change Password</h3>
              <div style={{ width: '40px', height: '2px', backgroundColor: '#e1c391', marginBottom: '24px' }} />
              {['Current Password', 'New Password', 'Confirm New Password'].map(label => (
                <div key={label} style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>{label}</label>
                  <input type="password" placeholder="••••••••" style={inputStyle} />
                </div>
              ))}
              <button style={{ backgroundColor: '#1a1a1a', color: '#ffffff', border: 'none', padding: '14px 32px', fontSize: '13px', letterSpacing: '1.5px', fontWeight: '700', textTransform: 'uppercase', cursor: 'pointer', marginTop: '8px', borderRadius: '8px' }}>
                Update Password
              </button>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center' }}>
              <button
                onClick={() => router.push('/')}
                style={{ background: 'none', border: 'none', color: '#888', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}