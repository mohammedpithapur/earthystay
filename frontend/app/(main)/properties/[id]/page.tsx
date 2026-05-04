'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { dummyProperties } from '@/lib/data/properties'

const bathroomLabel: Record<string, string> = {
  ensuite: '🛁 Private Ensuite',
  detached_private: '🚪 Detached Private',
  shared: '👥 Shared'
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

  if (!property) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 24px' }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '32px', marginBottom: '16px' }}>Property not found</h2>
        <button onClick={() => router.push('/properties')} style={{ backgroundColor: '#C9A84C', color: '#1C1C1C', border: 'none', padding: '14px 32px', fontSize: '13px', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: '700', cursor: 'pointer' }}>
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

  return (
    <div style={{ backgroundColor: '#FAF8F5', minHeight: '100vh' }}>

      {/* Photo Gallery */}
      <div style={{ backgroundColor: '#1C1C1C', padding: '8px' }}>
        <div style={{ position: 'relative', height: '500px', overflow: 'hidden', marginBottom: '8px' }}>
          <img src={property.images[activeImage]?.image_url} alt={property.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', bottom: '16px', right: '16px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#FAF8F5', padding: '6px 14px', fontSize: '13px' }}>
            {activeImage + 1} / {property.images.length}
          </div>
          {property.images.length > 1 && (
            <>
              <button onClick={() => setActiveImage(i => Math.max(0, i - 1))} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: '#FAF8F5', border: 'none', width: '44px', height: '44px', fontSize: '20px', cursor: 'pointer' }}>‹</button>
              <button onClick={() => setActiveImage(i => Math.min(property.images.length - 1, i + 1))} style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', color: '#FAF8F5', border: 'none', width: '44px', height: '44px', fontSize: '20px', cursor: 'pointer' }}>›</button>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
          {property.images.map((img, i) => (
            <img key={img.id} src={img.image_url} alt={`${property.name} ${i + 1}`} onClick={() => setActiveImage(i)}
              style={{ width: '120px', height: '80px', objectFit: 'cover', cursor: 'pointer', flexShrink: 0, opacity: activeImage === i ? 1 : 0.5, border: activeImage === i ? '2px solid #C9A84C' : '2px solid transparent', transition: 'opacity 0.2s ease' }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '48px', alignItems: 'flex-start' }}>

        {/* Left Column */}
        <div>
          {/* Badges */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#1C1C1C', color: '#C9A84C', padding: '4px 12px', fontSize: '12px', letterSpacing: '1px' }}>📍 {property.city}, {property.state}</span>
            <span style={{ backgroundColor: '#1C1C1C', color: '#FAF8F5', padding: '4px 12px', fontSize: '12px' }}>★ {property.avg_rating} ({property.review_count} reviews)</span>
            {property.pets_allowed && <span style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', padding: '4px 12px', fontSize: '12px' }}>🐾 Pets Welcome</span>}
          </div>

          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '400', color: '#1C1C1C', marginBottom: '16px', lineHeight: '1.2' }}>
            {property.name}
          </h1>

          {/* Quick Stats */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', padding: '20px 0', borderTop: '1px solid #E5E0D8', borderBottom: '1px solid #E5E0D8', marginBottom: '32px' }}>
            {[
              { icon: '👥', label: `${property.max_guests} Guests` },
              { icon: '🛏', label: `${property.bedrooms} Bedrooms` },
              { icon: '🌙', label: `Min ${property.min_nights} Nights` },
            ].map(stat => (
              <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                <span style={{ fontSize: '14px', color: '#555' }}>{stat.label}</span>
              </div>
            ))}

            {/* Bathrooms Detail */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🚿</span>
                <span style={{ fontSize: '14px', color: '#555', fontWeight: '600' }}>
                  {property.bathrooms} Bathroom{property.bathrooms > 1 ? 's' : ''}
                </span>
              </div>
              {property.bathrooms_detail.map((b, i) => (
                <div key={i} style={{ paddingLeft: '28px' }}>
                  <span style={{ fontSize: '12px', color: '#888' }}>
                    {b.count}× {bathroomLabel[b.type]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#1C1C1C', marginBottom: '16px' }}>About This Property</h2>
            <p style={{ color: '#555', fontSize: '15px', lineHeight: '1.9' }}>{property.description}</p>
          </div>

          {/* Amenities */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#1C1C1C', marginBottom: '24px' }}>Amenities</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {property.amenities.map(amenity => (
                <div key={amenity} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }}>
                  <span style={{ color: '#C9A84C', fontSize: '18px' }}>✓</span>
                  <span style={{ fontSize: '14px', color: '#1C1C1C' }}>{amenity}</span>
                </div>
              ))}
              {property.pets_allowed && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8' }}>
                  <span style={{ color: '#C9A84C', fontSize: '18px' }}>✓</span>
                  <span style={{ fontSize: '14px', color: '#1C1C1C' }}>🐾 Pets (+₹{property.pet_charge_per_night}/pet/night)</span>
                </div>
              )}
            </div>
          </div>

          {/* Non Refundable Warning */}
          <div style={{ backgroundColor: '#FFF8E7', border: '1px solid #F0D080', padding: '20px 24px', marginBottom: '40px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#1C1C1C', marginBottom: '6px', letterSpacing: '0.5px' }}>Non-Refundable Booking</h4>
              <p style={{ fontSize: '13px', color: '#555', lineHeight: '1.6' }}>All bookings are non-refundable. Once payment is confirmed, cancellations will not be eligible for a refund. Please review your dates carefully before booking.</p>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '24px', color: '#1C1C1C' }}>Guest Reviews</h2>
              <span style={{ backgroundColor: '#1C1C1C', color: '#C9A84C', padding: '4px 12px', fontSize: '14px', fontWeight: '600' }}>★ {property.avg_rating}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {reviews.map(review => (
                <div key={review.id} style={{ backgroundColor: '#FFFFFF', padding: '24px', border: '1px solid #E5E0D8' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', backgroundColor: '#C9A84C', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1C1C1C', fontWeight: '700', fontSize: '16px' }}>
                        {review.name[0]}
                      </div>
                      <div>
                        <p style={{ fontWeight: '600', fontSize: '14px', color: '#1C1C1C' }}>{review.name}</p>
                        <p style={{ fontSize: '12px', color: '#888' }}>{review.date}</p>
                      </div>
                    </div>
                    <div style={{ color: '#C9A84C', fontSize: '14px' }}>{'★'.repeat(review.rating)}</div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.7' }}>{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Widget */}
        <div style={{ position: 'sticky', top: '100px', backgroundColor: '#FFFFFF', border: '1px solid #E5E0D8', padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontFamily: 'Georgia, serif', fontSize: '32px', fontWeight: '600', color: '#1C1C1C' }}>₹{property.price_per_night.toLocaleString('en-IN')}</span>
            <span style={{ fontSize: '14px', color: '#888', marginLeft: '6px' }}>/ night</span>
          </div>

          <div style={{ border: '1px solid #E5E0D8', marginBottom: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #E5E0D8' }}>
              <div style={{ padding: '12px 16px', borderRight: '1px solid #E5E0D8' }}>
                <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Check In</label>
                <input type="date" value={checkIn} min={new Date().toISOString().split('T')[0]} onChange={e => setCheckIn(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '13px', color: '#1C1C1C', width: '100%', backgroundColor: 'transparent' }} />
              </div>
              <div style={{ padding: '12px 16px' }}>
                <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Check Out</label>
                <input type="date" value={checkOut} min={checkIn || new Date().toISOString().split('T')[0]} onChange={e => setCheckOut(e.target.value)} style={{ border: 'none', outline: 'none', fontSize: '13px', color: '#1C1C1C', width: '100%', backgroundColor: 'transparent' }} />
              </div>
            </div>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E0D8' }}>
              <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Guests</label>
              <select value={guests} onChange={e => setGuests(Number(e.target.value))} style={{ border: 'none', outline: 'none', fontSize: '13px', color: '#1C1C1C', width: '100%', backgroundColor: 'transparent' }}>
                {Array.from({ length: property.max_guests }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            {property.pets_allowed && (
              <div style={{ padding: '12px 16px' }}>
                <label style={{ fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888', display: 'block', marginBottom: '4px', fontWeight: '600' }}>Pets 🐾 (+₹{property.pet_charge_per_night}/pet/night)</label>
                <select value={pets} onChange={e => setPets(Number(e.target.value))} style={{ border: 'none', outline: 'none', fontSize: '13px', color: '#1C1C1C', width: '100%', backgroundColor: 'transparent' }}>
                  {[0, 1, 2, 3, 4].map(n => (
                    <option key={n} value={n}>{n === 0 ? 'No Pets' : `${n} Pet${n > 1 ? 's' : ''}`}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Price Breakdown */}
          {nights > 0 && (
            <div style={{ backgroundColor: '#FAF8F5', padding: '16px', marginBottom: '16px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#555' }}>
                <span>₹{property.price_per_night.toLocaleString('en-IN')} × {nights} nights</span>
                <span>₹{basePrice.toLocaleString('en-IN')}</span>
              </div>
              {pets > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#555' }}>
                  <span>🐾 {pets} pet{pets > 1 ? 's' : ''} × {nights} nights</span>
                  <span>₹{petCharge.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#555' }}>
                <span>Cleaning fee</span>
                <span>₹{property.cleaning_fee.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ height: '1px', backgroundColor: '#E5E0D8', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#1C1C1C', fontSize: '15px' }}>
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {property.min_nights > 1 && (
            <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px', textAlign: 'center' }}>
              Minimum stay: {property.min_nights} nights
            </p>
          )}

          <button onClick={handleBook} style={{ width: '100%', backgroundColor: '#C9A84C', color: '#1C1C1C', border: 'none', padding: '18px', fontSize: '14px', letterSpacing: '2px', fontWeight: '700', textTransform: 'uppercase', cursor: 'pointer', marginBottom: '12px' }}>
            Reserve Now
          </button>

          <p style={{ fontSize: '12px', color: '#888', textAlign: 'center', lineHeight: '1.6' }}>
            ⚠️ This booking is <strong>non-refundable</strong>
          </p>
        </div>
      </div>
    </div>
  )
}