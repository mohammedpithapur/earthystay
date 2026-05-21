export type BathroomType = 'ensuite' | 'shared' | 'detached_private'

export interface BathroomDetail {
  type: BathroomType
  count: number
}

export interface PropertyImage {
  id: string
  property_id: string
  image_url: string
  is_primary: boolean
  display_order: number
}

export interface Property {
  id: string
  name: string
  description: string
  price_per_night: number
  cleaning_fee: number
  max_guests: number
  bedrooms: number
  bathrooms: number
  bathrooms_detail: BathroomDetail[]
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
  is_published: boolean
  min_nights: number
  pets_allowed: boolean
  pet_charge_per_night: number
  images: PropertyImage[]
  amenities: string[]
  avg_rating: number
  review_count: number
  created_at: string
  address: string        // full address
  contact_phone: string  // property contact number
  contact_email: string  // property contact email
  check_in_time: string  // e.g. "2:00 PM"
  check_out_time: string // e.g. "11:00 AM"
  house_rules: string[]  // list of rules
  override_house_rules?: boolean
  override_amenities?: boolean
  override_details?: boolean
  updated_at?: string
  owner_id?: string
}

export interface Booking {
  id: string
  property_id: string
  user_id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in: string
  check_out: string
  guests: number
  num_nights: number
  num_pets: number
  base_price: number
  cleaning_fee: number
  pet_charge: number
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  payment_status: 'pending' | 'paid' | 'failed'
  razorpay_order_id: string
  special_requests: string
  created_at: string
  property?: Property
}

export interface Review {
  id: string
  property_id: string
  guest_id?: string | null
  booking_id?: string | null
  guest_name: string
  platform?: string | null
  rating: number
  comment?: string | null
  created_at: string
}

export interface User {
  id: string
  email: string
  full_name: string
  phone: string
  profile_photo: string
  role: 'guest' | 'admin'
  created_at: string
}

export interface ICalLink {
  id: string
  property_id: string
  platform_name: string
  ical_url: string
  direction: 'import' | 'export'
  last_synced_at: string
  is_active: boolean
}