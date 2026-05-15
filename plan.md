Perfect. I have everything I need. Here is the complete plan.

---

# EarthyStay Backend — Full Work Plan

---

## The Core Concept: How Multi-Room Works

Before the plan, understand this architecture decision clearly.

Your client has **one physical house**. In the DB you will have multiple `Property` rows for it, linked together by a new `property_group` concept:

- `Room 1 - Garden View` (listing)
- `Room 2 - Pool View` (listing)
- `Room 3 - Forest View` (listing)
- `Whole Property` (listing) ← linked to all 3 rooms

When **Room 1** is booked → system automatically blocks `Whole Property` for those dates.
When **Whole Property** is booked → system automatically blocks all 3 rooms for those dates.

This is handled at booking creation time with a "linked listings" table. Clean, scalable, and your frontend just sees normal property listings.

---

## Phase 1 — Fix Existing Bugs (Do This First, 1–2 hours)

These are broken right now and will cause silent failures.

**1.1 Fix the double `.scalars()` bug in `/bookings/mine` and `/bookings/admin/all`** ✅ count query should use the base (unpaginated) query

```python
# Current broken code in bookings.py:
result = await db.execute(query)
return {"items": result.scalars().all(), "total": len(result.scalars().all())}
# Second call returns [] always

  # Fix — fetch items first, count separately:
  # Use a base query (without limit/offset) for the count to avoid undercounting
  count_result = await db.scalar(select(func.count()).select_from(base_query.subquery()))
  result = await db.execute(paged_query)
items = result.scalars().all()
return {"items": items, "total": count_result, "page": page, "limit": limit}
```

**1.2 Add missing `GET /properties/{property_id}` endpoint**

In `routers/properties.py` — right now there is no way to get a single property. Every frontend detail page needs this.

**1.3 Add `selectinload(Property.images)` to admin property list**

Same as the public endpoint already does — prevents N+1 query errors.

**1.4 Add input validation to `BookingCreate`**

```python
from pydantic import model_validator

class BookingCreate(BaseModel):
    ...
    @model_validator(mode="after")
    def check_dates(self):
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        if self.guests < 1:
            raise ValueError("at least 1 guest required")
        if self.pets < 0:
            raise ValueError("pets cannot be negative")
        return self
```

**1.5 Add `GET /properties/{property_id}/availability` endpoint**

Returns a list of blocked date ranges for a property. Frontend booking calendar needs this. Query confirmed + pending bookings for that property and return `[{check_in, check_out}]`.

---

## Phase 1.6 — Availability UX (1–2 hours)

Stop users from selecting booked dates on the property page.

**1.6.1 Fetch availability**
- On property detail page, call `GET /properties/{property_id}/availability`.
- Store blocked ranges in UI state.

**1.6.2 Replace native date inputs**
- The current `input type="date"` cannot disable arbitrary ranges.
- Swap to a date picker that supports disabled ranges (e.g., `react-day-picker` or `react-datepicker`).

**1.6.3 Disable blocked ranges**
- Convert each `{check_in, check_out}` to a disabled range and pass to the date picker.
- Prevent selecting a check-out date that overlaps any blocked range.

**1.6.4 Validate on submit**
- Keep a final check in `handleBook()` to block if selected range overlaps (safety net).

---

## Phase 2 — Room Grouping / Multi-Listing (3–4 hours)

This is the core new feature.

**2.1 New model: `PropertyGroup`** ✅ add constraints: unique (group_id, property_id), and only one whole-property per group

Create `backend/app/models/property_group.py`:

```python
class PropertyGroup(Base):
    __tablename__ = "property_groups"
    id: UUID (primary key)
    name: str          # e.g. "The Earthy House, Coorg"
    created_at: datetime

class PropertyGroupMember(Base):
    __tablename__ = "property_group_members"
    id: UUID
    group_id: UUID     # FK → property_groups.id
    property_id: UUID  # FK → properties.id
    is_whole_property: bool  # True only for the "Whole Property" listing

  Enforce:
  - Unique `(group_id, property_id)`
  - Only one `is_whole_property=True` per group
```

Add `group_member` relationship back to `Property` model.

**2.2 New admin endpoints for groups**

```
POST   /admin/groups                          → create a group
POST   /admin/groups/{group_id}/members       → add a property listing to the group
DELETE /admin/groups/{group_id}/members/{id}  → remove a listing from group
GET    /admin/groups                          → list all groups with their members
```

**2.3 Booking creation — cascade blocking logic** ✅ ensure shadow blocks are excluded from revenue and guest-visible views

In `services/booking.py`, after a booking is created, run `apply_group_blocking(booking, db)`:

```
When a room is booked:
  → find if this property belongs to a group
  → find the is_whole_property=True listing in that group
  → create a "shadow block" booking for the whole-property listing
    (status = confirmed, auto-generated, no guest — just blocks the calendar)

When the whole_property listing is booked:
  → find all room listings in the same group
  → create shadow block bookings for every room listing
```

Use a `is_shadow_block: bool` column on `Booking` to distinguish real bookings from auto-blocks. Shadow blocks are not shown to guests, not counted in revenue, and are deleted automatically if the parent booking is cancelled.

**2.4 Cancellation — cascade unblocking**

In `PATCH /bookings/admin/{booking_id}` when status → `cancelled`:
- If this booking has shadow blocks linked to it, delete them
- New column `parent_booking_id: UUID | None` on `Booking` to track which real booking created the shadow

**2.5 Schema additions**

- Add `is_shadow_block`, `parent_booking_id` to `Booking` model and migration
- Add `group_id` (optional) to `PropertyOut` schema so frontend knows which group a listing belongs to
- New `PropertyGroupOut` schema

---

## Phase 3 — Reviews Router (1–2 hours)

The model and schema already exist. Just needs the router wired up.

**3.1 Create `routers/reviews.py`**

```
POST /reviews                    → submit a review (guest only, must have completed booking)
GET  /properties/{id}/reviews    → list reviews for a property (public)
DELETE /admin/reviews/{id}       → admin can remove a review
```

**Validation rules in service:**
- Guest must have a `completed` booking for that property
- One review per booking (unique constraint already exists in model)
- Rating must be 1–5 (add to `ReviewCreate` schema with `Field(ge=1, le=5)`)
- After creating/deleting a review, call existing `update_property_rating()` from `services/property.py`

**3.2 Register in `main.py`**

```python
from app.routers import reviews
app.include_router(reviews.router)
```

---

## Phase 4 — Email Notifications (2–3 hours)

**4.1 Install and configure**

Add to `requirements.txt`:
```
fastapi-mail
```

Create `app/services/email.py` with a `send_email(to, subject, body_html)` helper using `fastapi-mail`. Add to `.env`:
```
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=app_password
MAIL_FROM=your@gmail.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
```

Add these fields to `Settings` in `config.py`.

**4.2 Booking confirmation email**

Triggered inside `POST /bookings` after commit. Send to `booking.guest_email`:

```
Subject: Booking Confirmed — {property.name}
Body (HTML):
  - Guest name
  - Property name, address
  - Check-in / Check-out dates
  - Nights, guests, pets
  - Itemised pricing (base + cleaning fee + pet charge + total)
  - Booking ID for reference
  - Check-in time, check-out time
  - Contact email/phone of property
```

**4.3 Booking status change email**

Triggered in `PATCH /bookings/admin/{booking_id}` when admin changes status:
- `confirmed` → "Your booking has been confirmed"
- `cancelled` → "Your booking has been cancelled" (with refund note if applicable)
- `completed` → "Thank you for your stay — please leave a review" (include review link)

**4.4 Real password reset**

Replace the fake stub in `routers/auth.py`:

- `POST /auth/forgot-password` → generate a signed JWT with 30-min expiry containing `user_id` + `purpose: "reset"`, store token hash in a new `password_reset_tokens` table, send email with link `https://yourfrontend.com/reset-password?token=...`
- `POST /auth/reset-password` → verify token from table, check expiry, update password, mark token as used

New model needed: `PasswordResetToken` with columns `id, user_id, token_hash, expires_at, used_at`.

---

## Phase 5 — Razorpay Payments (3–4 hours)

**5.1 Install**

```
razorpay
```

Add to `.env` and `config.py`:
```
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

**5.2 Payment flow — 3 steps** ✅ align email timing with admin confirmation

The booking flow changes to:

```
Step 1: Guest calls POST /bookings/initiate
  → validates everything (availability, dates, guests)
  → calculates pricing
  → creates a Razorpay order via API
  → saves booking with status = "payment_pending" (new status)
  → returns: { booking_id, razorpay_order_id, amount, key_id }
  → frontend opens Razorpay checkout with this data

Step 2: Guest completes payment on Razorpay
  → Razorpay calls your webhook: POST /payments/webhook
  → verify signature using HMAC-SHA256
  → update booking status to "pending" (awaiting admin confirm)
  → send "payment received" email (confirmation email comes after admin confirm)
  → set `payment_status = "paid"` (money captured but not yet settled)
  → trigger shadow blocking for room groups

Step 3: Admin confirms → status = "confirmed"
  → send confirmation email

Step 4: Payout settles to admin bank
  → admin marks `payment_status = "settled"` for revenue/profit reporting
```

**5.3 New model additions**

Add to `Booking`:
```python
razorpay_order_id: str | None
razorpay_payment_id: str | None
payment_status: str  # unpaid | paid | refunded
payment_status: str  # unpaid | paid | settled | refunded
```

Add `payment_pending` to `BookingStatus` enum.

**5.4 New endpoints**

```
POST /bookings/initiate          → creates order, returns razorpay_order_id
POST /payments/webhook           → Razorpay webhook (no auth, verify signature)
POST /payments/verify            → frontend calls after payment to double-check
GET  /admin/payments             → list all payments with status
POST /admin/payments/{id}/refund → trigger Razorpay refund
PATCH /admin/payments/{id}/settle → mark payout received (sets payment_status = settled)
```

**5.5 Refund logic**

When admin cancels a confirmed/paid booking:
- Call Razorpay refund API with `razorpay_payment_id`
- Update `payment_status = "refunded"` on booking
- Send cancellation + refund email to guest

---

## Phase 6 — Enhanced Admin Analytics (2–3 hours)

Replace the simple dashboard with proper analytics data.

**6.1 Monthly revenue endpoint**

```
GET /admin/analytics/revenue?year=2025
```

Returns 12 months of data:
```json
[
  { "month": "Jan", "month_num": 1, "revenue": 45000, "bookings": 5 },
  { "month": "Feb", "month_num": 2, "revenue": 62000, "bookings": 7 },
  ...
]
```

SQL: `GROUP BY EXTRACT(MONTH FROM created_at)` on bookings where `payment_status = settled` and `status != cancelled`.

**6.2 Per-listing revenue breakdown**

```
GET /admin/analytics/by-property?month=2025-01
```

Returns:
```json
[
  { "property_id": "...", "property_name": "Room 1 - Garden View", "revenue": 15000, "bookings": 2, "nights_booked": 6 },
  ...
]
```

**6.3 Daily transaction feed (the GPay-style list)**

```
GET /admin/analytics/transactions?from=2025-01-01&to=2025-01-31
```

Returns each booking as a transaction line:
```json
[
  {
    "date": "2025-01-15",
    "booking_id": "...",
    "guest_name": "Riya Shah",
    "property_name": "Room 2 - Pool View",
    "check_in": "2025-01-15",
    "check_out": "2025-01-18",
    "nights": 3,
    "amount": 19500,
    "payment_status": "settled"
  }
]
```

Ordered by `created_at DESC`. This is what your frontend renders as the GPay-style feed.

**6.4 Occupancy rate**

```
GET /admin/analytics/occupancy?property_id=...&month=2025-01
```

Returns: `{ "total_nights_in_month": 31, "nights_booked": 18, "occupancy_rate": 58.1 }`

**6.5 Updated dashboard summary**

Extend `GET /admin/dashboard` to also return:
- `revenue_this_month` (current calendar month)
- `revenue_last_month`
- `revenue_this_year`
- `occupancy_this_month` (across all listings)
- `top_performing_listing` (property name + revenue)

---

## Phase 7 — iCal Real Sync (2 hours)

Right now iCal just stores URLs. Make it actually work.

**7.1 Install** ✅ apply the same shadow-block filtering rules as Phase 2

```
icalendar
httpx
apscheduler
```

**7.2 Sync service**

Create `app/services/ical_sync.py`:
- `fetch_and_parse(url)` → uses `httpx` to GET the `.ics` URL, parses with `icalendar` library, returns list of `{start, end, summary}` date blocks
- `sync_property_ical(property_id, db)` → for each import-direction iCal link on this property, fetch events, create shadow block bookings for any date range not already blocked, update `last_synced`

**7.3 Scheduled job**

In `main.py` lifespan, start APScheduler to run `sync_all_icals()` every 6 hours:
```python
scheduler = AsyncIOScheduler()
scheduler.add_job(sync_all_icals, "interval", hours=6)
scheduler.start()
```

**7.4 Manual sync endpoint**

```
POST /admin/ical/sync/{property_id}  → trigger immediate sync for one property
```

**7.5 Export endpoint**

```
GET /ical/properties/{property_id}/export.ics
```

Public URL (no auth). Returns a valid `.ics` file of all confirmed bookings for that property. This is what you give to Airbnb/Booking.com to block dates on their end.

---

## Phase 8 — Refresh Tokens + Security Hardening (1–2 hours)

**8.1 Refresh token**

Add `POST /auth/refresh`:
- New `RefreshToken` model: `id, user_id, token_hash, expires_at, revoked`
- On login/register, issue both access token (20 min) and refresh token (30 days), store refresh token hash in DB
- `POST /auth/refresh` → verify refresh token from DB, issue new access token
- `POST /auth/logout` → revoke refresh token

**8.2 Rate limiting on auth**

Add `slowapi` to requirements. Apply to `/auth/login` and `/auth/register`:
```python
@limiter.limit("5/minute")
async def login(...):
```

**8.3 Rating validation**

In `ReviewCreate`:
```python
rating: int = Field(ge=1, le=5)
```

**8.4 CORS from environment**

Move `CORS_ORIGINS` to `.env` so you don't have to change code when deploying.

---

## Phase 9 — Alembic Migrations (1 hour)

Right now the app uses `create_all` on startup which is dangerous in production.

```bash
alembic init alembic
# configure alembic.ini and env.py to use your DATABASE_URL
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

Write one migration per phase going forward. Remove `create_all` from lifespan.

---

## Recommended Build Order

| # | Phase | Why this order |
|---|---|---|
| 1 | Fix bugs | Nothing else works correctly until these are fixed |
| 2 | Property detail + availability endpoints | Frontend can't function without these |
| 3 | Room grouping | Core business requirement, affects booking logic |
| 4 | Reviews | Simple, self-contained, quick win |
| 5 | Email | Needed before Razorpay so confirmations work |
| 6 | Razorpay | Depends on email being ready |
| 7 | Analytics | Depends on real bookings/payments existing |
| 8 | iCal sync | Independent, can do anytime |
| 9 | Security hardening | Before going live |
| 10 | Alembic | Last, locks down the schema |

---

## New Files to Create (Summary)

```
app/models/property_group.py
app/models/password_reset_token.py
app/models/refresh_token.py
app/routers/reviews.py
app/routers/payments.py
app/routers/analytics.py
app/services/email.py
app/services/ical_sync.py
app/services/razorpay.py
app/services/group_blocking.py
app/schemas/group.py
app/schemas/analytics.py
alembic/                         ← full migrations folder
```

---

That's every feature, every file, every decision — one at a time in the right order. Tell me which phase to start with and I'll write the full code for it.