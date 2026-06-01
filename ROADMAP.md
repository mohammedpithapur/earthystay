# EarthyStay — Project Roadmap

> Last updated: 2026-05-31  
> Stack: Next.js 15 (App Router) + FastAPI + PostgreSQL (Supabase) + Supabase Storage

---

## Phase Overview

| # | Phase | Status | Est. Time |
|---|-------|--------|-----------|
| 1 | Foundation & Core UI | ✅ Complete | — |
| 2 | Authentication System | ✅ Complete | — |
| 3 | Property System | ✅ Complete | — |
| 4 | Booking System | ✅ Complete | — |
| 5 | Admin Panel | ✅ Complete | — |
| 6 | Reviews | ✅ Complete | — |
| 7 | User Dashboard | ✅ Complete | — |
| 8 | Forgot / Reset Password | ❌ Remaining | ~1 day |
| 9 | Payment Integration | ❌ Remaining | ~3–4 days |
| 10 | Notifications (Email + SMS) | ❌ Remaining | ~2 days |

---

## ✅ Completed Phases

### Phase 1 — Foundation & Core UI
- Next.js App Router project structure
- Design system (CSS variables, typography, color tokens)
- Homepage with hero, featured properties, testimonials
- Property listing page with filters (city, guests, pets, price)
- Property detail page (image gallery, amenities, reviews, availability calendar)
- Static pages: About, Contact, FAQ, Terms, Privacy, Corporate, Events, Wedding
- Responsive layouts, global Navbar, Footer
- Dark/light mode support

### Phase 2 — Authentication System
- Register / Login / Logout
- JWT access tokens (20 min) + HttpOnly refresh cookies (7 days)
- Auto silent token refresh before expiry
- Google OAuth (`/auth/callback`)
- `AuthContext` + `useAuth` hook + `fetchWithAuth`
- `useRequireAuth` hook with redirect-to-login + redirect-back-after-login
- Admin role guard (`requireAdmin: true`)
- Auth pages: `/login`, `/register`, `/auth/callback`

### Phase 3 — Property System
- Property listing page with API-driven filters
- Property detail page with real data from DB
- Full property CRUD in admin (multi-step form)
- Supabase image upload with drag-drop + progress bar
- Property groups (linked properties sharing availability)
- Property inheritance (group master → members inherit house rules, amenities)
- Publish / Unpublish toggle
- Admin-only property management at `/admin/properties`

### Phase 4 — Booking System
- Booking form pre-filled from logged-in user
- Pricing engine: base price × nights + cleaning fee + pet charge
- Availability calendar with blocked dates
- Conflict detection with DB-level pessimistic lock (prevents double-booking)
- Group blocking: booking one room blocks the whole-property listing
- `booking_ref` auto-generated (ES-XXXXXX format)
- iCal export (`GET /ical/export/{property_id}`) — RFC 5545 compliant
- iCal import: save external calendar URLs (Airbnb / Booking.com) to DB

### Phase 5 — Admin Panel (`/admin`)
- **Overview tab**: Real revenue, bookings, properties stats from `GET /admin/dashboard`
- **Bookings tab**: Paginated list, search (name/email/ref), status filter, Confirm/Cancel/Complete actions, Voucher modal with Print
- **Properties tab**: List all properties, Edit → full editor, Delete, Published/Draft badge
- **Groups tab**: Create/rename/delete groups, add/remove members, set master property, manage reviews
- **iCal tab**: Export URL, import external calendars, view/remove connected calendars

### Phase 6 — Reviews
- Guests can submit reviews on property detail pages
- Admin can add external reviews (imported from Airbnb/Booking.com) per group
- Admin can delete any review
- `avg_rating` and `review_count` denormalized on Property for fast reads

### Phase 7 — User Dashboard (`/dashboard`)
- Real booking stats: total, upcoming, past stays, total spent from `GET /users/dashboard`
- **Upcoming tab**: Confirmed + Pending bookings from API, grouped by status
- **Past Stays tab**: Completed bookings from API
- Property name/image fetched and cached per session
- Expandable booking cards with full details (ref, check-in/out times, address, price breakdown)
- Booking Voucher modal with Print button
- **Profile tab**: Update name + phone via `PATCH /users/profile`
- **Change Password**: `PATCH /users/password` with old/new/confirm validation
- Loading skeleton animations while API fetches
- Sign Out wired to `AuthContext.logout()`

---

## ❌ Remaining Phases

---

### Phase 8 — Forgot / Reset Password

**Current state:** Both frontend pages (`/forgot-password`, `/reset-password`) and backend routes (`POST /auth/forgot-password`, `POST /auth/reset-password`) exist but are TODO stubs — no email is sent, no token is verified.

#### What needs to be built

##### Backend (`backend/`)

- [ ] **Choose email provider** — Resend (recommended, simplest API) or SendGrid  
  Add to `requirements.txt`: `resend` or `sendgrid`  
  Add to `.env`: `RESEND_API_KEY=re_xxxx` and `FROM_EMAIL=noreply@yourdomain.com`

- [ ] **Add `password_reset_tokens` table** (or store token in Redis)  
  Fields: `id`, `user_id`, `token_hash` (bcrypt or SHA-256), `expires_at`, `used_at`  
  Alternative: encode token as a signed JWT with short expiry (15 min) — no DB table needed

- [ ] **Implement `POST /auth/forgot-password`**  
  - Look up user by email (always return 200 to prevent email enumeration)
  - Generate a secure random token (`secrets.token_urlsafe(32)`)
  - Store hashed token + expiry in DB (or sign a JWT)
  - Send reset email via Resend with link: `https://yourdomain.com/reset-password?token=<token>`

- [ ] **Implement `POST /auth/reset-password`**  
  - Receive `token` + `new_password`
  - Verify token exists, is not expired, and is not already used
  - Hash new password with bcrypt and update `users.password_hash`
  - Mark token as used (or delete it)
  - Return 200 success

- [ ] **Add email template**  
  Create `app/templates/reset_password.html` or use inline HTML  
  Brand it with EarthyStay logo, clean minimal design, CTA button

##### Frontend (`frontend/`)

- [ ] **Wire `/forgot-password` page**  
  - Email input form → POST to `GET /auth/forgot-password`
  - Show "Check your email" success state
  - Show error if email format is wrong

- [ ] **Wire `/reset-password` page**  
  - Read `?token=` from URL query params
  - New password + Confirm password inputs
  - POST to `/auth/reset-password` with token + new_password
  - On success → redirect to `/login` with success message
  - On error (expired/invalid token) → show clear error + link to try again

#### Production Notes for Phase 8
> - **Never confirm** whether an email exists in the "forgot password" response — always say "if the email exists, a link was sent" (prevents email enumeration attacks)
> - **Token expiry**: 15 minutes max for reset links
> - **Rate limit** `POST /auth/forgot-password` to 3 requests per email per hour (prevent spam)
> - **One-time use**: mark token as used immediately on successful reset
> - **Invalidate all sessions** on password reset (delete refresh token cookie)
> - Use **Resend** over SendGrid for simplicity — free tier handles up to 3,000 emails/month
> - Store `RESEND_API_KEY` in environment only, never in source code
> - Test with real email in staging before going live

---

### Phase 9 — Payment Integration

**Current state:** Bookings are created and go straight to `pending` status with no payment step. There is zero payment infrastructure in the codebase.

#### What needs to be built

##### Choose Payment Gateway
| Gateway | Best for | Notes |
|---------|----------|-------|
| **Razorpay** | India-first, INR | Best UX for Indian users, UPI + cards + netbanking |
| **Stripe** | International | Best developer experience, not available for INR natively |
| **Cashfree** | India | Good alternative to Razorpay |

> **Recommendation: Razorpay** — EarthyStay is India-focused (INR prices, Indian properties)

##### Backend (`backend/`)

- [ ] **Add Razorpay SDK**  
  `pip install razorpay` → add to `requirements.txt`  
  Add to `.env`: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

- [ ] **Add `payments` table**  
  Fields: `id`, `booking_id` (FK), `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `amount`, `currency`, `status` (`created`/`paid`/`failed`/`refunded`), `created_at`

- [ ] **`POST /payments/create-order`** (protected)  
  - Receive `booking_id`
  - Look up booking total
  - Create Razorpay order via API (`razorpay.orders.create`)
  - Store order in `payments` table with status `created`
  - Return `{ razorpay_order_id, amount, currency, key_id }` to frontend

- [ ] **`POST /payments/verify`** (protected)  
  - Receive `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`
  - **Verify HMAC-SHA256 signature** (critical security step — never skip this)
  - On valid signature: update payment status to `paid`, update booking status to `confirmed`
  - On invalid signature: update payment to `failed`, return 400

- [ ] **`POST /payments/webhook`** (public, Razorpay → your server)  
  - Handle `payment.captured`, `payment.failed`, `refund.created` events
  - Verify webhook signature
  - Update booking/payment status accordingly
  - This is the **source of truth** — more reliable than the frontend verify endpoint

- [ ] **Refund endpoint** (`POST /payments/{payment_id}/refund`) — admin only  
  - Call Razorpay refund API
  - Update payment + booking status

- [ ] **Add `payment_status` field to `Booking` model**  
  Values: `unpaid` / `paid` / `refunded`  
  Bookings should stay `pending` until payment is confirmed

##### Frontend (`frontend/`)

- [ ] **Add Razorpay script to booking confirmation page**  
  Load `https://checkout.razorpay.com/v1/checkout.js`

- [ ] **Booking flow update**  
  Current: Fill form → Submit → Done  
  New: Fill form → Submit → **Payment modal → Pay → Verify → Confirmed**

- [ ] **Create `BookingPayment` component**  
  - Call `POST /payments/create-order` to get Razorpay order
  - Open Razorpay checkout modal with order details
  - On payment success: call `POST /payments/verify` with signature
  - On success: show booking confirmed page with booking ref
  - On failure: show error with retry option

- [ ] **Add payment status to user dashboard booking cards**  
  Show `Paid` / `Unpaid` / `Refunded` badge on each booking

- [ ] **Add payment history section in user dashboard** (optional)  
  Show transaction ID, amount, date for each payment

- [ ] **Add refund button in admin bookings tab**  
  When cancelling a confirmed+paid booking, trigger refund via API

#### Production Notes for Phase 9
> - **Never trust the frontend** for payment verification — always verify signature on the backend
> - **Webhook is the source of truth** — not the frontend success callback (users can close the browser)
> - **Idempotency**: use `razorpay_order_id` as idempotency key — never process the same payment twice
> - **Test with Razorpay test keys** before going live (use test UPI ID: `success@razorpay`)
> - **Store `RAZORPAY_KEY_SECRET` server-side only** — never expose to frontend
> - **Only `RAZORPAY_KEY_ID`** goes to the frontend (safe to expose, not the secret)
> - **PCI compliance**: using Razorpay checkout modal means you never handle raw card data — you are not PCI in scope
> - **Webhook endpoint must be public** (no auth) but must verify Razorpay's HMAC signature
> - **Atomic DB updates**: update both `payment` and `booking` in the same DB transaction
> - **Refund policy**: decide if you want auto-refund on cancellation or manual admin approval
> - **Amount in paise**: Razorpay uses paise (₹1 = 100 paise) — `total_price × 100`
> - **Log every payment event** to a payments audit log table for dispute resolution

---

### Phase 10 — Notifications (Email + SMS)

**Current state:** No notifications are sent at any point — not on booking creation, confirmation, cancellation, or any other event. Zero notification infrastructure exists.

#### What needs to be built

##### Backend — Infrastructure

- [ ] **Choose notification providers**
  | Type | Provider | Free Tier |
  |------|----------|-----------|
  | Email | **Resend** | 3,000/month |
  | SMS | **Twilio** / **MSG91** | Pay-per-message |
  | WhatsApp | **Interakt** / **Twilio** | Pay-per-message |

- [ ] **Create `app/services/notifications.py`**  
  Central service with functions:
  - `send_email(to, subject, html_body)`
  - `send_sms(to_phone, message)` (optional)
  - `send_booking_confirmation_email(booking, property, guest)`
  - `send_booking_cancelled_email(booking, property, guest)`
  - `send_admin_new_booking_alert(booking, property, guest)`

- [ ] **Create email templates** (`app/templates/emails/`)
  - `booking_confirmation.html` — sent to guest on booking created
  - `booking_confirmed_admin.html` — sent to admin when booking needs confirmation
  - `booking_status_update.html` — sent to guest on confirm/cancel/complete
  - `payment_receipt.html` — sent after successful payment (Phase 9)
  - `password_reset.html` — sent for forgot password (Phase 8)

- [ ] **Add FastAPI `BackgroundTasks` for non-blocking sends**  
  Email should be sent in background — don't make the user wait for SMTP:
  ```python
  @router.post("/bookings")
  async def create_booking(..., background_tasks: BackgroundTasks):
      booking = await _create_booking(...)
      background_tasks.add_task(send_booking_confirmation_email, booking, property, guest)
      return booking
  ```

##### Notification Triggers — What Gets Sent When

- [ ] **On `POST /bookings` (new booking created)**  
  → Email to **guest**: "Booking request received — ES-XXXXXX"  
  → Email to **admin**: "New booking request — ES-XXXXXX for [Property Name]"

- [ ] **On `PATCH /bookings/admin/{id}` status → `confirmed`**  
  → Email to **guest**: "Your booking is confirmed! — ES-XXXXXX"  
  → Include: check-in/out dates, property address, contact info, PDF voucher link

- [ ] **On `PATCH /bookings/admin/{id}` status → `cancelled`**  
  → Email to **guest**: "Booking cancelled — ES-XXXXXX"  
  → Include: reason (if admin provides one), refund information

- [ ] **On `PATCH /bookings/admin/{id}` status → `completed`**  
  → Email to **guest**: "Thanks for staying with us! Leave a review."  
  → Include: link to write a review on the property page

- [ ] **On successful payment** (Phase 9 prerequisite)  
  → Email to **guest**: Payment receipt with transaction ID and booking summary

- [ ] **Pre-arrival reminder** (requires background job / scheduler)  
  → Email to **guest**: 24–48 hours before check-in  
  → Include: property address, check-in time, contact number, house rules  
  → Requires APScheduler or a cron job — see background jobs below

##### Background Jobs (Optional but Recommended)

- [ ] **Install APScheduler or use Celery**  
  For scheduled tasks like pre-arrival reminders and iCal sync

- [ ] **Pre-arrival reminder job**  
  Runs daily at 8 AM — finds all bookings with `check_in = tomorrow`, sends reminder email

- [ ] **iCal sync job** (already has DB links saved)  
  Runs every 6 hours — fetches all `import` type iCal links, parses `.ics` files,  
  creates shadow-block bookings for external reservations

##### Frontend — Notification Preferences (Optional Phase)

- [ ] **Add notification preferences to user profile**  
  Checkboxes: "Email me when booking is confirmed", "Send pre-arrival reminder", etc.  
  Store in `users.notification_prefs` (JSONB column)

- [ ] **Unsubscribe link in all emails**  
  Required by law (CAN-SPAM / Indian IT rules). Each email must have a 1-click unsubscribe.

#### Production Notes for Phase 10
> - **Never send emails synchronously** — always use `BackgroundTasks` or a queue (Celery/ARQ)  
>   A slow SMTP server will make your API endpoints time out
> - **Use Resend** (not raw SMTP) — handles deliverability, SPF/DKIM/DMARC automatically
> - **Set up SPF, DKIM, DMARC records** on your domain — without these, emails go to spam
> - **Use a subdomain for transactional email**: `mail.earthystay.com` — protects your main domain reputation
> - **Rate limit email sends** — don't send more than 1 email per event per booking (use idempotency keys)
> - **Log every email** to a `notification_log` table: `booking_id`, `type`, `sent_at`, `status`
> - **Handle bounces and failures** — Resend webhook notifies you of failed deliveries
> - **Test with real inboxes** (Gmail, Outlook) before going live — check spam folders
> - **SMS is optional** in India — WhatsApp Business API is more effective and has higher open rates
> - **Pre-arrival reminder** requires a reliable cron job — use Upstash QStash or Railway cron for simple hosted scheduling

---

## Global Production Readiness Notes

These apply across all phases:

### Security (All Phases)
- All secrets (`JWT_SECRET`, `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`, etc.) must be in environment variables **only** — never in source code or committed to Git
- All new endpoints that modify data (`POST`, `PATCH`, `DELETE`) must be protected by `get_current_user` dependency
- Admin-only endpoints must use `get_admin` dependency
- Any new public endpoint that accepts user input must be rate limited with `slowapi`
- Validate all inputs with Pydantic — never trust raw request data

### Database (All Phases)
- Every new table needs a migration (`alembic revision --autogenerate -m "description"`)
- Every FK column (e.g., `payment.booking_id`) needs `index=True`
- Every table needs `created_at` (and `updated_at` if rows are mutated)
- Use `select ... for update` (pessimistic lock) for any write that depends on existing state

### API Design (All Phases)
- All new endpoints must return consistent error format: `{"detail": "message"}`
- Use HTTP status codes correctly: 201 for creates, 200 for updates, 204 for deletes, 404 for not found, 422 for validation errors
- All list endpoints must support pagination (`page`, `limit`) — never return unbounded lists
- Add the new router to `app/main.py` `include_router`

### Frontend (All Phases)
- All API calls go through `fetchWithAuth` for protected endpoints
- All new API helpers go in `lib/api.ts` with proper TypeScript types
- All new pages that require login must call `useRequireAuth()`
- Error states must be shown to the user — never swallow errors silently
- Loading states must be shown while API fetches (skeleton loaders or spinners)
- Forms must disable submit button while saving (`isSaving` state)

- **E2E/Test Hooks:** Remove any E2E-only UI or seeded test helpers (for example, `?e2e` seed hooks or in-page test links) before production deploy. Gate test-only code behind explicit environment flags (e.g., `NEXT_PUBLIC_E2E_SKIP_AUTH`) and ensure CI/staging, not production, enable them.

### Testing (All Phases)
- Write at least one happy-path test for each new backend endpoint in `backend/tests/`
- Test the payment webhook with Razorpay's test event simulator before going live
- Test emails in staging with real inboxes before production

---

## Suggested Completion Order

```
Phase 8 (Password Reset) → ~1 day
  ↓ (enables full auth flow)
Phase 10 (Notifications, partial) → ~1 day
  Start with: booking confirmation + admin alert emails only
  ↓ (guests now get confirmation emails)
Phase 9 (Payments) → ~3–4 days
  ↓ (now bookings have a real payment step)
Phase 10 (Notifications, complete) → ~1 day
  Add: payment receipt, cancellation, pre-arrival reminder
  ↓
Production Hardening (PRODUCTION_CHECKLIST.md) → ~2–3 days
  ↓
🚀 Launch
```

---

*See also: [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md) for infrastructure-level tasks*
