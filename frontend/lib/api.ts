import type { Property, PropertyImage, Review } from "@/lib/types"

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"

export type ApiFetcher = (url: string, options?: RequestInit) => Promise<Response>

export const buildApiUrl = (path: string) => {
  if (path.startsWith("http")) return path
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type SavePropertyOptions = {
  isEdit?: boolean
}

export type PropertyGroupMember = {
  id: string
  property_id: string
  is_whole_property: boolean
  property: Pick<Property, "id" | "name" | "city" | "state" | "is_published">
}

export type PropertyGroup = {
  id: string
  name: string
  created_at: string
  members: PropertyGroupMember[]
}

export type PropertyImageUpdatePayload = {
  is_primary?: boolean
  display_order?: number
}

export type CreateReviewPayload = {
  property_id: string
  guest_name: string
  rating: number
  comment?: string
  platform?: string
  created_at?: string
}

export type AdminDashboard = {
  total_bookings: number
  total_properties: number
  total_revenue: number
  pending_bookings: number
}

export type AdminBooking = {
  id: string
  booking_ref: string
  property_id: string
  guest_id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  check_in: string
  check_out: string
  guests: number
  pets: number
  nights: number
  base_price: number
  cleaning_fee: number
  pet_charge: number
  total: number
  status: string
  created_at: string
  is_shadow_block: boolean
}

export type AdminBookingList = {
  items: AdminBooking[]
  total: number
  page: number
  limit: number
}

export type ListAdminBookingsParams = {
  search?: string
  status?: string
  page?: number
  limit?: number
}

export type ICalLink = {
  id: string
  property_id: string
  calendar_name: string
  ical_url: string
  direction: "import" | "export"
  last_synced: string | null
  created_at: string
}

export type ICalLinkCreate = {
  calendar_name: string
  ical_url: string
  direction: "import" | "export"
}

// ─── User dashboard types ─────────────────────────────────────────────────────

export type UserDashboard = {
  upcoming_bookings: number
  past_stays: number
  total_spent: number
  profile: {
    id: string
    email: string
    full_name: string
    phone: string | null
    role: string
  }
}

export type MyBooking = {
  id: string
  booking_ref: string
  property_id: string
  check_in: string
  check_out: string
  guests: number
  pets: number
  nights: number
  base_price: number
  cleaning_fee: number
  pet_charge: number
  total: number
  status: string
  payment_status: string
  guest_name: string
  guest_email: string
  guest_phone: string | null
  created_at: string
}

export type MyBookingList = {
  items: MyBooking[]
  total: number
  page: number
  limit: number
}

export type ListMyBookingsParams = {
  status?: string
  page?: number
  limit?: number
}

// ─── Payment types ─────────────────────────────────────────────────────────────

export type BookingCreate = {
  property_id: string
  check_in: string   // "YYYY-MM-DD"
  check_out: string  // "YYYY-MM-DD"
  guests: number
  pets: number
}

export type PaymentOrderOut = {
  payment_id: string
  razorpay_order_id: string
  amount: number   // paise
  currency: string
  key_id: string
}

export type PaymentVerifyIn = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

export type PaymentOut = {
  id: string
  booking_id: string
  razorpay_order_id: string
  razorpay_payment_id: string | null
  amount: number
  currency: string
  status: string
  created_at: string
}

// ─── Properties ───────────────────────────────────────────────────────────────

export async function listAdminProperties(fetcher: ApiFetcher): Promise<Property[]> {
  const response = await fetcher(buildApiUrl("/admin/properties"))
  if (!response.ok) throw new Error(`Failed to load properties (${response.status})`)
  return response.json()
}

export async function saveProperty(
  property: Property,
  options: SavePropertyOptions = {},
  fetcher: ApiFetcher,
) {
  const isEdit = Boolean(options.isEdit)
  const endpoint = isEdit ? `/admin/properties/${property.id}` : "/admin/properties"
  const response = await fetcher(buildApiUrl(endpoint), {
    method: isEdit ? "PATCH" : "POST",
    body: JSON.stringify(property),
  })
  if (!response.ok) throw new Error(`Failed to save property (${response.status})`)
  return response.json() as Promise<Property>
}

export async function deleteAdminProperty(propertyId: string, fetcher: ApiFetcher): Promise<void> {
  const response = await fetcher(buildApiUrl(`/admin/properties/${propertyId}`), {
    method: "DELETE",
  })
  if (!response.ok) throw new Error(`Failed to delete property (${response.status})`)
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export async function getAdminDashboard(fetcher: ApiFetcher): Promise<AdminDashboard> {
  const response = await fetcher(buildApiUrl("/admin/dashboard"))
  if (!response.ok) throw new Error(`Failed to load dashboard (${response.status})`)
  return response.json()
}

// ─── Admin Bookings ───────────────────────────────────────────────────────────

export async function listAdminBookings(
  params: ListAdminBookingsParams = {},
  fetcher: ApiFetcher,
): Promise<AdminBookingList> {
  const qs = new URLSearchParams()
  if (params.search) qs.set("search", params.search)
  if (params.status) qs.set("status", params.status)
  if (params.page) qs.set("page", String(params.page))
  if (params.limit) qs.set("limit", String(params.limit))
  const response = await fetcher(buildApiUrl(`/bookings/admin/all?${qs.toString()}`))
  if (!response.ok) throw new Error(`Failed to load bookings (${response.status})`)
  return response.json()
}

export async function updateAdminBookingStatus(
  bookingId: string,
  status: string,
  fetcher: ApiFetcher,
): Promise<AdminBooking> {
  const response = await fetcher(buildApiUrl(`/bookings/admin/${bookingId}`), {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })
  if (!response.ok) throw new Error(`Failed to update booking (${response.status})`)
  return response.json()
}

// ─── Property Images ──────────────────────────────────────────────────────────

export async function updateAdminPropertyImage(
  imageId: string,
  data: PropertyImageUpdatePayload,
  fetcher: ApiFetcher,
): Promise<PropertyImage> {
  const response = await fetcher(buildApiUrl(`/admin/images/${imageId}`), {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`Failed to update property image (${response.status})`)
  return response.json()
}

export async function deleteAdminPropertyImage(imageId: string, fetcher: ApiFetcher): Promise<void> {
  const response = await fetcher(buildApiUrl(`/admin/images/${imageId}`), { method: "DELETE" })
  if (!response.ok) throw new Error(`Failed to delete property image (${response.status})`)
}

// ─── Property Groups ──────────────────────────────────────────────────────────

export async function listPropertyGroups(fetcher: ApiFetcher): Promise<PropertyGroup[]> {
  const response = await fetcher(buildApiUrl("/admin/groups"))
  if (!response.ok) throw new Error(`Failed to load property groups (${response.status})`)
  return response.json()
}

export async function createPropertyGroup(name: string, fetcher: ApiFetcher): Promise<PropertyGroup> {
  const response = await fetcher(buildApiUrl("/admin/groups"), {
    method: "POST",
    body: JSON.stringify({ name }),
  })
  if (!response.ok) throw new Error(`Failed to create group (${response.status})`)
  return response.json()
}

export async function addPropertyGroupMember(
  groupId: string,
  propertyId: string,
  isWholeProperty: boolean,
  fetcher: ApiFetcher,
): Promise<PropertyGroup> {
  const response = await fetcher(buildApiUrl(`/admin/groups/${groupId}/members`), {
    method: "POST",
    body: JSON.stringify({ property_id: propertyId, is_whole_property: isWholeProperty }),
  })
  if (!response.ok) throw new Error(`Failed to add group member (${response.status})`)
  return response.json()
}

export async function updatePropertyGroupMember(
  groupId: string,
  memberId: string,
  isWholeProperty: boolean,
  fetcher: ApiFetcher,
): Promise<PropertyGroup> {
  const response = await fetcher(buildApiUrl(`/admin/groups/${groupId}/members/${memberId}`), {
    method: "PATCH",
    body: JSON.stringify({ is_whole_property: isWholeProperty }),
  })
  if (!response.ok) throw new Error(`Failed to update group member (${response.status})`)
  return response.json()
}

export async function removePropertyGroupMember(
  groupId: string,
  memberId: string,
  fetcher: ApiFetcher,
): Promise<PropertyGroup> {
  const response = await fetcher(buildApiUrl(`/admin/groups/${groupId}/members/${memberId}`), {
    method: "DELETE",
  })
  if (!response.ok) throw new Error(`Failed to remove group member (${response.status})`)
  return response.json()
}

export async function updatePropertyGroup(
  groupId: string,
  name: string,
  fetcher: ApiFetcher,
): Promise<PropertyGroup> {
  const response = await fetcher(buildApiUrl(`/admin/groups/${groupId}`), {
    method: "PUT",
    body: JSON.stringify({ name }),
  })
  if (!response.ok) throw new Error(`Failed to update group (${response.status})`)
  return response.json()
}

export async function deletePropertyGroup(groupId: string, fetcher: ApiFetcher): Promise<void> {
  const response = await fetcher(buildApiUrl(`/admin/groups/${groupId}`), { method: "DELETE" })
  if (!response.ok) throw new Error(`Failed to delete group (${response.status})`)
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function fetchPropertyReviews(propertyId: string): Promise<Review[]> {
  const response = await fetch(buildApiUrl(`/properties/${propertyId}/reviews`))
  if (!response.ok) throw new Error(`Failed to fetch reviews (${response.status})`)
  return response.json()
}

export async function createAdminReview(
  data: CreateReviewPayload,
  fetcher: ApiFetcher,
): Promise<Review> {
  const response = await fetcher(buildApiUrl("/admin/reviews"), {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`Failed to create review (${response.status})`)
  return response.json()
}

export async function deleteAdminReview(reviewId: string, fetcher: ApiFetcher): Promise<void> {
  const response = await fetcher(buildApiUrl(`/admin/reviews/${reviewId}`), { method: "DELETE" })
  if (!response.ok) throw new Error(`Failed to delete review (${response.status})`)
}

// ─── iCal ─────────────────────────────────────────────────────────────────────

export function getICalExportUrl(propertyId: string): string {
  return buildApiUrl(`/ical/export/${propertyId}`)
}

export async function listICalLinks(propertyId: string, fetcher: ApiFetcher): Promise<ICalLink[]> {
  const response = await fetcher(buildApiUrl(`/ical/properties/${propertyId}/links`))
  if (!response.ok) throw new Error(`Failed to load iCal links (${response.status})`)
  return response.json()
}

export async function createICalLink(
  propertyId: string,
  data: ICalLinkCreate,
  fetcher: ApiFetcher,
): Promise<ICalLink> {
  const response = await fetcher(buildApiUrl(`/ical/properties/${propertyId}/links`), {
    method: "POST",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`Failed to save iCal link (${response.status})`)
  return response.json()
}

export async function deleteICalLink(linkId: string, fetcher: ApiFetcher): Promise<void> {
  const response = await fetcher(buildApiUrl(`/ical/links/${linkId}`), { method: "DELETE" })
  if (!response.ok) throw new Error(`Failed to delete iCal link (${response.status})`)
}

// ─── User Dashboard ───────────────────────────────────────────────────────────

export async function getUserDashboard(fetcher: ApiFetcher): Promise<UserDashboard> {
  const response = await fetcher(buildApiUrl("/users/dashboard"))
  if (!response.ok) throw new Error(`Failed to load dashboard (${response.status})`)
  return response.json()
}

export async function listMyBookings(
  params: ListMyBookingsParams,
  fetcher: ApiFetcher,
): Promise<MyBookingList> {
  const query = new URLSearchParams()
  if (params.status) query.set("status", params.status)
  if (params.page)   query.set("page",   String(params.page))
  if (params.limit)  query.set("limit",  String(params.limit))
  const qs = query.toString()
  const response = await fetcher(buildApiUrl(`/bookings/mine${qs ? `?${qs}` : ""}`)) 
  if (!response.ok) throw new Error(`Failed to load bookings (${response.status})`)
  return response.json()
}

export async function updateUserProfile(
  data: { full_name?: string; phone?: string },
  fetcher: ApiFetcher,
): Promise<{ id: string; email: string; full_name: string; phone: string | null; role: string }> {
  const response = await fetcher(buildApiUrl("/users/profile"), {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`Failed to update profile (${response.status})`)
  return response.json()
}

export async function changeUserPassword(
  data: { old_password: string; new_password: string },
  fetcher: ApiFetcher,
): Promise<void> {
  const response = await fetcher(buildApiUrl("/users/password"), {
    method: "PATCH",
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail || `Failed to change password (${response.status})`)
  }
}

export async function getPublicProperty(propertyId: string): Promise<Property> {
  const response = await fetch(buildApiUrl(`/properties/${propertyId}`))
  if (!response.ok) throw new Error(`Property not found (${response.status})`)
  return response.json()
}

// ── Bookings ─────────────────────────────────────────────────────────────────────────────────

export async function createBooking(
  data: BookingCreate,
  fetcher: ApiFetcher,
): Promise<MyBooking> {
  const response = await fetcher(buildApiUrl('/bookings'), {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail || `Booking failed (${response.status})`)
  }
  return response.json()
}

// ── Payments ────────────────────────────────────────────────────────────────────────────────

export async function createPaymentOrder(
  bookingId: string,
  fetcher: ApiFetcher,
): Promise<PaymentOrderOut> {
  const response = await fetcher(buildApiUrl('/payments/create-order'), {
    method: 'POST',
    body: JSON.stringify({ booking_id: bookingId }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail || `Failed to create payment order (${response.status})`)
  }
  return response.json()
}

export async function verifyPayment(
  data: PaymentVerifyIn,
  fetcher: ApiFetcher,
): Promise<MyBooking> {
  const response = await fetcher(buildApiUrl('/payments/verify'), {
    method: 'POST',
    body: JSON.stringify(data),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail || `Payment verification failed (${response.status})`)
  }
  return response.json()
}

export async function triggerRefund(
  paymentId: string,
  fetcher: ApiFetcher,
): Promise<PaymentOut> {
  const response = await fetcher(buildApiUrl(`/payments/${paymentId}/refund`), {
    method: 'POST',
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { detail?: string }).detail || `Refund failed (${response.status})`)
  }
  return response.json()
}

export async function getPaymentForBooking(
  bookingId: string,
  fetcher: ApiFetcher,
): Promise<PaymentOut> {
  const response = await fetcher(buildApiUrl(`/payments/booking/${bookingId}`))
  if (!response.ok) throw new Error(`Payment not found (${response.status})`)
  return response.json()
}

export async function updateAdminBookingWithRefund(
  bookingId: string,
  status: string,
  paymentId: string | undefined,
  fetcher: ApiFetcher,
): Promise<AdminBooking> {
  // If cancelling a paid booking, trigger refund first
  if (status === 'cancelled' && paymentId) {
    await triggerRefund(paymentId, fetcher).catch(() => {
      // Refund may fail if already refunded — continue with cancellation
    })
  }
  return updateAdminBookingStatus(bookingId, status, fetcher)
}