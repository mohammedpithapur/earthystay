# Admin Panel — Fix Checklist

## Backend
- [x] `ical.py` router — Add `GET /ical/export/{property_id}` endpoint (.ics file)

## Frontend `lib/api.ts`
- [x] Remove dead localStorage auth code (`getToken`, `setToken`, `removeToken`, `authHeaders`, `login`, `register`, `logout`, `defaultProtectedFetch`)
- [x] Remove `NEXT_PUBLIC_USE_API` gates from `listAdminProperties` + `listPropertyGroups`
- [x] Add `deleteAdminProperty(id, fetcher)`
- [x] Add `getAdminDashboard(fetcher)` → `GET /admin/dashboard`
- [x] Add `listAdminBookings({ search, status, page, limit }, fetcher)` → `GET /bookings/admin/all`
- [x] Add `updateAdminBookingStatus(id, status, fetcher)` → `PATCH /bookings/admin/:id`
- [x] Add `listICalLinks(propertyId, fetcher)` → `GET /ical/properties/:id/links`
- [x] Add `createICalLink(propertyId, data, fetcher)` → `POST /ical/properties/:id/links`
- [x] Add `deleteICalLink(linkId, fetcher)` → `DELETE /ical/links/:id`

## Frontend `app/admin/page.tsx`
- [x] Overview: call `GET /admin/dashboard` on mount for real stats
- [x] Overview: load real recent bookings for the table
- [x] Bookings: replace dummyBookings with `listAdminBookings()` call
- [x] Bookings: wire status filter dropdown + search with debounce
- [x] Bookings: wire Confirm/Cancel/Complete buttons to `updateAdminBookingStatus`
- [x] Bookings: add pagination UI (prev/next, page count)
- [x] Bookings: fix "Property" column to show property name not city
- [x] Bookings: add Voucher modal (printable booking summary)
- [x] Properties: wire Delete button to `deleteAdminProperty` (with confirm)
- [x] Properties: fix Published/Unpublished badge using `property.is_published`
- [x] iCal: use real `API_BASE` export URL
- [x] iCal: load real connected calendars from API on tab open
- [x] iCal: wire Import Sync button → `createICalLink`
- [x] iCal: wire Remove button → `deleteICalLink`
