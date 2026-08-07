'use client'
import Image from 'next/image'
import React, { Suspense, useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { addPropertyGroupMember, createPropertyGroup, deleteAdminProperty, deleteAdminPropertyImage, listAdminProperties, listPropertyGroups, saveProperty, updateAdminPropertyImage, updatePropertyGroupMember, type ApiFetcher } from '@/lib/api'
import CalendarModal from './CalendarModal'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRequireAuth } from '@/lib/auth/useRequireAuth'
import { uploadPropertyImage } from '@/lib/supabase/storage'
// NOTE: admin UI now loads properties from the API via `listAdminProperties`
import { Property, type BathroomDetail, type SpaceDetail } from '@/lib/types'

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
type UploadProgressMap = Record<string, number>
type UploadErrorMap = Record<string, string>

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

const AMENITY_GROUPS: Record<string, string[]> = {
  '✨ Essentials': ['WiFi', 'Air Conditioning', 'Heating', 'Washer', 'Dryer', 'Iron', 'Workspace'],
  '🍳 Kitchen': ['Kitchen', 'Refrigerator', 'Microwave', 'Coffee Maker', 'Dishwasher', 'BBQ Grill'],
  '🛏 Bedroom & Living': ['TV', 'Fireplace', 'Balcony', 'Terrace', 'Library', 'Extra Pillows & Blankets'],
  '🏊 Outdoor & Recreation': ['Pool', 'Hot Tub', 'Garden', 'Parking', 'Beach Access', 'Hiking Trails', 'Gym', 'Bonfire'],
  '🌿 Views & Nature': ['Mountain View', 'Lake View', 'River View', 'Star Gazing'],
  '🎒 Experiences': ['Desert Safari', 'Camel Ride', 'Adventure Activities', 'Yoga Deck', 'Spa', 'Restaurant'],
  '🐾 Guest Policies': ['Pet Friendly', 'Long-term Stays Allowed', 'Self Check-in', 'Luggage Dropoff'],
}
const AMENITY_OPTIONS = Object.values(AMENITY_GROUPS).flat()

const PREDEFINED_RULES = [
  'No smoking inside the property',
  'No loud music after 10:00 PM',
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
  spaces_detail: SpaceDetail[]
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
  extra_guest_charge_per_night: number
  base_guests: number
  pet_charge_per_night: number
  min_nights: number
  pets_allowed: boolean
  max_pets: number
  is_published: boolean
  house_rules: string[]
}

type PhotosSectionProps = {
  form: typeof EMPTY_FORM
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>
  fetchWithAuth: ApiFetcher
  uploadProgress: UploadProgressMap
  uploadErrors: UploadErrorMap
  uploadNotice: string
  isUploading: boolean
  setUploadProgress: React.Dispatch<React.SetStateAction<UploadProgressMap>>
  setUploadErrors: React.Dispatch<React.SetStateAction<UploadErrorMap>>
  setUploadNotice: React.Dispatch<React.SetStateAction<string>>
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>
}

const EMPTY_FORM: PropertyFormState = {
  name: '', description: '', bedrooms: 1, bathrooms: 1,
  bathrooms_detail: [{ type: 'ensuite' as const, count: 1 }],
  spaces_detail: [] as SpaceDetail[],
  max_guests: 2, check_in_time: '2:00 PM', check_out_time: '11:00 AM',
  contact_phone: '', contact_email: '',
  address: '', city: '', state: '', country: 'India',
  latitude: 20.5937, longitude: 78.9629,
  images: [] as { id: string; property_id: string; image_url: string; is_primary: boolean; display_order: number }[],
  amenities: [] as string[],
  price_per_night: 5000, cleaning_fee: 800, extra_guest_charge_per_night: 0, base_guests: 2, pet_charge_per_night: 300,
  min_nights: 1, pets_allowed: false, max_pets: 0, is_published: true,
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
    spaces_detail: (property.spaces_detail ?? []).map((s: SpaceDetail) => ({ ...s })),
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
    extra_guest_charge_per_night: property.extra_guest_charge_per_night ?? 0,
    base_guests: property.base_guests ?? 2,
    pet_charge_per_night: property.pet_charge_per_night,
    min_nights: property.min_nights,
    pets_allowed: property.pets_allowed,
    max_pets: (property as { max_pets?: number }).max_pets ?? 0,
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
          <Stepper label="Max Guests" value={form.max_guests} onChange={v => setForm({ ...form, max_guests: v })} min={1} max={30} />
        </div>
      </div>

      {/* Bathroom Detail Section */}
      <div>
        <FieldLabel>Bathrooms ({form.bathrooms_detail.reduce((s, b) => s + b.count, 0)})</FieldLabel>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>Describe each bathroom type at your property</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
          {form.bathrooms_detail.map((bd, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select
                value={bd.type}
                onChange={e => {
                  const updated = [...form.bathrooms_detail]
                  updated[idx] = { ...updated[idx], type: e.target.value as BathroomDetail['type'] }
                  setForm({ ...form, bathrooms_detail: updated, bathrooms: updated.reduce((s, b) => s + b.count, 0) })
                }}
                style={{ ...selectStyle, flex: '1 1 140px', minWidth: '120px' }}
              >
                <option value="ensuite">Private Attached</option>
                <option value="detached_private">Private Detached</option>
                <option value="shared">Shared</option>
              </select>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '0 0 auto' }}>
                <button onClick={() => {
                  const updated = [...form.bathrooms_detail]
                  updated[idx] = { ...updated[idx], count: Math.max(1, bd.count - 1) }
                  setForm({ ...form, bathrooms_detail: updated, bathrooms: updated.reduce((s, b) => s + b.count, 0) })
                }} disabled={bd.count <= 1} style={{ width: '28px', height: '28px', border: '1px solid var(--color-border)', borderRadius: '50%', backgroundColor: 'transparent', cursor: bd.count <= 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>−</button>
                <span style={{ fontSize: '14px', fontWeight: '700', minWidth: '20px', textAlign: 'center' as const }}>{bd.count}</span>
                <button onClick={() => {
                  const updated = [...form.bathrooms_detail]
                  updated[idx] = { ...updated[idx], count: Math.min(10, bd.count + 1) }
                  setForm({ ...form, bathrooms_detail: updated, bathrooms: updated.reduce((s, b) => s + b.count, 0) })
                }} style={{ width: '28px', height: '28px', border: '1px solid var(--color-border)', borderRadius: '50%', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '14px' }}>+</button>
              </div>
              {form.bathrooms_detail.length > 1 && (
                <button onClick={() => {
                  const updated = form.bathrooms_detail.filter((_, i) => i !== idx)
                  setForm({ ...form, bathrooms_detail: updated, bathrooms: updated.reduce((s, b) => s + b.count, 0) })
                }} style={{ width: '28px', height: '28px', border: '1px solid #FFCDD2', borderRadius: '50%', backgroundColor: '#FFEBEE', color: '#C62828', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {([['ensuite', '+ Private Attached'], ['detached_private', '+ Private Detached'], ['shared', '+ Shared']] as const).map(([type, label]) => (
            <button key={type} onClick={() => {
              const updated = [...form.bathrooms_detail, { type, count: 1 }]
              setForm({ ...form, bathrooms_detail: updated, bathrooms: updated.reduce((s, b) => s + b.count, 0) })
            }} style={{ padding: '7px 14px', border: '1px dashed var(--color-border)', borderRadius: '8px', backgroundColor: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'var(--color-text-muted)', fontWeight: '600' }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Spaces Detail Section */}
      <div>
        <FieldLabel>Spaces & Areas ({form.spaces_detail.reduce((s, sp) => s + sp.count, 0)} total)</FieldLabel>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>Add spaces available at your property and specify if they are shared or private</p>
        {form.spaces_detail.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            {form.spaces_detail.map((sp, idx) => {
              const spaceLabels: Record<string, string> = {
                balcony: 'Balcony', terrace: 'Terrace', kitchen: 'Kitchen',
                hall: 'Hall', living_room: 'Living Room', dining_room: 'Dining Room', entrance: 'Entrance',
              }
              return (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    value={sp.type}
                    onChange={e => {
                      const updated = [...form.spaces_detail]
                      updated[idx] = { ...updated[idx], type: e.target.value as SpaceDetail['type'] }
                      setForm({ ...form, spaces_detail: updated })
                    }}
                    style={{ ...selectStyle, flex: '1 1 140px', minWidth: '120px' }}
                  >
                    <option value="balcony">Balcony</option>
                    <option value="terrace">Terrace</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="hall">Hall</option>
                    <option value="living_room">Living Room</option>
                    <option value="dining_room">Dining Room</option>
                    <option value="entrance">Entrance</option>
                  </select>
                  <select
                    value={sp.sharing}
                    onChange={e => {
                      const updated = [...form.spaces_detail]
                      updated[idx] = { ...updated[idx], sharing: e.target.value as SpaceDetail['sharing'] }
                      setForm({ ...form, spaces_detail: updated })
                    }}
                    style={{ ...selectStyle, flex: '1 1 120px', minWidth: '100px' }}
                  >
                    <option value="not_shared">Not Shared</option>
                    <option value="shared">Shared</option>
                  </select>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: '0 0 auto' }}>
                    <button onClick={() => {
                      const updated = [...form.spaces_detail]
                      updated[idx] = { ...updated[idx], count: Math.max(1, sp.count - 1) }
                      setForm({ ...form, spaces_detail: updated })
                    }} disabled={sp.count <= 1} style={{ width: '28px', height: '28px', border: '1px solid var(--color-border)', borderRadius: '50%', backgroundColor: 'transparent', cursor: sp.count <= 1 ? 'not-allowed' : 'pointer', fontSize: '14px' }}>−</button>
                    <span style={{ fontSize: '14px', fontWeight: '700', minWidth: '20px', textAlign: 'center' as const }}>{sp.count}</span>
                    <button onClick={() => {
                      const updated = [...form.spaces_detail]
                      updated[idx] = { ...updated[idx], count: Math.min(10, sp.count + 1) }
                      setForm({ ...form, spaces_detail: updated })
                    }} style={{ width: '28px', height: '28px', border: '1px solid var(--color-border)', borderRadius: '50%', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '14px' }}>+</button>
                  </div>
                  <button onClick={() => {
                    const updated = form.spaces_detail.filter((_, i) => i !== idx)
                    setForm({ ...form, spaces_detail: updated })
                  }} style={{ width: '28px', height: '28px', border: '1px solid #FFCDD2', borderRadius: '50%', backgroundColor: '#FFEBEE', color: '#C62828', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                </div>
              )
            })}
          </div>
        )}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['balcony', 'terrace', 'kitchen', 'hall', 'living_room', 'dining_room', 'entrance'] as const).map(type => {
            const labels: Record<string, string> = {
              balcony: '+ Balcony', terrace: '+ Terrace', kitchen: '+ Kitchen',
              hall: '+ Hall', living_room: '+ Living Room', dining_room: '+ Dining Room', entrance: '+ Entrance',
            }
            return (
              <button key={type} onClick={() => {
                const updated = [...form.spaces_detail, { type, count: 1, sharing: 'not_shared' as const }]
                setForm({ ...form, spaces_detail: updated })
              }} style={{ padding: '7px 14px', border: '1px dashed var(--color-border)', borderRadius: '8px', backgroundColor: 'transparent', fontSize: '12px', cursor: 'pointer', color: 'var(--color-text-muted)', fontWeight: '600' }}>{labels[type]}</button>
            )
          })}
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

function PhotosSection({
  form,
  setForm,
  fetchWithAuth,
  uploadProgress,
  uploadErrors,
  uploadNotice,
  isUploading,
  setUploadProgress,
  setUploadErrors,
  setUploadNotice,
  setIsUploading,
}: PhotosSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragIndexRef = React.useRef<number>(0)

  const handleReorder = (dropIdx: number) => {
    const dragIdx = dragIndexRef.current
    if (dragIdx === dropIdx) return
    setForm(prev => {
      const imgs = [...prev.images]
      const [moved] = imgs.splice(dragIdx, 1)
      imgs.splice(dropIdx, 0, moved)
      // Ensure first image is always primary
      return { ...prev, images: imgs.map((img, i) => ({ ...img, is_primary: i === 0 })) }
    })
  }
  const uploadFilesRef = useRef<Record<string, File>>({})

  const appendFiles = async (files: File[]) => {
    if (files.length === 0) return

    setUploadNotice('')
    setIsUploading(true)

    try {
      for (const [index, file] of files.entries()) {
        const tempId = `upload-${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`
        const localPreviewUrl = URL.createObjectURL(file)

        uploadFilesRef.current[tempId] = file

        setForm(prev => {
          const startIndex = prev.images.length
          return {
            ...prev,
            images: [
              ...prev.images,
              {
                id: tempId,
                property_id: '',
                image_url: localPreviewUrl,
                is_primary: prev.images.length === 0,
                display_order: startIndex + 1,
              },
            ],
          }
        })

        setUploadProgress(prev => ({ ...prev, [tempId]: 0 }))
        setUploadErrors(prev => {
          if (!prev[tempId]) return prev
          const next = { ...prev }
          delete next[tempId]
          return next
        })

        try {
          const publicUrl = await uploadPropertyImage(file, percent => {
            setUploadProgress(prev => ({ ...prev, [tempId]: percent }))
          }, fetchWithAuth)

          setForm(prev => ({
            ...prev,
            images: prev.images.map(img =>
              img.id === tempId ? { ...img, image_url: publicUrl } : img
            ),
          }))
          setUploadProgress(prev => ({ ...prev, [tempId]: 100 }))
          delete uploadFilesRef.current[tempId]
        } catch (error) {
          // Fallback: convert file to Base64 data URL so saving to backend will still succeed!
          try {
            const dataUrl = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = () => resolve(reader.result as string)
              reader.onerror = reject
              reader.readAsDataURL(file)
            })
            setForm(prev => ({
              ...prev,
              images: prev.images.map(img =>
                img.id === tempId ? { ...img, image_url: dataUrl } : img
              ),
            }))
            setUploadProgress(prev => ({ ...prev, [tempId]: 100 }))
            delete uploadFilesRef.current[tempId]
          } catch {
            const message = error instanceof Error ? error.message : 'Image upload failed'
            setUploadErrors(prev => ({ ...prev, [tempId]: message }))
            setUploadNotice('Image upload failed. Please ensure the backend container is rebuilt on EC2.')
          }
        }
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    void appendFiles(Array.from(e.dataTransfer.files))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void appendFiles(Array.from(e.target.files || []))
    e.target.value = ''
  }

  const setPrimary = (id: string) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.map(img => ({ ...img, is_primary: img.id === id })),
    }))
  }

  const removeImage = (id: string) => {
    setForm(prev => {
      const img = prev.images.find(i => i.id === id)
      if (img?.image_url.startsWith('blob:')) {
        try { URL.revokeObjectURL(img.image_url) } catch {}
      }
      const remaining = prev.images.filter(i => i.id !== id)
      if (remaining.length > 0 && !remaining.some(i => i.is_primary)) {
        remaining[0] = { ...remaining[0], is_primary: true }
      }
      return { ...prev, images: remaining }
    })

    setUploadProgress(prev => { const n = { ...prev }; delete n[id]; return n })
    setUploadErrors(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Upload Zone */}
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => { if (!isUploading) fileInputRef.current?.click() }}
        style={{
          border: '2px dashed var(--color-border)', borderRadius: '12px',
          padding: '48px 24px', textAlign: 'center', cursor: isUploading ? 'not-allowed' : 'pointer',
          backgroundColor: 'var(--color-bg-card)', transition: 'all 0.2s ease',
          opacity: isUploading ? 0.6 : 1,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-gold)'; (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-bg-card)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border)'; (e.currentTarget as HTMLDivElement).style.backgroundColor = 'var(--color-bg-card)' }}
      >
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📸</div>
        <p style={{ fontSize: '16px', fontWeight: '700', color: 'var(--color-text-primary)', marginBottom: '6px' }}>Drag & drop photos here</p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>JPG, PNG, WEBP only. Max 10MB each.</p>
        <div style={{
          display: 'inline-block', backgroundColor: 'var(--color-text-primary)', color: '#ffffff',
          padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
          letterSpacing: '1px', textTransform: 'uppercase',
        }}>
          Choose Photos
        </div>
        <input ref={fileInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }} onChange={handleFileChange} />
      </div>

      {isUploading && (
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Uploading images to secure storage...</p>
      )}

      {uploadNotice && (
        <p style={{ fontSize: '12px', color: '#C62828' }}>{uploadNotice}</p>
      )}

      {/* Airbnb-style Photo Grid */}
      {form.images.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <FieldLabel>Photos ({form.images.length} / 20)</FieldLabel>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Click a photo to set it as cover · Drag to reorder</p>
          </div>
          {/* Hero + grid layout (Airbnb style) */}
          <div style={{ display: 'grid', gridTemplateColumns: form.images.length === 1 ? '1fr' : '3fr 2fr', gridTemplateRows: '240px 240px', gap: '8px', borderRadius: '16px', overflow: 'hidden', marginBottom: '12px' }}>
            {/* Cover photo — spans 2 rows */}
            {form.images[0] && (
              <div
                style={{ gridRow: '1 / 3', position: 'relative', cursor: 'grab', backgroundColor: 'var(--color-bg-card)' }}
                draggable
                onDragStart={() => form.images[0] && dragIndexRef.current !== undefined && (dragIndexRef.current = 0)}
                onDrop={e => { e.preventDefault(); void handleReorder(0) }}
                onDragOver={e => e.preventDefault()}
                onClick={() => { void setPrimary(form.images[0].id) }}
              >
                {form.images[0].image_url ? (
                  <Image src={form.images[0].image_url} alt="" fill sizes="60vw" style={{ objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg-card)', color: 'var(--color-text-muted)', fontSize: '32px' }}>📸</div>
                )}
                {/* Loading spinning wheel overlay while photo is uploading */}
                {(form.images[0].id.startsWith('upload-') || form.images[0].image_url.startsWith('blob:') || (uploadProgress[form.images[0].id] !== undefined && uploadProgress[form.images[0].id] < 100)) && (
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', zIndex: 5 }}>
                    <div style={{ width: '32px', height: '32px', border: '3px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <span style={{ color: '#ffffff', fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px' }}>Uploading photo...</span>
                  </div>
                )}
                {/* COVER badge */}
                <div style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: 'var(--color-gold)', color: 'var(--color-text-primary)', fontSize: '10px', fontWeight: '800', padding: '4px 10px', borderRadius: '4px', letterSpacing: '0.5px' }}>COVER</div>
                {/* Drag indicator badge */}
                <div style={{ position: 'absolute', bottom: '12px', left: '12px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#ffffff', fontSize: '11px', fontWeight: '700', padding: '4px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', pointerEvents: 'none' }}>
                  <span>⋮⋮</span> Drag to reorder
                </div>
                {/* Remove button */}
                <button
                  disabled={form.images[0].id.startsWith('upload-') || form.images[0].image_url.startsWith('blob:')}
                  onClick={e => { e.stopPropagation(); removeImage(form.images[0].id) }}
                  style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 6, width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (form.images[0].id.startsWith('upload-') || form.images[0].image_url.startsWith('blob:')) ? 0.4 : 1 }}
                >×</button>
              </div>
            )}
            {/* Secondary slots 1–4 */}
            {[1, 2, 3, 4].map(slotIdx => {
              const img = form.images[slotIdx]
              const isUploading = img ? (img.id.startsWith('upload-') || img.image_url.startsWith('blob:') || (uploadProgress[img.id] !== undefined && uploadProgress[img.id] < 100)) : false
              return (
                <div
                  key={slotIdx}
                  style={{ position: 'relative', cursor: img ? 'grab' : 'default', backgroundColor: 'var(--color-bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  draggable={!!img && !isUploading}
                  onDragStart={() => { dragIndexRef.current = slotIdx }}
                  onDrop={e => { e.preventDefault(); void handleReorder(slotIdx) }}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => img && !isUploading && setPrimary(img.id)}
                >
                  {img ? (
                    <>
                      {img.image_url ? (
                        <Image src={img.image_url} alt="" fill sizes="30vw" style={{ objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-bg-card)' }} />
                      )}
                      {/* Spinning wheel overlay */}
                      {isUploading && (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', zIndex: 5 }}>
                          <div style={{ width: '24px', height: '24px', border: '3px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          <span style={{ color: '#ffffff', fontSize: '10px', fontWeight: '700' }}>Uploading...</span>
                        </div>
                      )}
                      {/* Drag handle icon on hover */}
                      {!isUploading && <div style={{ position: 'absolute', bottom: '6px', left: '6px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', pointerEvents: 'none' }}>⋮⋮ Drag</div>}
                      <button
                        disabled={isUploading}
                        onClick={e => { e.stopPropagation(); removeImage(img.id) }}
                        style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 6, width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', fontSize: '14px', cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isUploading ? 0.4 : 1 }}
                      >×</button>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--color-border)' }}>
                      <div style={{ fontSize: '24px' }}>+</div>
                      <p style={{ fontSize: '11px', marginTop: '4px' }}>Add photo</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          {/* Remaining photos (5+) in a small grid */}
          {form.images.length > 5 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px', marginBottom: '12px' }}>
              {form.images.slice(5).map((img, relIdx) => {
                const absIdx = relIdx + 5
                const isUploading = img.id.startsWith('upload-') || img.image_url.startsWith('blob:') || (uploadProgress[img.id] !== undefined && uploadProgress[img.id] < 100)
                return (
                  <div key={img.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', aspectRatio: '4/3', cursor: isUploading ? 'default' : 'grab' }}
                    draggable={!isUploading}
                    onDragStart={() => { dragIndexRef.current = absIdx }}
                    onDrop={e => { e.preventDefault(); void handleReorder(absIdx) }}
                    onDragOver={e => e.preventDefault()}
                    onClick={() => { if (!isUploading) setPrimary(img.id) }}
                  >
                    {img.image_url ? <Image src={img.image_url} alt="" fill sizes="120px" style={{ objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-bg-card)' }} />}
                    {isUploading && (
                      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
                        <div style={{ width: '18px', height: '18px', border: '2.5px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      </div>
                    )}
                    {!isUploading && <div style={{ position: 'absolute', bottom: '4px', left: '4px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '9px', padding: '2px 5px', borderRadius: '3px', pointerEvents: 'none' }}>⋮⋮</div>}
                    <button
                      disabled={isUploading}
                      onClick={e => { e.stopPropagation(); removeImage(img.id) }}
                      style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 6, width: '22px', height: '22px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.65)', border: 'none', color: '#fff', fontSize: '13px', cursor: isUploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: isUploading ? 0.4 : 1 }}
                    >×</button>
                  </div>
                )
              })}
            </div>
          )}
          <button
            onClick={() => { if (!isUploading) fileInputRef.current?.click() }}
            disabled={isUploading}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', border: '1.5px dashed var(--color-border)', borderRadius: '8px', backgroundColor: 'transparent', fontSize: '13px', cursor: isUploading ? 'not-allowed' : 'pointer', color: 'var(--color-text-muted)', fontFamily: "'Figtree', sans-serif", fontWeight: '600', opacity: isUploading ? 0.5 : 1 }}
          >+ Add more photos</button>
        </div>
      )}
    </div>
  )
}

function AmenitiesSection({ form, setForm }: { form: typeof EMPTY_FORM; setForm: (f: typeof EMPTY_FORM) => void }) {
  const [customInput, setCustomInput] = useState('')

  const toggle = (amenity: string) => {
    const next = form.amenities.includes(amenity)
      ? form.amenities.filter(a => a !== amenity)
      : [...form.amenities, amenity]
    setForm({ ...form, amenities: next })
  }

  const addCustom = () => {
    const trimmed = customInput.trim()
    if (trimmed && !form.amenities.includes(trimmed)) {
      setForm({ ...form, amenities: [...form.amenities, trimmed] })
      setCustomInput('')
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
        Select all amenities available at your property. The more you add, the better guests can find your listing.
      </p>
      {Object.entries(AMENITY_GROUPS).map(([groupName, amenities]) => (
        <div key={groupName}>
          <p style={{ fontSize: '12px', letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '700', marginBottom: '12px' }}>{groupName}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {amenities.map(amenity => {
              const active = form.amenities.includes(amenity)
              return (
                <button
                  key={amenity}
                  onClick={() => toggle(amenity)}
                  style={{
                    padding: '8px 14px',
                    border: `1.5px solid ${active ? 'var(--color-gold)' : 'var(--color-border)'}`,
                    borderRadius: '100px',
                    backgroundColor: active ? 'rgba(201,168,76,0.12)' : '#ffffff',
                    color: active ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    fontSize: '13px', fontWeight: active ? '700' : '400',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                    fontFamily: "'Figtree', sans-serif",
                  }}
                >
                  {active ? '✓ ' : ''}{amenity}
                </button>
              )
            })}
          </div>
        </div>
      ))}

      {/* Custom amenity */}
      <div>
        <FieldLabel>Add Custom Amenity</FieldLabel>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={customInput}
            placeholder="e.g. Telescope, Bonfire pit, Private chef"
            onChange={e => setCustomInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCustom()}
          />
          <button
            onClick={addCustom}
            disabled={!customInput.trim()}
            style={{
              padding: '12px 20px',
              backgroundColor: customInput.trim() ? 'var(--color-text-primary)' : 'var(--color-border)',
              color: customInput.trim() ? '#ffffff' : 'var(--color-text-muted)',
              border: 'none', borderRadius: '8px', fontSize: '13px',
              fontWeight: '700', cursor: customInput.trim() ? 'pointer' : 'not-allowed',
              fontFamily: "'Figtree', sans-serif", whiteSpace: 'nowrap' as const,
            }}
          >+ Add</button>
        </div>
      </div>

      {form.amenities.length > 0 && (
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
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
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value === 0 ? '' : value}
          placeholder="0"
          onChange={e => {
            const raw = e.target.value.replace(/[^0-9]/g, '')
            setForm({ ...form, [key]: raw === '' ? 0 : parseInt(raw, 10) || 0 })
          }}
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

      <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)', margin: 0 }}>Extra Guest Fees</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <FieldLabel>Standard Guest Capacity (Base Guests)</FieldLabel>
          <input
            style={inputStyle}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={form.base_guests === 0 ? '' : form.base_guests}
            placeholder="2"
            onChange={e => {
              const raw = e.target.value.replace(/[^0-9]/g, '')
              setForm({ ...form, base_guests: raw === '' ? 1 : Math.max(1, parseInt(raw, 10) || 1) })
            }}
          />
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>Number of guests included in the base nightly rate</p>
        </div>
        {priceInput('Extra Guest Fee (per guest/night)', form.extra_guest_charge_per_night, 'extra_guest_charge_per_night', 'Additional charge per extra guest per night')}
      </div>

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
        <div style={{ animation: 'fadeIn 0.2s ease', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <FieldLabel>Maximum Number of Pets</FieldLabel>
            <input
              style={inputStyle}
              type="number"
              min={1}
              max={10}
              value={form.max_pets || 1}
              onChange={e => setForm({ ...form, max_pets: Math.max(1, parseInt(e.target.value) || 1) })}
            />
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>How many pets can guests bring (max 10)</p>
          </div>
          {priceInput('Pet Charge (per pet/night)', form.pet_charge_per_night, 'pet_charge_per_night', 'Additional charge per pet per night')}
        </div>
      )}

      {/* Pricing summary card */}
      <div style={{ backgroundColor: 'var(--color-bg-soft)', borderRadius: '12px', padding: '20px' }}>
        <p style={{ fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: '600', marginBottom: '12px' }}>Pricing Preview</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            <span>Base nightly rate (up to {form.base_guests || 2} guests)</span><span>₹{form.price_per_night.toLocaleString('en-IN')}</span>
          </div>
          {form.extra_guest_charge_per_night > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              <span>Extra guest charge (per extra guest/night)</span><span>₹{form.extra_guest_charge_per_night.toLocaleString('en-IN')}</span>
            </div>
          )}
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
            <span>2-night base total (est.)</span>
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
  const { user, loading } = useRequireAuth({ requireAdmin: true })
  const { fetchWithAuth } = useAuth()
  const isEdit = Boolean(property)
  const [activeSection, setActiveSection] = useState<SectionId>('basic')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [form, setForm] = useState<typeof EMPTY_FORM>(() => createFormFromProperty(property))
  const [availableProperties, setAvailableProperties] = useState<Property[]>([])
  const [groupWithPropertyId, setGroupWithPropertyId] = useState('')
  const [wholePropertyChoice, setWholePropertyChoice] = useState<WholePropertyChoice>('existing')
  const [imageUploadProgress, setImageUploadProgress] = useState<UploadProgressMap>({})
  const [imageUploadErrors, setImageUploadErrors] = useState<UploadErrorMap>({})
  const [imageUploadNotice, setImageUploadNotice] = useState('')
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  const propId = property?.id
  useEffect(() => {
    setForm(createFormFromProperty(property))
    setActiveSection('basic')
    setSaveStatus('idle')
    setImageUploadProgress({})
    setImageUploadErrors({})
    setImageUploadNotice('')
    setIsUploadingImages(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propId])

  useEffect(() => {
    let isMounted = true
    const loadProperties = async () => {
      try {
        const properties = await listAdminProperties(fetchWithAuth)
        if (isMounted) {
          setAvailableProperties(properties.filter(item => item.id !== property?.id))
          setGroupWithPropertyId('')
          setWholePropertyChoice('existing')
        }
      } catch {
        if (isMounted) {
          setAvailableProperties([])
          setGroupWithPropertyId('')
          setWholePropertyChoice('existing')
        }
      }
    }

    loadProperties()

    return () => { isMounted = false }
  }, [fetchWithAuth, property?.id])

  // Trap scroll on body
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const closeEditor = () => {
    onClose?.()
  }

  const getNextPropertyId = () => {
    const combined = [...availableProperties]
    if (property) combined.push(property)
    const maxId = combined.reduce((max, item) => {
      const parsed = Number.parseInt(item.id, 10)
      return Number.isNaN(parsed) ? max : Math.max(max, parsed)
    }, 0)
    return String(maxId + 1)
  }

  const buildPropertyPayload = (): Property => {
    const propertyId = property?.id ?? getNextPropertyId()

    const validImages = form.images.filter(img => img.image_url && !img.image_url.startsWith('blob:'))
    const normalizedImages = validImages.map((img, index) => ({
      ...img,
      property_id: propertyId,
      is_primary: index === 0,
      display_order: index + 1,
    }))

    const images = normalizedImages.length
      ? normalizedImages
      : [{
          id: `img-${propertyId}-1`,
          property_id: propertyId,
          image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
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
      spaces_detail: form.spaces_detail,
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
      extra_guest_charge_per_night: form.extra_guest_charge_per_night,
      base_guests: form.base_guests,
      pet_charge_per_night: form.pet_charge_per_night,
      min_nights: form.min_nights,
      pets_allowed: form.pets_allowed,
      max_pets: form.pets_allowed ? form.max_pets : 0,
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
    const groups = await listPropertyGroups(fetchWithAuth)
    const selectedProperty = availableProperties.find(item => item.id === groupWithPropertyId)
    let group = groups.find(g => g.members.some(member => member.property_id === groupWithPropertyId))

    if (!group) {
      const groupName = selectedProperty ? `${selectedProperty.name} Group` : `${saved.name} Group`
      group = await createPropertyGroup(groupName, fetchWithAuth)
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
      group = await addPropertyGroupMember(group.id, groupWithPropertyId, selectedIsWhole, fetchWithAuth)
      hasWhole = refreshHasWhole(group)
    } else if (!hasWhole && wholePropertyChoice === 'existing' && !selectedMember.is_whole_property) {
      group = await updatePropertyGroupMember(group.id, selectedMember.id, true, fetchWithAuth)
      hasWhole = refreshHasWhole(group)
    }

    const newMember = group.members.find(member => member.property_id === saved.id)
    if (!newMember) {
      const newIsWhole = !hasWhole && wholePropertyChoice === 'new'
      await addPropertyGroupMember(group.id, saved.id, newIsWhole, fetchWithAuth)
    }
  }

  const handleSave = async () => {
    if (saveStatus === 'saving') {
      return false
    }

    const hasActiveUploads = isUploadingImages || form.images.some(img =>
      img.id.startsWith('upload-') || (imageUploadProgress[img.id] !== undefined && imageUploadProgress[img.id] < 100)
    )

    if (hasActiveUploads) {
      setImageUploadNotice('Photos are currently uploading (see spinning wheel). Please wait a moment for uploads to complete before saving.')
      setActiveSection('photos')
      setSaveStatus('idle')
      return false
    }

    if (!form.name.trim()) {
      setImageUploadNotice('Please enter a title for the property.')
      setActiveSection('basic')
      setSaveStatus('idle')
      return false
    }

    if (!form.city.trim() || !form.state.trim()) {
      setImageUploadNotice('Please specify the city and state for the property location.')
      setActiveSection('location')
      setSaveStatus('idle')
      return false
    }

    if (form.price_per_night <= 0) {
      setImageUploadNotice('Please set a valid price per night (greater than ₹0).')
      setActiveSection('pricing')
      setSaveStatus('idle')
      return false
    }

    const validImages = form.images.filter(
      img => img.image_url && (!img.image_url.startsWith('blob:') || img.image_url.startsWith('data:image'))
    )
    if (validImages.length === 0) {
      if (form.images.length > 0) {
        setImageUploadNotice('Photo upload failed. Please re-select your photo or try a smaller file.')
      } else {
        setImageUploadNotice('Please upload at least 1 photo for this property before saving.')
      }
      setActiveSection('photos')
      setSaveStatus('idle')
      return false
    }

    setSaveStatus('saving')
    try {
      const payload = buildPropertyPayload()
      const saved = await saveProperty(payload, { isEdit }, fetchWithAuth)
      await applyGrouping(saved)
      // update local available properties state (do not mutate demo data)
      setAvailableProperties(prev => {
        const idx = prev.findIndex(p => p.id === saved.id)
        if (idx >= 0) {
          const copy = [...prev]
          copy[idx] = saved
          return copy
        }
        return [saved, ...prev]
      })

      onSave?.(saved)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
      return true
    } catch (error) {
      console.error('Failed to save property', error)
      setImageUploadNotice(error instanceof Error ? error.message : 'Failed to save property')
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
  const disableSaveActions = isSaving || isUploadingImages

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

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
              disabled={disableSaveActions}
              style={{
                backgroundColor: 'var(--color-gold)',
                color: 'var(--color-text-primary)', border: 'none', padding: '10px 24px',
                borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                letterSpacing: '1px', textTransform: 'uppercase',
                cursor: disableSaveActions ? 'not-allowed' : 'pointer',
                fontFamily: "'Figtree', sans-serif",
              }}
            >
              {isUploadingImages ? 'Uploading Images...' : isEdit ? 'Save Changes' : 'Publish Listing'}
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
              {activeSection === 'photos'    && (
                <PhotosSection
                  form={form}
                  setForm={setForm}
                  fetchWithAuth={fetchWithAuth}
                  uploadProgress={imageUploadProgress}
                  uploadErrors={imageUploadErrors}
                  uploadNotice={imageUploadNotice}
                  isUploading={isUploadingImages}
                  setUploadProgress={setImageUploadProgress}
                  setUploadErrors={setImageUploadErrors}
                  setUploadNotice={setImageUploadNotice}
                  setIsUploading={setIsUploadingImages}
                />
              )}
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
                      const savedResult = await handleSave()
                      if (savedResult) {
                        closeEditor()
                      }
                      return
                    }

                    setActiveSection(SECTIONS[Math.min(SECTIONS.length - 1, activeIdx + 1)].id)
                  }}
                  disabled={disableSaveActions}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '12px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: disableSaveActions ? 'var(--color-border)' : isLastSection ? 'var(--color-gold)' : 'var(--color-text-primary)',
                    color: disableSaveActions ? '#ccc' : '#ffffff',
                    fontSize: '13px', fontWeight: '700',
                    cursor: disableSaveActions ? 'not-allowed' : 'pointer',
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
  const { fetchWithAuth } = useAuth()
  const { user, loading } = useRequireAuth({ requireAdmin: true })
  const [properties, setProperties] = useState<Property[] | null>(null)

  const load = useCallback(async () => {
    try {
      const list = await listAdminProperties(fetchWithAuth)
      setProperties(list)
    } catch {
      setProperties([])
    }
  }, [fetchWithAuth])

  useEffect(() => {
    if (loading || !user || user.role !== 'admin') {
      return
    }
    void load()
  }, [fetchWithAuth, loading, user, load])

  if (loading || !user || user.role !== 'admin' || properties === null) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg-subtle)' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid var(--color-gold)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  const property = propertyId ? (properties.find(item => item.id === propertyId) ?? null) : null

  return (
    <PropertyEditorModal
      property={property}
      onClose={() => router.push('/admin')}
      onSave={() => {
        void load()
        router.push('/admin')
      }}
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
