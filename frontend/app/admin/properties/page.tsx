// 'use client'

// import { useState, type FormEvent } from 'react'
// import Image from 'next/image'
// import Link from 'next/link'
// import { useSearchParams } from 'next/navigation'
// import { dummyProperties } from '@/lib/data/properties'
// import type { Property } from '@/lib/types'

// type PropertyDraft = {
//   name: string
//   description: string
//   address: string
//   city: string
//   state: string
//   country: string
//   price_per_night: string
//   cleaning_fee: string
//   max_guests: string
//   bedrooms: string
//   bathrooms: string
//   min_nights: string
//   pets_allowed: boolean
//   pet_charge_per_night: string
//   check_in_time: string
//   check_out_time: string
//   contact_phone: string
//   contact_email: string
//   latitude: string
//   longitude: string
//   avg_rating: string
//   review_count: string
//   is_published: boolean
//   amenities: string
//   house_rules: string
//   primary_image_url: string
//   secondary_image_url: string
// }

// const navLinkStyle = {
//   color: 'var(--color-navbar-text)',
//   fontSize: '13px',
//   letterSpacing: '1px',
//   textDecoration: 'none',
//   textTransform: 'uppercase' as const,
//   fontWeight: '500' as const,
//   transition: 'color 0.2s ease',
// }

// function createDraft(property?: Property): PropertyDraft {
//   return {
//     name: property?.name ?? '',
//     description: property?.description ?? '',
//     address: property?.address ?? '',
//     city: property?.city ?? '',
//     state: property?.state ?? '',
//     country: property?.country ?? 'India',
//     price_per_night: property?.price_per_night?.toString() ?? '',
//     cleaning_fee: property?.cleaning_fee?.toString() ?? '',
//     max_guests: property?.max_guests?.toString() ?? '',
//     bedrooms: property?.bedrooms?.toString() ?? '',
//     bathrooms: property?.bathrooms?.toString() ?? '',
//     min_nights: property?.min_nights?.toString() ?? '1',
//     pets_allowed: property?.pets_allowed ?? false,
//     pet_charge_per_night: property?.pet_charge_per_night?.toString() ?? '',
//     check_in_time: property?.check_in_time ?? '',
//     check_out_time: property?.check_out_time ?? '',
//     contact_phone: property?.contact_phone ?? '',
//     contact_email: property?.contact_email ?? '',
//     latitude: property?.latitude?.toString() ?? '',
//     longitude: property?.longitude?.toString() ?? '',
//     avg_rating: property?.avg_rating?.toString() ?? '0',
//     review_count: property?.review_count?.toString() ?? '0',
//     is_published: property?.is_published ?? true,
//     amenities: property?.amenities?.join('\n') ?? '',
//     house_rules: property?.house_rules?.join('\n') ?? '',
//     primary_image_url: property?.images.find(image => image.is_primary)?.image_url ?? property?.images[0]?.image_url ?? '',
//     secondary_image_url: property?.images[1]?.image_url ?? '',
//   }
// }

// type PropertyEditorProps = {
//   property?: Property
//   backHref: string
// }

// function PropertyEditor({ property, backHref }: PropertyEditorProps) {
//   const [draft, setDraft] = useState<PropertyDraft>(() => createDraft(property))
//   const [errors, setErrors] = useState<Record<string, string>>({})
//   const [savedMessage, setSavedMessage] = useState('')
//   const [isSaving, setIsSaving] = useState(false)

//   const updateField = <K extends keyof PropertyDraft>(field: K, value: PropertyDraft[K]) => {
//     setDraft(prev => ({ ...prev, [field]: value }))
//   }

//   const validate = () => {
//     const nextErrors: Record<string, string> = {}

//     if (!draft.name.trim()) nextErrors.name = 'Property name is required'
//     if (!draft.description.trim()) nextErrors.description = 'Description is required'
//     if (!draft.address.trim()) nextErrors.address = 'Address is required'
//     if (!draft.city.trim()) nextErrors.city = 'City is required'
//     if (!draft.state.trim()) nextErrors.state = 'State is required'
//     if (!draft.contact_email.trim()) nextErrors.contact_email = 'Contact email is required'
//     if (!draft.contact_phone.trim()) nextErrors.contact_phone = 'Contact phone is required'
//     if (!draft.price_per_night.trim()) nextErrors.price_per_night = 'Nightly price is required'
//     if (!draft.primary_image_url.trim()) nextErrors.primary_image_url = 'Primary image URL is required'

//     setErrors(nextErrors)
//     return Object.keys(nextErrors).length === 0
//   }

//   const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault()
//     setSavedMessage('')

//     if (!validate()) return

//     setIsSaving(true)
//     setTimeout(() => {
//       setIsSaving(false)
//       setSavedMessage(property ? 'Property draft updated. Connect this form to your backend to persist changes.' : 'Property draft created. Connect this form to your backend to persist it.')
//     }, 600)
//   }

//   const inputStyle = (field: keyof PropertyDraft) => ({
//     width: '100%',
//     padding: '13px 14px',
//     border: `1px solid ${errors[field] ? '#C62828' : 'var(--color-border)'}`,
//     borderRadius: '8px',
//     fontSize: '14px',
//     color: 'var(--color-text-primary)',
//     outline: 'none',
//     backgroundColor: '#ffffff',
//     boxSizing: 'border-box' as const,
//   })

//   const cardStyle = { backgroundColor: '#ffffff', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '24px' }

//   return (
//     <div style={{ backgroundColor: 'var(--color-bg-card)', minHeight: '100vh' }}>
//       <div style={{ backgroundColor: 'var(--color-navbar)', padding: '28px 24px' }}>
//         <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
//           <div>
//             <p style={{ color: 'var(--color-gold)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' }}>{property ? 'Edit Property' : 'Add Property'}</p>
//             <h1 style={{ color: 'var(--color-text-primary)', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: '800' }}>{property ? 'Update the listing details' : 'Create a new listing'}</h1>
//           </div>
//           <Link href={backHref} style={navLinkStyle} onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-gold)'} onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-navbar-text)'}>
//             Back to Admin
//           </Link>
//         </div>
//       </div>

//       <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 72px' }}>
//         {savedMessage && (
//           <div style={{ ...cardStyle, marginBottom: '20px', borderColor: '#C8E6C9', backgroundColor: '#F1F8F2', color: '#2E7D32', fontWeight: '600' }}>
//             {savedMessage}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(300px, 0.8fr)', gap: '20px', alignItems: 'start' }}>
//             <div style={{ display: 'grid', gap: '20px' }}>
//               <div style={cardStyle}>
//                 <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '18px', color: 'var(--color-text-primary)' }}>Core Details</h2>
//                 <div style={{ display: 'grid', gap: '16px' }}>
//                   <div>
//                     <label style={{ display: 'block', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '700' }}>Property Name</label>
//                     <input value={draft.name} onChange={event => updateField('name', event.target.value)} style={inputStyle('name')} />
//                     {errors.name && <p style={{ marginTop: '6px', color: '#C62828', fontSize: '12px' }}>{errors.name}</p>}
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '700' }}>Description</label>
//                     <textarea value={draft.description} onChange={event => updateField('description', event.target.value)} rows={5} style={{ ...inputStyle('description'), resize: 'vertical' }} />
//                     {errors.description && <p style={{ marginTop: '6px', color: '#C62828', fontSize: '12px' }}>{errors.description}</p>}
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '700' }}>Address</label>
//                     <input value={draft.address} onChange={event => updateField('address', event.target.value)} style={inputStyle('address')} />
//                     {errors.address && <p style={{ marginTop: '6px', color: '#C62828', fontSize: '12px' }}>{errors.address}</p>}
//                   </div>

//                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
//                     {[
//                       ['city', 'City'],
//                       ['state', 'State'],
//                       ['country', 'Country'],
//                     ].map(([field, label]) => (
//                       <div key={field}>
//                         <label style={{ display: 'block', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '700' }}>{label}</label>
//                         <input value={draft[field as keyof PropertyDraft] as string} onChange={event => updateField(field as keyof PropertyDraft, event.target.value as PropertyDraft[keyof PropertyDraft])} style={inputStyle(field as keyof PropertyDraft)} />
//                         {errors[field] && <p style={{ marginTop: '6px', color: '#C62828', fontSize: '12px' }}>{errors[field]}</p>}
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               <div style={cardStyle}>
//                 <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '18px', color: 'var(--color-text-primary)' }}>Pricing and Rules</h2>
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
//                   {[
//                     ['price_per_night', 'Price Per Night'],
//                     ['cleaning_fee', 'Cleaning Fee'],
//                     ['pet_charge_per_night', 'Pet Charge / Night'],
//                     ['max_guests', 'Max Guests'],
//                     ['bedrooms', 'Bedrooms'],
//                     ['bathrooms', 'Bathrooms'],
//                     ['min_nights', 'Minimum Nights'],
//                     ['avg_rating', 'Average Rating'],
//                     ['review_count', 'Review Count'],
//                   ].map(([field, label]) => (
//                     <div key={field}>
//                       <label style={{ display: 'block', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '700' }}>{label}</label>
//                       <input type="number" value={draft[field as keyof PropertyDraft] as string} onChange={event => updateField(field as keyof PropertyDraft, event.target.value as PropertyDraft[keyof PropertyDraft])} style={inputStyle(field as keyof PropertyDraft)} />
//                     </div>
//                   ))}
//                 </div>

//                 <div style={{ marginTop: '16px' }}>
//                   <label style={{ display: 'block', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '700' }}>House Rules</label>
//                   <textarea value={draft.house_rules} onChange={event => updateField('house_rules', event.target.value)} rows={4} placeholder="One rule per line" style={{ ...inputStyle('house_rules'), resize: 'vertical' }} />
//                 </div>

//                 <div style={{ marginTop: '16px' }}>
//                   <label style={{ display: 'block', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '700' }}>Amenities</label>
//                   <textarea value={draft.amenities} onChange={event => updateField('amenities', event.target.value)} rows={4} placeholder="One amenity per line" style={{ ...inputStyle('amenities'), resize: 'vertical' }} />
//                 </div>
//               </div>

//               <div style={cardStyle}>
//                 <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '18px', color: 'var(--color-text-primary)' }}>Operations</h2>
//                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
//                   {[
//                     ['check_in_time', 'Check In Time'],
//                     ['check_out_time', 'Check Out Time'],
//                     ['contact_phone', 'Contact Phone'],
//                     ['contact_email', 'Contact Email'],
//                     ['latitude', 'Latitude'],
//                     ['longitude', 'Longitude'],
//                   ].map(([field, label]) => (
//                     <div key={field}>
//                       <label style={{ display: 'block', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '700' }}>{label}</label>
//                       <input value={draft[field as keyof PropertyDraft] as string} onChange={event => updateField(field as keyof PropertyDraft, event.target.value as PropertyDraft[keyof PropertyDraft])} style={inputStyle(field as keyof PropertyDraft)} />
//                       {errors[field] && <p style={{ marginTop: '6px', color: '#C62828', fontSize: '12px' }}>{errors[field]}</p>}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div style={{ display: 'grid', gap: '20px' }}>
//               <div style={cardStyle}>
//                 <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '18px', color: 'var(--color-text-primary)' }}>Status and Media</h2>
//                 <div style={{ display: 'grid', gap: '16px' }}>
//                   <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '600' }}>
//                     <input type="checkbox" checked={draft.is_published} onChange={event => updateField('is_published', event.target.checked)} />
//                     Published
//                   </label>

//                   <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '600' }}>
//                     <input type="checkbox" checked={draft.pets_allowed} onChange={event => updateField('pets_allowed', event.target.checked)} />
//                     Pets allowed
//                   </label>

//                   <div>
//                     <label style={{ display: 'block', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '700' }}>Primary Image URL</label>
//                     <input value={draft.primary_image_url} onChange={event => updateField('primary_image_url', event.target.value)} style={inputStyle('primary_image_url')} />
//                     {errors.primary_image_url && <p style={{ marginTop: '6px', color: '#C62828', fontSize: '12px' }}>{errors.primary_image_url}</p>}
//                   </div>

//                   <div>
//                     <label style={{ display: 'block', fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '8px', fontWeight: '700' }}>Secondary Image URL</label>
//                     <input value={draft.secondary_image_url} onChange={event => updateField('secondary_image_url', event.target.value)} style={inputStyle('secondary_image_url')} />
//                   </div>

//                   {draft.primary_image_url && (
//                     <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--color-bg-card)' }}>
//                       <div style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3' }}>
//                         <Image src={draft.primary_image_url} alt={draft.name || 'Property preview'} fill sizes="(max-width: 768px) 100vw, 360px" style={{ objectFit: 'cover' }} />
//                       </div>
//                       <div style={{ padding: '14px 16px' }}>
//                         <p style={{ fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '4px', fontWeight: '700' }}>Preview</p>
//                         <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '700' }}>{draft.name || 'Untitled property'}</p>
//                         <p style={{ fontSize: '12px', color: 'var(--color-text-primary)' }}>{draft.city || 'City'}, {draft.state || 'State'}</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               <div style={cardStyle}>
//                 <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '14px', color: 'var(--color-text-primary)' }}>Save</h2>
//                 <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', lineHeight: '1.6', marginBottom: '18px' }}>
//                   This is a single add/edit page. Open it without an id for a fresh form, or with ?id=... to edit an existing property.
//                 </p>
//                 <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
//                   <button type="submit" disabled={isSaving} style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-text-primary)', border: 'none', padding: '12px 18px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', cursor: 'pointer', borderRadius: '8px', opacity: isSaving ? 0.8 : 1 }}>
//                     {isSaving ? 'Saving...' : property ? 'Save Changes' : 'Create Property'}
//                   </button>
//                   <Link href={backHref} style={navLinkStyle} onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-gold)'} onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-navbar-text)'}>
//                     Cancel
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   )
// }

// export default function AdminPropertyPage() {
//   const searchParams = useSearchParams()
//   const propertyId = searchParams.get('id') || ''
//   const property = dummyProperties.find(item => item.id === propertyId)

//   if (propertyId && !property) {
//     return (
//       <div style={{ backgroundColor: 'var(--color-bg-card)', minHeight: '100vh' }}>
//         <div style={{ backgroundColor: 'var(--color-navbar)', padding: '28px 24px' }}>
//           <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
//             <div>
//               <p style={{ color: 'var(--color-gold)', fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: '700' }}>Edit Property</p>
//               <h1 style={{ color: 'var(--color-text-primary)', fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: '800' }}>Property not found</h1>
//             </div>
//             <Link href="/admin" style={navLinkStyle} onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-gold)'} onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--color-navbar-text)'}>
//               Back to Admin
//             </Link>
//           </div>
//         </div>

//         <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 72px' }}>
//           <div style={cardStyle}>
//             <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: '1.7' }}>
//               The property id in the edit link does not match any demo property.
//             </p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return <PropertyEditor key={property?.id ?? 'new'} property={property} backHref="/admin" />
// }
'use client'
import Image from 'next/image'
import { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { addPropertyGroupMember, createPropertyGroup, listAdminProperties, listPropertyGroups, saveProperty, updatePropertyGroupMember } from '@/lib/api'
import { dummyProperties } from '@/lib/data/properties'
import { Property, type BathroomDetail } from '@/lib/types'

// ─── Types ───────────────────────────────────────────────────────────────────

interface PropertyEditorProps {
  property?: Property | null   // null/undefined = Add mode
  onClose?: () => void
  onSave?: (data: Partial<Property>) => void
}

type SectionId = 'basic' | 'location' | 'photos' | 'amenities' | 'pricing' | 'policies' | 'rules'

interface Section {
  id: SectionId
  label: string
  icon: string
  fields: string[]
}

type WholePropertyChoice = 'existing' | 'new'

// ─── Constants ───────────────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  { id: 'basic',     label: 'Basic Info',   icon: '◈', fields: ['name','description','bedrooms','bathrooms','max_guests','check_in_time','check_out_time','contact_phone','contact_email'] },
  { id: 'location',  label: 'Location',     icon: '◉', fields: ['address','city','state','country','latitude','longitude'] },
  { id: 'photos',    label: 'Photos',       icon: '◆', fields: ['images'] },
  { id: 'amenities', label: 'Amenities',    icon: '✦', fields: ['amenities'] },
  { id: 'pricing',   label: 'Pricing',      icon: '◇', fields: ['price_per_night','cleaning_fee','pet_charge_per_night'] },
  { id: 'policies',  label: 'Policies',     icon: '◎', fields: ['min_nights','pets_allowed','is_published'] },
  { id: 'rules',     label: 'House Rules',  icon: '◌', fields: ['house_rules'] },
]

const AMENITY_OPTIONS = [
  'WiFi', 'Pool', 'Kitchen', 'Parking', 'Air Conditioning', 'Heating',
  'Washer', 'Dryer', 'TV', 'Fireplace', 'Garden', 'BBQ Grill',
  'Beach Access', 'Mountain View', 'Lake View', 'River View',
  'Hot Tub', 'Gym', 'Workspace', 'Pet Friendly',
  'Hiking Trails', 'Bonfire', 'Camel Ride', 'Star Gazing',
  'Desert Safari', 'Restaurant', 'Spa', 'Yoga Deck',
  'Adventure Activities', 'Balcony', 'Terrace', 'Library',
]

const PREDEFINED_RULES = [
  'No smoking inside the property',
  'No loud music after 9:00 PM',
  'No parties or events',
  'Pets must be leashed in common areas',
  'No smoking or alcohol on the property',
  'Quiet hours after 10:00 PM',
  'Please respect the natural surroundings',
  'No pets allowed',
  'Heritage artefacts must not be touched',
  'Campfire only in designated areas',
  'Swimming at own risk',
  'Follow guide instructions during safari',
]

const CHECK_TIMES = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM',
]

type PropertyFormState = {
  name: string
  description: string
  bedrooms: number
  bathrooms: number
  bathrooms_detail: BathroomDetail[]
  max_guests: number
  check_in_time: string
  check_out_time: string
  contact_phone: string
  contact_email: string
  address: string
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
  images: { id: string; property_id: string; image_url: string; is_primary: boolean; display_order: number }[]
  amenities: string[]
  price_per_night: number
  cleaning_fee: number
  pet_charge_per_night: number
  min_nights: number
  pets_allowed: boolean
  is_published: boolean
  house_rules: string[]
}

const EMPTY_FORM: PropertyFormState = {
  name: '', description: '', bedrooms: 1, bathrooms: 1,
  bathrooms_detail: [{ type: 'ensuite' as const, count: 1 }],
  max_guests: 2, check_in_time: '2:00 PM', check_out_time: '11:00 AM',
  contact_phone: '', contact_email: '',
  address: '', city: '', state: '', country: 'India',
  latitude: 20.5937, longitude: 78.9629,
  images: [] as { id: string; property_id: string; image_url: string; is_primary: boolean; display_order: number }[],
  amenities: [] as string[],
  price_per_night: 5000, cleaning_fee: 800, pet_charge_per_night: 300,
  min_nights: 1, pets_allowed: false, is_published: true,
  house_rules: [] as string[],
}

function createFormFromProperty(property?: Property | null): PropertyFormState {
  if (!property) {
    return { ...EMPTY_FORM }
  }

  return {
    name: property.name,
    description: property.description,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    bathrooms_detail: property.bathrooms_detail.map(detail => ({ ...detail })),
    max_guests: property.max_guests,
    check_in_time: property.check_in_time,
    check_out_time: property.check_out_time,
    contact_phone: property.contact_phone,
    contact_email: property.contact_email,
    address: property.address,
    city: property.city,
    state: property.state,
    country: property.country,
    latitude: property.latitude,
    longitude: property.longitude,
    images: property.images.map(image => ({ ...image })),
    amenities: [...property.amenities],
    price_per_night: property.price_per_night,
    cleaning_fee: property.cleaning_fee,
    pet_charge_per_night: property.pet_charge_per_night,
    min_nights: property.min_nights,
    pets_allowed: property.pets_allowed,
    is_published: property.is_published,
    house_rules: [...property.house_rules],
  }
}

// ─── Stepper Component ────────────────────────────────────────────────────────

function Stepper({ value, onChange, min = 0, max = 20, label }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; label: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span style={{ fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: '500' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: `1px solid ${value <= min ? 'var(--color-border)' : 'var(--color-text-primary)'}`,
            backgroundColor: 'transparent', cursor: value <= min ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', color: value <= min ? '#ccc' : 'var(--color-text-primary)',
            fontWeight: '300', lineHeight: 1,
          }}
        >−</button>
        <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)', minWidth: '24px', textAlign: 'center' }}>{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: `1px solid ${value >= max ? 'var(--color-border)' : 'var(--color-text-primary)'}`,
            backgroundColor: 'transparent', cursor: value >= max ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', color: value >= max ? '#ccc' : 'var(--color-text-primary)',
            fontWeight: '300', lineHeight: 1,
          }}
        >+</button>
      </div>
    </div>
  )
}

// ─── Toggle Component ─────────────────────────────────────────────────────────

function Toggle({ value, onChange, label, description }: {
  value: boolean; onChange: (v: boolean) => void; label: string; description?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--color-border)' }}>
      <div>
        <p style={{ fontSize: '15px', color: 'var(--color-text-primary)', fontWeight: '500', marginBottom: description ? '4px' : 0 }}>{label}</p>
        {description && <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{description}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          width: '48px', height: '26px', borderRadius: '13px',
          backgroundColor: value ? 'var(--color-text-primary)' : 'var(--color-border)',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background-color 0.2s ease', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: '3px',
          left: value ? '25px' : '3px',
          width: '20px', height: '20px', borderRadius: '50%',
          backgroundColor: '#ffffff',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </button>
    </div>
  )
}

// ─── Field Label Component ────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
      {children}
    </label>
  )
}

// ─── Input Styles ─────────────────────────────────────────────────────────────

const inputStyle = {
  width: '100%', padding: '12px 14px',
  border: '1px solid var(--color-border)', borderRadius: '8px',
  fontSize: '14px', color: 'var(--color-text-primary)', outline: 'none',
  backgroundColor: '#ffffff', boxSizing: 'border-box' as const,
  fontFamily: "'Figtree', sans-serif",
}

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer', appearance: 'none' as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23888' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
}

// ─── Section Components ───────────────────────────────────────────────────────

function BasicInfoSection({ form, setForm }: { form: typeof EMPTY_FORM; setForm: (f: typeof EMPTY_FORM) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <FieldLabel>Property Name</FieldLabel>
        <input
          style={inputStyle} value={form.name} placeholder="e.g. Earthy Villa Goa"
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div>
        <FieldLabel>Description</FieldLabel>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
          value={form.description} placeholder="Describe your property and what makes it special..."
          onChange={e => setForm({ ...form, description: e.target.value })}
          rows={5}
        />
      </div>

      <div>
        <FieldLabel>Space Details</FieldLabel>
        <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0 20px' }}>
          <Stepper label="Bedrooms" value={form.bedrooms} onChange={v => setForm({ ...form, bedrooms: v })} min={1} max={20} />
          <Stepper label="Bathrooms" value={form.bathrooms} onChange={v => setForm({ ...form, bathrooms: v })} min={1} max={20} />
          <Stepper label="Max Guests" value={form.max_guests} onChange={v => setForm({ ...form, max_guests: v })} min={1} max={30} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <FieldLabel>Check-In Time</FieldLabel>
          <select style={selectStyle} value={form.check_in_time} onChange={e => setForm({ ...form, check_in_time: e.target.value })}>
            {CHECK_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <FieldLabel>Check-Out Time</FieldLabel>
          <select style={selectStyle} value={form.check_out_time} onChange={e => setForm({ ...form, check_out_time: e.target.value })}>
            {CHECK_TIMES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <FieldLabel>Contact Phone</FieldLabel>
          <input style={inputStyle} value={form.contact_phone} placeholder="+91 9874827631" onChange={e => setForm({ ...form, contact_phone: e.target.value })} />
        </div>
        <div>
          <FieldLabel>Contact Email</FieldLabel>
          <input style={inputStyle} value={form.contact_email} placeholder="staysearthy@gmail.com" onChange={e => setForm({ ...form, contact_email: e.target.value })} />
        </div>
      </div>
    </div>
  )
}

function LocationSection({ form, setForm }: { form: typeof EMPTY_FORM; setForm: (f: typeof EMPTY_FORM) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <FieldLabel>Full Address</FieldLabel>
        <input style={inputStyle} value={form.address} placeholder="Survey No. 12, Beach Road..." onChange={e => setForm({ ...form, address: e.target.value })} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <FieldLabel>City</FieldLabel>
          <input style={inputStyle} value={form.city} placeholder="Goa" onChange={e => setForm({ ...form, city: e.target.value })} />
        </div>
        <div>
          <FieldLabel>State</FieldLabel>
          <input style={inputStyle} value={form.state} placeholder="Goa" onChange={e => setForm({ ...form, state: e.target.value })} />
        </div>
      </div>
      <div>
        <FieldLabel>Country</FieldLabel>
        <input style={inputStyle} value={form.country} placeholder="India" onChange={e => setForm({ ...form, country: e.target.value })} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <FieldLabel>Latitude</FieldLabel>
          <input style={inputStyle} type="number" step="any" value={form.latitude} placeholder="20.5937" onChange={e => setForm({ ...form, latitude: parseFloat(e.target.value) || 0 })} />
        </div>
        <div>
          <FieldLabel>Longitude</FieldLabel>
          <input style={inputStyle} type="number" step="any" value={form.longitude} placeholder="78.9629" onChange={e => setForm({ ...form, longitude: parseFloat(e.target.value) || 0 })} />
        </div>
      </div>

      {/* Map preview hint */}
      <div style={{ backgroundColor: 'var(--color-bg-soft)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ fontSize: '24px' }}>📍</div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
            {form.city && form.state ? `${form.city}, ${form.state}` : 'Enter city & state above'}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Lat: {form.latitude.toFixed(4)} · Lng: {form.longitude.toFixed(4)}</p>
        </div>
      </div>
    </div>
  )
}

function PhotosSection({ form, setForm }: { form: typeof EMPTY_FORM; setForm: (f: typeof EMPTY_FORM) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    // Visual only — no real upload
    const files = Array.from(e.dataTransfer.files)
    const newImages = files.map((f, i) => ({
      id: `new-${Date.now()}-${i}`,
      property_id: '',
      image_url: URL.createObjectURL(f),
      is_primary: form.images.length === 0 && i === 0,
      display_order: form.images.length + i + 1,
    }))
    setForm({ ...form, images: [...form.images, ...newImages] })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newImages = files.map((f, i) => ({
      id: `new-${Date.now()}-${i}`,
      property_id: '',
      image_url: URL.createObjectURL(f),
      is_primary: form.images.length === 0 && i === 0,
      display_order: form.images.length + i + 1,
    }))
    setForm({ ...form, images: [...form.images, ...newImages] })
  }

  const setPrimary = (id: string) => {
    setForm({ ...form, images: form.images.map(img => ({ ...img, is_primary: img.id === id })) })
  }

  const removeImage = (id: string) => {
    const remaining = form.images.filter(img => img.id !== id)
    if (remaining.length > 0 && !remaining.some(img => img.is_primary)) {
      remaining[0].is_primary = true
    }
    setForm({ ...form, images: remaining })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Upload Zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed var(--color-border)', borderRadius: '12px',
          padding: '48px 24px', textAlign: 'center', cursor: 'pointer',
          backgroundColor: 'var(--color-bg-card)', transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-gold)'; (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-bg-card)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-bg-card)' }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📸</div>
        <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '6px' }}>Drag & drop photos here</p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>or click to browse files</p>
        <div style={{
          display: 'inline-block', backgroundColor: 'var(--color-text-primary)', color: '#ffffff',
          padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
          letterSpacing: '1px', textTransform: 'uppercase',
        }}>
          Choose Photos
        </div>
        <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      {/* Image Grid */}
      {form.images.length > 0 && (
        <div>
          <FieldLabel>Uploaded Photos ({form.images.length})</FieldLabel>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>Click a photo to set it as primary cover image</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            {form.images.map(img => (
              <div key={img.id} style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', aspectRatio: '4/3', cursor: 'pointer' }} onClick={() => setPrimary(img.id)}>
                <Image src={img.image_url} alt="" fill sizes="(max-width: 768px) 100vw, 150px" style={{ objectFit: 'cover' }} />
                {img.is_primary && (
                  <div style={{ position: 'absolute', top: '8px', left: '8px', backgroundColor: 'var(--color-gold)', color: 'var(--color-text-primary)', fontSize: '10px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.5px' }}>
                    COVER
                  </div>
                )}
                <button
                  onClick={e => { e.stopPropagation(); removeImage(img.id) }}
                  style={{
                    position: 'absolute', top: '8px', right: '8px',
                    width: '24px', height: '24px', borderRadius: '50%',
                    backgroundColor: 'rgba(0,0,0,0.6)', border: 'none',
                    color: '#fff', fontSize: '14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >×</button>
                <div style={{
                  position: 'absolute', inset: 0,
                  border: img.is_primary ? '2px solid var(--color-gold)' : '2px solid transparent',
                  borderRadius: '10px', transition: 'border-color 0.2s',
                }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AmenitiesSection({ form, setForm }: { form: typeof EMPTY_FORM; setForm: (f: typeof EMPTY_FORM) => void }) {
  const toggle = (amenity: string) => {
    const next = form.amenities.includes(amenity)
      ? form.amenities.filter(a => a !== amenity)
      : [...form.amenities, amenity]
    setForm({ ...form, amenities: next })
  }

  return (
    <div>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>
        Select all amenities available at your property. The more you add, the better guests can find your listing.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        {AMENITY_OPTIONS.map(amenity => {
          const active = form.amenities.includes(amenity)
          return (
            <button
              key={amenity}
              onClick={() => toggle(amenity)}
              style={{
                padding: '10px 16px',
                border: `1.5px solid ${active ? 'var(--color-text-primary)' : 'var(--color-border)'}`,
                borderRadius: '100px',
                backgroundColor: active ? 'var(--color-text-primary)' : '#ffffff',
                color: active ? '#ffffff' : 'var(--color-text-secondary)',
                fontSize: '13px', fontWeight: active ? '700' : '500',
                cursor: 'pointer', transition: 'all 0.15s ease',
                fontFamily: "'Figtree', sans-serif",
              }}
            >
              {amenity}
            </button>
          )
        })}
      </div>
      {form.amenities.length > 0 && (
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '20px' }}>
          {form.amenities.length} amenit{form.amenities.length === 1 ? 'y' : 'ies'} selected
        </p>
      )}
    </div>
  )
}

function PricingSection({ form, setForm }: { form: typeof EMPTY_FORM; setForm: (f: typeof EMPTY_FORM) => void }) {
  const priceInput = (label: string, value: number, key: keyof typeof EMPTY_FORM, hint?: string) => (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', color: 'var(--color-text-muted)', fontWeight: '600' }}>₹</span>
        <input
          style={{ ...inputStyle, paddingLeft: '32px' }}
          type="number" min={0} value={value}
          onChange={e => setForm({ ...form, [key]: parseInt(e.target.value) || 0 })}
        />
      </div>
      {hint && <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>{hint}</p>}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {priceInput('Nightly Rate', form.price_per_night, 'price_per_night', 'Base price per night before fees')}
      {priceInput('Cleaning Fee', form.cleaning_fee, 'cleaning_fee', 'One-time fee charged per booking')}

      <div style={{ height: '1px', backgroundColor: 'var(--color-border)' }} />

      <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0 20px' }}>
        <Toggle
          label="Allow Pets"
          description="Guests can bring pets to this property"
          value={form.pets_allowed}
          onChange={v => setForm({ ...form, pets_allowed: v })}
        />
      </div>

      {form.pets_allowed && (
        <div style={{ animation: 'fadeIn 0.2s ease' }}>
          {priceInput('Pet Charge (per pet/night)', form.pet_charge_per_night, 'pet_charge_per_night', 'Additional charge per pet per night')}
        </div>
      )}

      {/* Pricing summary card */}
      <div style={{ backgroundColor: 'var(--color-bg-soft)', borderRadius: '12px', padding: '20px' }}>
        <p style={{ fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600', marginBottom: '12px' }}>Pricing Preview</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            <span>Base nightly rate</span><span>₹{form.price_per_night.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            <span>Cleaning fee</span><span>₹{form.cleaning_fee.toLocaleString('en-IN')}</span>
          </div>
          {form.pets_allowed && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <span>Pet charge/pet/night</span><span>₹{form.pet_charge_per_night.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '4px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)' }}>
            <span>2-night total (est.)</span>
            <span>₹{(form.price_per_night * 2 + form.cleaning_fee).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PoliciesSection({
  form,
  setForm,
  availableProperties,
  groupWithPropertyId,
  setGroupWithPropertyId,
  wholePropertyChoice,
  setWholePropertyChoice,
}: {
  form: typeof EMPTY_FORM
  setForm: (f: typeof EMPTY_FORM) => void
  availableProperties: Property[]
  groupWithPropertyId: string
  setGroupWithPropertyId: (id: string) => void
  wholePropertyChoice: WholePropertyChoice
  setWholePropertyChoice: (value: WholePropertyChoice) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <FieldLabel>Minimum Stay</FieldLabel>
        <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0 20px' }}>
          <Stepper label="Minimum Nights" value={form.min_nights} onChange={v => setForm({ ...form, min_nights: v })} min={1} max={30} />
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>Guests must book at least {form.min_nights} night{form.min_nights > 1 ? 's' : ''}</p>
      </div>

      <div>
        <FieldLabel>Listing Status</FieldLabel>
        <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0 20px' }}>
          <Toggle
            label="Published"
            description={form.is_published ? 'Visible to guests on the site' : 'Hidden — guests cannot see this property'}
            value={form.is_published}
            onChange={v => setForm({ ...form, is_published: v })}
          />
        </div>
      </div>

      <div>
        <FieldLabel>Group With Existing Property (optional)</FieldLabel>
        {availableProperties.length > 0 ? (
          <>
            <select
              style={selectStyle}
              value={groupWithPropertyId}
              onChange={e => setGroupWithPropertyId(e.target.value)}
            >
              <option value="">No grouping</option>
              {availableProperties.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} · {item.city}, {item.state}
                </option>
              ))}
            </select>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
              Choose an existing property to link as a shared group for availability.
            </p>
          </>
        ) : (
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
            No other properties available for grouping.
          </p>
        )}
      </div>

      {groupWithPropertyId && (
        <div>
          <FieldLabel>Whole Property Listing</FieldLabel>
          <select
            style={selectStyle}
            value={wholePropertyChoice}
            onChange={e => setWholePropertyChoice(e.target.value as WholePropertyChoice)}
          >
            <option value="existing">Selected property</option>
            <option value="new">This listing</option>
          </select>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
            Only one listing in a group can be the whole-property listing.
          </p>
        </div>
      )}

      {/* Cancellation notice */}
      <div style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-gold)', borderRadius: '12px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠</span>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '6px' }}>Non-Refundable Policy</p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              All Earthy Stays bookings are 100% non-refundable. This policy is applied to all properties and cannot be changed per listing.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function HouseRulesSection({ form, setForm }: { form: typeof EMPTY_FORM; setForm: (f: typeof EMPTY_FORM) => void }) {
  const [customInput, setCustomInput] = useState('')

  const togglePredefined = (rule: string) => {
    const next = form.house_rules.includes(rule)
      ? form.house_rules.filter(r => r !== rule)
      : [...form.house_rules, rule]
    setForm({ ...form, house_rules: next })
  }

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (trimmed && !form.house_rules.includes(trimmed)) {
      setForm({ ...form, house_rules: [...form.house_rules, trimmed] })
      setCustomInput('')
    }
  }

  const removeRule = (rule: string) => {
    setForm({ ...form, house_rules: form.house_rules.filter(r => r !== rule) })
  }

  const isCustom = (rule: string) => !PREDEFINED_RULES.includes(rule)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Predefined chips */}
      <div>
        <FieldLabel>Common Rules</FieldLabel>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>Toggle rules that apply to your property</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {PREDEFINED_RULES.map(rule => {
            const active = form.house_rules.includes(rule)
            return (
              <button
                key={rule}
                onClick={() => togglePredefined(rule)}
                style={{
                  padding: '9px 14px',
                  border: `1.5px solid ${active ? 'var(--color-text-primary)' : 'var(--color-border)'}`,
                  borderRadius: '8px',
                  backgroundColor: active ? 'var(--color-text-primary)' : '#ffffff',
                  color: active ? '#ffffff' : 'var(--color-text-secondary)',
                  fontSize: '13px', fontWeight: active ? '600' : '400',
                  cursor: 'pointer', transition: 'all 0.15s ease',
                  fontFamily: "'Figtree', sans-serif",
                  textAlign: 'left' as const,
                }}
              >
                {active ? '✓ ' : ''}{rule}
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom rule input */}
      <div>
        <FieldLabel>Add Custom Rule</FieldLabel>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={customInput}
            placeholder="e.g. No campfires after midnight"
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
          />
          <button
            onClick={addCustom}
            disabled={!customInput.trim()}
            style={{
              padding: '12px 20px', backgroundColor: customInput.trim() ? 'var(--color-text-primary)' : 'var(--color-border)',
              color: customInput.trim() ? '#ffffff' : 'var(--color-text-muted)',
              border: 'none', borderRadius: '8px', fontSize: '13px',
              fontWeight: '700', cursor: customInput.trim() ? 'pointer' : 'not-allowed',
              fontFamily: "'Figtree', sans-serif", whiteSpace: 'nowrap',
            }}
          >
            + Add
          </button>
        </div>
      </div>

      {/* Active rules summary */}
      {form.house_rules.length > 0 && (
        <div>
          <FieldLabel>Active Rules ({form.house_rules.length})</FieldLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {form.house_rules.map((rule, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '8px', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                  <span style={{ color: 'var(--color-gold)', fontSize: '14px', flexShrink: 0 }}>○</span>
                  <span style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>{rule}</span>
                  {isCustom(rule) && (
                    <span style={{ fontSize: '10px', backgroundColor: 'var(--color-bg-soft)', color: 'var(--color-text-muted)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', flexShrink: 0 }}>CUSTOM</span>
                  )}
                </div>
                <button
                  onClick={() => removeRule(rule)}
                  style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: '18px', flexShrink: 0, padding: '0 4px' }}
                >×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Completion Calculator ────────────────────────────────────────────────────

function calcCompletion(form: typeof EMPTY_FORM, sectionId: SectionId): number {
  switch (sectionId) {
    case 'basic': {
      const fields = [form.name, form.description, form.contact_phone, form.contact_email, form.check_in_time, form.check_out_time]
      const filled = fields.filter(f => f && String(f).trim().length > 0).length
      return Math.round((filled / fields.length) * 100)
    }
    case 'location': {
      const fields = [form.address, form.city, form.state, form.country]
      const filled = fields.filter(f => f && f.trim().length > 0).length
      return Math.round((filled / fields.length) * 100)
    }
    case 'photos':
      return form.images.length >= 3 ? 100 : form.images.length >= 1 ? 50 : 0
    case 'amenities':
      return form.amenities.length >= 5 ? 100 : form.amenities.length >= 1 ? Math.round((form.amenities.length / 5) * 100) : 0
    case 'pricing':
      return form.price_per_night > 0 && form.cleaning_fee >= 0 ? 100 : form.price_per_night > 0 ? 50 : 0
    case 'policies':
      return 100
    case 'rules':
      return form.house_rules.length >= 3 ? 100 : form.house_rules.length >= 1 ? 50 : 0
    default:
      return 0
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

function PropertyEditorModal({ property, onClose, onSave }: PropertyEditorProps) {
  const isEdit = Boolean(property)
  const [activeSection, setActiveSection] = useState<SectionId>('basic')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [form, setForm] = useState<typeof EMPTY_FORM>(() => createFormFromProperty(property))
  const [availableProperties, setAvailableProperties] = useState<Property[]>([])
  const [groupWithPropertyId, setGroupWithPropertyId] = useState('')
  const [wholePropertyChoice, setWholePropertyChoice] = useState<WholePropertyChoice>('existing')

  useEffect(() => {
    // schedule updates asynchronously to avoid cascading synchronous state updates
    const t = setTimeout(() => {
      setForm(createFormFromProperty(property))
      setActiveSection('basic')
      setSaveStatus('idle')
    })
    return () => clearTimeout(t)
  }, [property])

  useEffect(() => {
    let isMounted = true
    const loadProperties = async () => {
      try {
        const useApi = process.env.NEXT_PUBLIC_USE_API === 'true'
        const properties = useApi ? await listAdminProperties() : dummyProperties
        if (isMounted) {
          setAvailableProperties(properties.filter(item => item.id !== property?.id))
          setGroupWithPropertyId('')
          setWholePropertyChoice('existing')
        }
      } catch {
        if (isMounted) {
          setAvailableProperties(dummyProperties.filter(item => item.id !== property?.id))
          setGroupWithPropertyId('')
          setWholePropertyChoice('existing')
        }
      }
    }

    loadProperties()
    return () => {
      isMounted = false
    }
  }, [property?.id])

  // Trap scroll on body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const closeEditor = () => {
    onClose?.()
  }

  const getNextPropertyId = () => {
    const maxId = dummyProperties.reduce((max, item) => {
      const parsed = Number.parseInt(item.id, 10)
      return Number.isNaN(parsed) ? max : Math.max(max, parsed)
    }, 0)
    return String(maxId + 1)
  }

  const buildPropertyPayload = (): Property => {
    const propertyId = property?.id ?? getNextPropertyId()

    const normalizedImages = form.images.map((img, index) => ({
      ...img,
      property_id: propertyId,
      display_order: index + 1,
    }))

    const images = normalizedImages.length
      ? normalizedImages
      : [{
          id: `img-${propertyId}-1`,
          property_id: propertyId,
          image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          is_primary: true,
          display_order: 1,
        }]

    return {
      id: propertyId,
      name: form.name.trim(),
      description: form.description.trim(),
      bedrooms: form.bedrooms,
      bathrooms: form.bathrooms,
      bathrooms_detail: form.bathrooms_detail,
      max_guests: form.max_guests,
      check_in_time: form.check_in_time,
      check_out_time: form.check_out_time,
      contact_phone: form.contact_phone.trim(),
      contact_email: form.contact_email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      country: form.country.trim(),
      latitude: form.latitude,
      longitude: form.longitude,
      images,
      amenities: form.amenities,
      price_per_night: form.price_per_night,
      cleaning_fee: form.cleaning_fee,
      pet_charge_per_night: form.pet_charge_per_night,
      min_nights: form.min_nights,
      pets_allowed: form.pets_allowed,
      is_published: form.is_published,
      house_rules: form.house_rules,
      avg_rating: property?.avg_rating ?? 0,
      review_count: property?.review_count ?? 0,
      created_at: property?.created_at ?? new Date().toISOString().slice(0, 10),
    }
  }

  const applyGrouping = async (saved: Property) => {
    if (!groupWithPropertyId) {
      return
    }
    const useApi = process.env.NEXT_PUBLIC_USE_API === 'true'
    if (!useApi) {
      return
    }

    const groups = await listPropertyGroups()
    const selectedProperty = availableProperties.find(item => item.id === groupWithPropertyId)
    let group = groups.find(g => g.members.some(member => member.property_id === groupWithPropertyId))

    if (!group) {
      const groupName = selectedProperty ? `${selectedProperty.name} Group` : `${saved.name} Group`
      group = await createPropertyGroup(groupName)
    }

    if (!group) {
      return
    }

    const refreshHasWhole = (current: { members: { is_whole_property: boolean }[] }) =>
      current.members.some(member => member.is_whole_property)

    let hasWhole = refreshHasWhole(group)
    const selectedMember = group.members.find(member => member.property_id === groupWithPropertyId)

    if (!selectedMember) {
      const selectedIsWhole = !hasWhole && wholePropertyChoice === 'existing'
      group = await addPropertyGroupMember(group.id, groupWithPropertyId, selectedIsWhole)
      hasWhole = refreshHasWhole(group)
    } else if (!hasWhole && wholePropertyChoice === 'existing' && !selectedMember.is_whole_property) {
      group = await updatePropertyGroupMember(group.id, selectedMember.id, true)
      hasWhole = refreshHasWhole(group)
    }

    const newMember = group.members.find(member => member.property_id === saved.id)
    if (!newMember) {
      const newIsWhole = !hasWhole && wholePropertyChoice === 'new'
      await addPropertyGroupMember(group.id, saved.id, newIsWhole)
    }
  }

  const handleSave = async () => {
    if (saveStatus === 'saving') {
      return false
    }

    setSaveStatus('saving')
    try {
      const payload = buildPropertyPayload()
      const saved = await saveProperty(payload, { isEdit })
      await applyGrouping(saved)
      const existingIndex = dummyProperties.findIndex(item => item.id === saved.id)

      if (existingIndex >= 0) {
        dummyProperties[existingIndex] = saved
      } else {
        dummyProperties.push(saved)
      }

      onSave?.(saved)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
      return true
    } catch (error) {
      console.error('Failed to save property', error)
      setSaveStatus('idle')
      return false
    }
  }

  const overallCompletion = Math.round(
    SECTIONS.reduce((acc, s) => acc + calcCompletion(form, s.id), 0) / SECTIONS.length
  )

  const activeIdx = SECTIONS.findIndex(s => s.id === activeSection)
  const isLastSection = activeIdx === SECTIONS.length - 1
  const isSaving = saveStatus === 'saving'

  return (
    <>
      {/* Backdrop (subtle) */}
      <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 100 }} onClick={closeEditor} />

      {/* Full-screen editor */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 101,
        backgroundColor: '#ffffff',
        display: 'flex', flexDirection: 'column',
        animation: 'editorSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>

        {/* ── Top Header ── */}
        <div style={{
          height: '64px', borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 24px', flexShrink: 0, backgroundColor: '#ffffff',
          position: 'relative',
        }}>
          {/* Left: close + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={closeEditor}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Close"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-primary)" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
            <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border)' }} />
            <div>
              <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-text-primary)', lineHeight: 1 }}>
                {isEdit ? (form.name || property?.name) : 'Add New Property'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {isEdit ? 'Editing property' : 'New listing'}
              </p>
            </div>
          </div>

          {/* Center: overall progress bar */}
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '200px', height: '4px', backgroundColor: 'var(--color-border)', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: `${overallCompletion}%`, backgroundColor: 'var(--color-gold)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>{overallCompletion}% complete</p>
          </div>

          {/* Right: status + save */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {saveStatus === 'saving' && (
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Saving...</span>
            )}
            {saveStatus === 'saved' && (
              <span style={{ fontSize: '13px', color: '#2E7D32', fontWeight: '600' }}>✓ Saved</span>
            )}
            <button
              onClick={() => void handleSave()}
              disabled={isSaving}
              style={{
                backgroundColor: 'var(--color-gold)',
                color: 'var(--color-text-primary)', border: 'none', padding: '10px 24px',
                borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                letterSpacing: '1px', textTransform: 'uppercase',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                fontFamily: "'Figtree', sans-serif",
              }}
            >
              {isEdit ? 'Save Changes' : 'Publish Listing'}
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ── Left Sidebar ── */}
          <div style={{
            width: '260px', flexShrink: 0, borderRight: '1px solid var(--color-border)',
            overflowY: 'auto', padding: '24px 0', backgroundColor: 'var(--color-bg-card)',
          }}>
            {SECTIONS.map(section => {
              const completion = calcCompletion(form, section.id)
              const isActive = activeSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  style={{
                    width: '100%', padding: '14px 20px',
                    border: 'none', textAlign: 'left',
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--color-text-primary)' : '3px solid transparent',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    fontFamily: "'Figtree', sans-serif",
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '14px', color: isActive ? 'var(--color-text-primary)' : 'var(--color-gold)' }}>{section.icon}</span>
                      <span style={{ fontSize: '14px', fontWeight: isActive ? '700' : '500', color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>
                        {section.label}
                      </span>
                    </div>
                    {/* Completion indicator */}
                    <span style={{
                      fontSize: '11px', fontWeight: '700',
                      color: completion === 100 ? '#2E7D32' : completion > 0 ? '#F57F17' : '#ccc',
                    }}>
                      {completion === 100 ? '✓' : completion > 0 ? `${completion}%` : '—'}
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  {completion > 0 && completion < 100 && (
                    <div style={{ marginTop: '6px', marginLeft: '24px', height: '2px', backgroundColor: 'var(--color-border)', borderRadius: '1px' }}>
                      <div style={{ height: '100%', width: `${completion}%`, backgroundColor: 'var(--color-gold)', borderRadius: '1px', transition: 'width 0.3s ease' }} />
                    </div>
                  )}
                </button>
              )
            })}

            {/* Sidebar footer tip */}
            <div style={{ margin: '24px 16px 0', padding: '16px', backgroundColor: 'var(--color-bg-soft)', borderRadius: '10px' }}>
              <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.6', letterSpacing: '0.2px' }}>
                💡 Complete all sections for the best listing quality. Listings with full details get more bookings.
              </p>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#ffffff' }}>
            <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 48px 80px' }}>

              {/* Section header */}
              <div style={{ marginBottom: '36px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '28px', color: 'var(--color-gold)' }}>{SECTIONS[activeIdx].icon}</span>
                  <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-text-primary)' }}>
                    {SECTIONS[activeIdx].label}
                  </h2>
                </div>
                <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--color-gold)', marginLeft: '40px' }} />
              </div>

              {/* Section content */}
              {activeSection === 'basic'     && <BasicInfoSection    form={form} setForm={setForm} />}
              {activeSection === 'location'  && <LocationSection     form={form} setForm={setForm} />}
              {activeSection === 'photos'    && <PhotosSection       form={form} setForm={setForm} />}
              {activeSection === 'amenities' && <AmenitiesSection    form={form} setForm={setForm} />}
              {activeSection === 'pricing'   && <PricingSection      form={form} setForm={setForm} />}
              {activeSection === 'policies'  && (
                <PoliciesSection
                  form={form}
                  setForm={setForm}
                  availableProperties={availableProperties}
                  groupWithPropertyId={groupWithPropertyId}
                  setGroupWithPropertyId={setGroupWithPropertyId}
                  wholePropertyChoice={wholePropertyChoice}
                  setWholePropertyChoice={setWholePropertyChoice}
                />
              )}
              {activeSection === 'rules'     && <HouseRulesSection   form={form} setForm={setForm} />}

              {/* Prev / Next section navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--color-border)' }}>
                <button
                  onClick={() => setActiveSection(SECTIONS[Math.max(0, activeIdx - 1)].id)}
                  disabled={activeIdx === 0}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 20px', border: '1px solid var(--color-border)',
                    borderRadius: '8px', backgroundColor: 'transparent',
                    color: activeIdx === 0 ? '#ccc' : 'var(--color-text-secondary)',
                    fontSize: '13px', fontWeight: '600',
                    cursor: activeIdx === 0 ? 'not-allowed' : 'pointer',
                    fontFamily: "'Figtree', sans-serif",
                  }}
                >
                  ← {activeIdx > 0 ? SECTIONS[activeIdx - 1].label : 'Back'}
                </button>
                <button
                  onClick={async () => {
                    if (isLastSection) {
                      const saved = await handleSave()
                      if (saved) {
                        closeEditor()
                      }
                      return
                    }

                    setActiveSection(SECTIONS[Math.min(SECTIONS.length - 1, activeIdx + 1)].id)
                  }}
                  disabled={isSaving}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: isSaving ? 'var(--color-border)' : isLastSection ? 'var(--color-gold)' : 'var(--color-text-primary)',
                    color: isSaving ? '#ccc' : '#ffffff',
                    fontSize: '13px', fontWeight: '700',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    fontFamily: "'Figtree', sans-serif",
                    letterSpacing: '0.5px',
                  }}
                >
                  {isLastSection ? 'Done' : SECTIONS[activeIdx + 1].label}
                  {!isLastSection && ' →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes editorSlideIn {
          from { opacity: 0; transform: scale(0.98) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}

function AdminPropertiesPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const propertyId = searchParams.get('id')
  const property = propertyId ? (dummyProperties.find(item => item.id === propertyId) ?? null) : null

  return (
    <PropertyEditorModal
      property={property}
      onClose={() => router.push('/admin')}
      onSave={() => {}}
    />
  )
}

export default function AdminPropertiesPage() {
  return (
    <Suspense fallback={null}>
      <AdminPropertiesPageContent />
    </Suspense>
  )
}
