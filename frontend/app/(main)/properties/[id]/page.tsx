'use client'
import { useState } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { dummyProperties } from '@/lib/data/properties'
import MapWrapper from '@/components/shared/MapWrapper'

const bathroomLabel: Record<string, string> = {
  ensuite: 'Private Ensuite',
  detached_private: 'Detached Private',
  shared: 'Shared',
}

export default function PropertyDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const property = dummyProperties.find(p => p.id === id)

  const [activeImage, setActiveImage] = useState(0)
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [pets, setPets] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')

  if (!property) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '16px' }}>Property not found</h2>
        <button
          onClick={() => router.push('/properties')}
          style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-text-primary)', border: 'none', padding: '14px 32px', fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer', borderRadius: '8px' }}
        >
          Back to Properties
        </button>
      </div>
    )
  }

  const calcNights = () => {
    if (!checkIn || !checkOut) return 0
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const nights = calcNights()
  const basePrice = nights * property.price_per_night
  const petCharge = pets * nights * property.pet_charge_per_night
  const totalPrice = basePrice + property.cleaning_fee + petCharge

  const handleBook = () => {
    if (!checkIn || !checkOut) { alert('Please select check-in and check-out dates'); return }
    if (nights < property.min_nights) { alert(`Minimum stay is ${property.min_nights} nights`); return }
    router.push(`/booking/${property.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&pets=${pets}&nights=${nights}&total=${totalPrice}`)
  }

  const reviews = [
    { id: 1, name: 'Priya S.', rating: 5, comment: 'Absolutely stunning property! Every detail was perfect. Will definitely be back.', date: 'March 2024' },
    { id: 2, name: 'Rahul M.', rating: 5, comment: 'The views were breathtaking and the amenities were top notch. Highly recommend!', date: 'February 2024' },
    { id: 3, name: 'Anjali K.', rating: 4, comment: 'Beautiful property in a great location. The host was very responsive and helpful.', date: 'January 2024' },
  ]

  const tabs = ['overview', 'amenities', 'house rules', 'location', 'reviews']

  const cardStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid var(--color-border)',
    borderRadius: '12px',
    padding: '28px',
    marginBottom: '20px',
  }

  return (
    <div className="page-shell" style={{ backgroundColor: '#ffffff' }}>

      {/* Photo Gallery */}
      <div style={{ backgroundColor: 'var(--color-navbar)', padding: '6px' }}>
        <div style={{ position: 'relative', minHeight: 'clamp(280px, 55vw, 500px)', overflow: 'hidden', marginBottom: '8px' }}>
          <Image
            src={property.images[activeImage]?.image_url}
            alt={property.name}
            fill
            sizes="100vw"
            style={{ objectFit: 'cover' }}
            priority
          />
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#ffffff', padding: '6px 14px', fontSize: '13px', borderRadius: '6px' }}>
            {activeImage + 1} / {property.images.length}
          </div>
          {property.images.length > 1 && (
            <>
              <button onClick={() => setActiveImage(i => Math.max(0, i - 1))} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: '#ffffff', border: 'none', width: '44px', height: '44px', fontSize: '20px', cursor: 'pointer', borderRadius: '8px' }}>‹</button>
              <button onClick={() => setActiveImage(i => Math.min(property.images.length - 1, i + 1))} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: '#ffffff', border: 'none', width: '44px', height: '44px', fontSize: '20px', cursor: 'pointer', borderRadius: '8px' }}>›</button>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '4px 4px' }}>
          {property.images.map((img, i) => (
            <Image
              key={img.id}
              src={img.image_url}
              alt={`${property.name} ${i + 1}`}
              onClick={() => setActiveImage(i)}
              width={72}
              height={48}
              style={{ objectFit: 'cover', cursor: 'pointer', flexShrink: 0, opacity: activeImage === i ? 1 : 0.7, border: activeImage === i ? '2px solid var(--color-gold)' : '2px solid transparent', borderRadius: '6px', transition: 'opacity 0.15s ease' }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="content-shell-lg" style={{ padding: '48px 24px 72px' }}>
      <div className="responsive-grid-detail md:grid-cols-2">

        {/* Left Column */}
        <div style={{ minWidth: 0 }}>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: 'var(--color-bg-soft)', color: 'var(--color-text-primary)', padding: '5px 12px', fontSize: '12px', letterSpacing: '0.5px', borderRadius: '6px', fontWeight: '600' }}>
              {property.city}, {property.state}
            </span>
            <span style={{ backgroundColor: 'var(--color-text-primary)', color: 'var(--color-gold)', padding: '5px 12px', fontSize: '12px', borderRadius: '6px', fontWeight: '600' }}>
              ★ {property.avg_rating} ({property.review_count} reviews)
            </span>
            {property.pets_allowed && (
              <span style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '5px 12px', fontSize: '12px', borderRadius: '6px', fontWeight: '600' }}>
                Pets Welcome
              </span>
            )}
          </div>

          <h1 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '16px', lineHeight: '1.2' }}>
            {property.name}
          </h1>

          {/* Quick Stats */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', padding: '20px 0', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)', marginBottom: '32px' }}>
            {[
              { label: `${property.max_guests} Guests` },
              { label: `${property.bedrooms} Bedrooms` },
              { label: `Min ${property.min_nights} Nights` },
            ].map(stat => (
              <div key={stat.label} style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
                {stat.label}
              </div>
            ))}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                {property.bathrooms} Bathroom{property.bathrooms > 1 ? 's' : ''}
              </span>
              {property.bathrooms_detail.map((b, i) => (
                <span key={i} style={{ fontSize: '12px', color: 'var(--color-text-muted)', paddingLeft: '8px' }}>
                  {b.count}x {bathroomLabel[b.type]}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: '600' }}>Times</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>In: {property.check_in_time}</span>
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Out: {property.check_out_time}</span>
            </div>
          </div>

          {/* Tabs - Vertical on Mobile, Horizontal on Desktop */}
          <div className="flex md:flex-row flex-col" style={{ gap: '0', marginBottom: '32px', borderBottom: 'none' }}>
            {/* Mobile: Vertical tabs with left border */}
            <div className="md:hidden flex flex-col w-full" style={{ borderRight: '1px solid var(--color-border)' }}>
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '16px 20px',
                    border: 'none',
                    borderLeft: activeTab === tab ? '3px solid var(--color-gold)' : '3px solid transparent',
                    borderRight: 'none',
                    borderBottom: '1px solid var(--color-border)',
                    backgroundColor: activeTab === tab ? '#f9f6f0' : 'transparent',
                    color: activeTab === tab ? 'var(--color-gold)' : 'var(--color-text-muted)',
                    fontSize: '13px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontWeight: activeTab === tab ? '700' : '500',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    textAlign: 'left' as const,
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Desktop: Horizontal tabs with bottom border */}
            <div className="hidden md:flex md:w-full" style={{ borderBottom: '1px solid var(--color-border)', overflowX: 'auto', scrollBehavior: 'smooth' }}>
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '14px 20px',
                    border: 'none',
                    borderBottom: activeTab === tab ? '2px solid var(--color-gold)' : '2px solid transparent',
                    backgroundColor: 'transparent',
                    color: activeTab === tab ? 'var(--color-gold)' : 'var(--color-text-muted)',
                    fontSize: '13px',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontWeight: activeTab === tab ? '700' : '500',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', lineHeight: '1.9', marginBottom: '32px' }}>
                {property.description}
              </p>

              <div style={cardStyle}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '16px' }}>Property Contact</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'Address', value: property.address },
                    { label: 'Phone', value: property.contact_phone },
                    { label: 'Email', value: property.contact_email },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '2px', fontWeight: '600' }}>{item.label}</p>
                        <p style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                {/* Highlight strip: key benefits */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {['Cleanliness', 'Good Locations', 'Easy Check-In', 'Functional Kitchen', 'Aesthetic Rooms', 'Pets Welcome Everywhere'].map(item => (
                    <span key={item} style={{
                      border: '1px solid var(--color-border)',
                      backgroundColor: '#ffffff',
                      color: 'var(--color-text-primary)',
                      padding: '6px 10px',
                      fontSize: '12px',
                      borderRadius: '999px',
                      fontWeight: 600,
                    }}>
                      {item}
                    </span>
                  ))}
                </div>

                <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-gold)', borderRadius: '12px', padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '6px' }}>Important: Non-Refundable Booking</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>All bookings are non-refundable. Once payment is confirmed, cancellations will not be eligible for a refund. Please review your dates carefully before booking.</p>
                  </div>
                </div>
            </div>
          )}

          {/* Amenities */}
          {activeTab === 'amenities' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                {property.amenities.map(amenity => (
                  <div key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <span style={{ color: 'var(--color-gold)', fontSize: '16px', fontWeight: '700' }}>&#10003;</span>
                    <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>{amenity}</span>
                  </div>
                ))}
                {property.pets_allowed && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                    <span style={{ color: 'var(--color-gold)', fontSize: '16px', fontWeight: '700' }}>&#10003;</span>
                    <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>Pets (+&#8377;{property.pet_charge_per_night}/pet/night)</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '16px' }}>Bathroom Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
                  {property.bathrooms_detail.map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                      <span style={{ color: 'var(--color-gold)', fontSize: '16px', fontWeight: '700' }}>&#10003;</span>
                      <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>{b.count}x {bathroomLabel[b.type]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '32px', ...cardStyle }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '16px' }}>Check In &amp; Out</h3>
                <div style={{ display: 'flex', gap: '32px' }}>
                  <div>
                    <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '600' }}>Check In</p>
                    <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{property.check_in_time}</p>
                  </div>
                  <div style={{ width: '1px', backgroundColor: 'var(--color-border)' }} />
                  <div>
                    <p style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '600' }}>Check Out</p>
                    <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{property.check_out_time}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* House Rules */}
          {activeTab === 'house rules' && (
            <div>
              <div style={cardStyle}>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '8px' }}>House Rules</h3>
                <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-gold)', marginBottom: '24px' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {property.house_rules.map((rule, i) => (
                    <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: i < property.house_rules.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                      <span style={{ color: 'var(--color-gold)', fontSize: '16px', flexShrink: 0, marginTop: '2px' }}>&#9675;</span>
                      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{rule}</p>
                    </div>
                  ))}
                </div>
              </div>

                {/* Highlight strip before non-refundable notice */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', margin: '12px 0 20px' }}>
                  {['Cleanliness', 'Good Locations', 'Ease Of Check-In', 'Functional Kitchen', 'Aesthetics Of The Room', 'Pets Welcome Everywhere'].map(item => (
                    <span key={item} style={{
                      border: '1px solid var(--color-navbar-border)',
                      backgroundColor: 'rgba(255,255,255,0.06)',
                      color: 'var(--color-navbar-text)',
                      padding: '8px 14px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      fontWeight: 600,
                    }}>
                      {item}
                    </span>
                  ))}
                </div>

                <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-gold)', borderRadius: '12px', padding: '20px 24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '6px' }}>Important: Non-Refundable Booking Policy</h4>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>All bookings are non-refundable once payment is confirmed.</p>
                  </div>
                </div>
            </div>
          )}

          {/* Location */}
          {activeTab === 'location' && (
            <div>
              <div style={cardStyle}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '16px' }}>Address</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--color-gold)', fontSize: '18px', lineHeight: '1.2' }}>•</span>
                  <div>
                    <p style={{ fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: '700', marginBottom: '4px' }}>{property.name}</p>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>{property.address}</p>
                  </div>
                </div>
              </div>

              <MapWrapper
                latitude={property.latitude}
                longitude={property.longitude}
                propertyName={property.name}
                address={property.address}
              />

              <div style={{ ...cardStyle, marginTop: '16px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '16px' }}>Contact Property</h3>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <a href={`tel:${property.contact_phone}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: '1px solid var(--color-gold)', borderRadius: '8px', color: 'var(--color-text-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                    {property.contact_phone}
                  </a>
                  <a href={`mailto:${property.contact_email}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: '1px solid var(--color-gold)', borderRadius: '8px', color: 'var(--color-text-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                    {property.contact_email}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          {activeTab === 'reviews' && (
            <div>
              <div style={{ ...cardStyle, display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '56px', color: 'var(--color-text-primary)', lineHeight: '1', fontWeight: '800' }}>{property.avg_rating}</p>
                  <p style={{ color: 'var(--color-gold)', fontSize: '20px', marginBottom: '4px' }}>{'★'.repeat(Math.floor(property.avg_rating))}</p>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{property.review_count} reviews</p>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', width: '24px' }}>{star}★</span>
                      <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px' }}>
                        <div style={{ height: '100%', backgroundColor: 'var(--color-gold)', borderRadius: '3px', width: star === 5 ? '70%' : star === 4 ? '20%' : star === 3 ? '7%' : '3%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {reviews.map(review => (
                  <div key={review.id} style={{ backgroundColor: '#ffffff', padding: '24px', border: '1px solid var(--color-border)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--color-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-primary)', fontWeight: '700', fontSize: '16px' }}>
                          {review.name[0]}
                        </div>
                        <div>
                          <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--color-text-primary)' }}>{review.name}</p>
                          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{review.date}</p>
                        </div>
                      </div>
                      <div style={{ color: 'var(--color-gold)', fontSize: '14px' }}>{'★'.repeat(review.rating)}</div>
                    </div>
                    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Widget */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '12px', padding: 'clamp(20px, 5vw, 32px)' }} className="sticky-desktop md:sticky">
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-text-primary)' }}>&#8377;{property.price_per_night.toLocaleString('en-IN')}</span>
            <span style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginLeft: '6px' }}>/ night</span>
          </div>

          <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', marginBottom: '12px' }}>
            <div className="booking-date-grid" style={{ display: 'grid', borderBottom: '1px solid var(--color-border)' }}>
              <div style={{ padding: '12px 16px', borderRight: '1px solid var(--color-border)' }}>
                <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Check In</label>
                <input type="date" value={checkIn} min={new Date().toISOString().split('T')[0]} onChange={e => setCheckIn(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '13px', color: 'var(--color-text-primary)', width: '100%', minWidth: 0, backgroundColor: 'transparent' }} />
              </div>
              <div style={{ padding: '12px 16px' }}>
                <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Check Out</label>
                <input type="date" value={checkOut} min={checkIn || new Date().toISOString().split('T')[0]} onChange={e => setCheckOut(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '13px', color: 'var(--color-text-primary)', width: '100%', minWidth: 0, backgroundColor: 'transparent' }} />
              </div>
            </div>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
              <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px', fontWeight: '600' }}>Guests</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <button onClick={() => setGuests(Math.max(1, guests - 1))} style={{ border: '1px solid var(--color-border)', backgroundColor: '#ffffff', width: '36px', height: '36px', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', fontWeight: '700' }}>−</button>
                <span style={{ minWidth: '45px', textAlign: 'center', fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{guests}</span>
                <button onClick={() => setGuests(Math.min(property.max_guests, guests + 1))} style={{ border: '1px solid var(--color-border)', backgroundColor: '#ffffff', width: '36px', height: '36px', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', fontWeight: '700' }}>+</button>
              </div>
            </div>
            {property.pets_allowed && (
              <div style={{ padding: '12px 16px' }}>
                <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px', fontWeight: '600' }}>Pets (+&#8377;{property.pet_charge_per_night}/pet/night)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <button onClick={() => setPets(Math.max(0, pets - 1))} style={{ border: '1px solid var(--color-border)', backgroundColor: '#ffffff', width: '36px', height: '36px', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', fontWeight: '700' }}>−</button>
                  <span style={{ minWidth: '45px', textAlign: 'center', fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)' }}>{pets}</span>
                  <button onClick={() => setPets(Math.min(4, pets + 1))} style={{ border: '1px solid var(--color-border)', backgroundColor: '#ffffff', width: '36px', height: '36px', fontSize: '16px', cursor: 'pointer', borderRadius: '4px', fontWeight: '700' }}>+</button>
                </div>
              </div>
            )}
          </div>

          {nights > 0 && (
            <div style={{ backgroundColor: 'var(--color-bg-soft)', padding: '16px', marginBottom: '16px', fontSize: '14px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--color-text-secondary)' }}>
                <span>&#8377;{property.price_per_night.toLocaleString('en-IN')} x {nights} nights</span>
                <span>&#8377;{basePrice.toLocaleString('en-IN')}</span>
              </div>
              {pets > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--color-text-secondary)' }}>
                  <span>{pets} pet{pets > 1 ? 's' : ''} x {nights} nights</span>
                  <span>&#8377;{petCharge.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--color-text-secondary)' }}>
                <span>Cleaning fee</span>
                <span>&#8377;{property.cleaning_fee.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: 'var(--color-text-primary)', fontSize: '15px' }}>
                <span>Total</span>
                <span>&#8377;{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {property.min_nights > 1 && (
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px', textAlign: 'center' }}>
              Minimum stay: {property.min_nights} nights
            </p>
          )}

          <button onClick={handleBook} style={{ width: '100%', backgroundColor: 'var(--color-gold)', color: 'var(--color-text-primary)', border: 'none', padding: '18px', fontSize: '14px', letterSpacing: '2px', fontWeight: '700', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '12px', borderRadius: '8px' }}>
            Reserve Now
          </button>

          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', lineHeight: '1.6' }}>
            Important: This booking is <strong>non-refundable</strong>
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
