# CODEBASE.md — Earthy Stays Project Reference

> **Read this entire file before writing a single line of code.**
> Optimised for token-efficient LLM sessions (NVIDIA NIM / DeepSeek free tier).
> Follow every convention here so the codebase stays consistent.

---

## 1. PROJECT OVERVIEW

**Earthy Stays** — A luxury property-booking platform for India.
- Guests browse, filter, and book curated properties.
- Admin panel manages bookings, properties, and iCal sync.
- Tech: Next.js 16 (App Router) + FastAPI backend + PostgreSQL + SQLAlchemy + JWT auth.

---

## 2. REPO STRUCTURE

```
/
├── backend/
│   ├── requirements.txt
│   ├── .gitignore              # ignores: venv, __pycache__, .env
│   ├── .env                    # DATABASE_URL, JWT_SECRET
│   └── app/
│       ├── main.py             # FastAPI app entry, lifespan, CORS, router includes
│       ├── config.py           # pydantic-settings (DB URL, JWT secret, CORS origins)
│       ├── database.py         # async engine, sessionmaker, Base, get_db
│       ├── dependencies.py     # get_db, get_current_user (JWT), get_admin (role check)
│       ├── models/
│       │   ├── user.py         # User: id, email, password_hash, full_name, phone, role
│       │   ├── property.py     # Property + PropertyImage (JSONB for amenities/rules)
│       │   ├── booking.py      # Booking: dates, pricing, status enum
│       │   ├── review.py       # Review: rating 1-5, unique per booking
│       │   └── ical.py         # ICalLink: import/export URLs per property
│       ├── schemas/            # Pydantic request/response models
│       │   ├── user.py         # RegisterIn, LoginIn, TokenOut, UserOut, DashboardOut
│       │   ├── property.py     # PropertyCreate, PropertyUpdate, PropertyOut, PropertyImage*
│       │   ├── booking.py      # BookingCreate, BookingOut, BookingStatusUpdate
│       │   ├── review.py       # ReviewCreate, ReviewOut
│       │   └── ical.py         # ICalLinkCreate, ICalLinkOut
│       ├── routers/
│       │   ├── auth.py         # POST /auth/register, /login, /forgot-password, GET /me
│       │   ├── properties.py   # GET /properties (filters + pagination)
│       │   ├── bookings.py     # POST /bookings, GET /mine, GET /:id, admin CRUD
│       │   ├── users.py        # GET /dashboard, PATCH /profile, PATCH /password
│       │   ├── admin.py        # Dashboard stats, property CRUD, image management
│       │   └── ical.py         # iCal link CRUD per property
│       ├── services/
│       │   ├── auth.py         # hash_password, verify_password, create_token (JWT)
│       │   ├── booking.py      # calculate_pricing (nights, base, pet, total)
│       │   └── property.py     # get_property_filters, update_property_rating
│       └── alembic/            # (future: DB migrations)
│           └── versions/
│
└── frontend/
    ├── app/
    │   ├── layout.tsx           # Root layout — wraps ALL pages with Navbar + Footer + paddingTop:72px
    │   ├── page.tsx             # Home: Hero + FeaturedProperties + WhyChooseUs
    │   ├── globals.css          # ALL CSS variables, Tailwind import, responsive classes
    │   ├── (auth)/              # Auth route group — NO Navbar shown (uses auth-shell layout)
    │   │   ├── login/page.tsx
    │   │   ├── register/page.tsx
    │   │   ├── forgot-password/page.tsx
    │   │   └── reset-password/page.tsx
    │   ├── (main)/              # Main route group — full layout
    │   │   ├── about/page.tsx
    │   │   ├── cancellation/page.tsx
    │   │   ├── contact/page.tsx
    │   │   ├── privacy/page.tsx
    │   │   ├── terms/page.tsx
    │   │   ├── properties/
    │   │   │   ├── page.tsx           # Suspense wrapper → PropertiesClient
    │   │   │   ├── PropertiesClient.tsx  # Filter sidebar + property grid
    │   │   │   └── [id]/page.tsx      # Property detail + booking widget + map + tabs
    │   │   └── booking/
    │   │       └── [id]/
    │   │           ├── page.tsx        # Booking form (guest info + price summary)
    │   │           └── confirmation/page.tsx
    │   ├── admin/
    │   │   ├── page.tsx         # Admin dashboard (overview/bookings/properties/iCal tabs)
    │   │   └── properties/page.tsx  # Full-screen property editor modal (7-section stepper)
    │   └── dashboard/
    │       └── page.tsx         # Guest dashboard (bookings/past stays/profile)
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.tsx       # Fixed top navbar, mobile hamburger menu
    │   │   ├── Footer.tsx       # 4-column footer
    │   │   ├── Hero.tsx         # Full-viewport hero with search bar
    │   │   └── WhyChooseUs.tsx  # 6-feature grid section
    │   ├── property/
    │   │   ├── PropertyCard.tsx    # Card used in grids (image + details + price)
    │   │   └── FeaturedProperties.tsx  # Section wrapping property cards
    │   └── shared/
    │       ├── Map.tsx          # Leaflet map (client-only, fixes icon issue)
    │       └── MapWrapper.tsx   # dynamic() wrapper for Map (ssr:false)
    │
    ├── lib/
    │   ├── data/
    │   │   └── properties.ts    # dummyProperties array (6 properties, mutated by admin editor)
    │   └── types/
    │       └── index.ts         # All TypeScript interfaces: Property, Booking, Review, User, ICalLink
    │
    ├── public/                  # Static SVGs (next.svg, vercel.svg, etc.)
    ├── next.config.ts           # allowedDevOrigins, turbopack, images.remotePatterns (unsplash)
    ├── tsconfig.json            # paths: @/* → ./*
    ├── postcss.config.mjs       # @tailwindcss/postcss
    └── package.json
```

---

## 3. TECH STACK

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend framework | Next.js (App Router) | 16.2.4 |
| UI language | TypeScript + React | 19.x |
| Styling | CSS variables + Tailwind 4 (utility-only) | 4.2.4 |
| Maps | Leaflet + react-leaflet | 1.9.4 / 5.0.0 |
| Font | Figtree (Google Fonts, weights 300–800) | — |
| Backend | FastAPI (Python) + SQLAlchemy 2.0 (async) | latest |
| Database | PostgreSQL (via asyncpg) | 16+ |
| Auth | JWT (python-jose) + bcrypt (passlib) | — |
| Package manager | npm | — |
| Node requirement | >=18.0.0 (>=20.9.0 for Next.js) | — |

---

## 4. CSS ARCHITECTURE — CRITICAL, READ CAREFULLY

### 4.1 CSS Variables (defined in `globals.css :root`)

```css
--color-gold: #ead0af          /* Primary accent — buttons, highlights, borders */
--color-navbar: #b7895f        /* Navbar + dark section backgrounds */
--color-navbar-text: #ffffff
--color-navbar-border: rgba(255,255,255,0.26)
--color-text-primary: #000000
--color-text-secondary: #000000
--color-text-muted: #000000
--color-border: #d9c2a8
--color-bg-page: #f7efe6
--color-bg-card: #fffaf4
--color-bg-soft: #ead1b3
--color-beige: #b7895f
--color-dark: #2b2017
```

### 4.2 Layout Classes (defined in `globals.css`, use these everywhere)

| Class | Purpose |
|-------|---------|
| `.page-shell` | min-height:100vh, overflow-x:clip — wrap every page |
| `.content-shell` | max-width 1200px, auto margins, uses `--page-padding` |
| `.content-shell-lg` | max-width 1400px version |
| `.auth-shell` | Full-viewport centered flex — auth pages only |
| `.auth-card` | max-width 480px card inside auth-shell |
| `.responsive-card-grid` | auto-fit minmax(280px,1fr) — property grids |
| `.responsive-grid-detail` | 2-col: 1fr + 320-380px — property detail / booking |
| `.sticky-desktop` | position:sticky top:100px (auto on mobile) |
| `.section-shell` | Uses `--section-padding` (100px 24px desktop, 72px mobile) |
| `.hero-search-grid` | 5-col + auto for search bar |
| `.responsive-feature-grid` | auto-fit minmax(300px,1fr) — WhyChooseUs |

### 4.3 Responsive Breakpoints
- Mobile: `@media (max-width: 768px)` — collapses all grids to 1fr
- Small: `@media (max-width: 640px)` — tables → card layout, booking dates stack

### 4.4 Tailwind Usage
Tailwind is imported but used **sparingly** — mainly for `hidden md:flex`, `md:hidden`, `flex`, `items-center`, `gap-*`. Do NOT use Tailwind for colors or spacing that conflicts with CSS vars.

---

## 5. STYLING RULES — ALWAYS FOLLOW

1. **All colors** → use `var(--color-*)` CSS variables. Never hardcode hex except for status colors (`#E53E3E` error, `#2E7D32` success, `#F57F17` warning, `#1565C0` info, `#C62828` cancel, `#FFEBEE` cancel bg, `#E8F5E9` success bg, `#E3F2FD` info bg, `#FFF8E7` warning bg).
2. **Font** → always `'Figtree', sans-serif`. Already set on body.
3. **Inline styles** → all components use inline `style={{}}` objects (not Tailwind classes for layout/spacing). This is the established pattern.
4. **Border radius** → 8px inputs/buttons, 10–12px cards, 6px badges/tags.
5. **Gold accent bar** → `width:40px, height:2px, backgroundColor:'var(--color-gold)'` under section headings.
6. **Letter spacing** → labels use `fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', fontWeight:'600'`.
7. **Buttons** → gold bg `var(--color-gold)`, text `var(--color-text-primary)`, no border, padding `14-20px 28-48px`, `fontSize:'13px'`, `letterSpacing:'2px'`, `fontWeight:'700'`, `textTransform:'uppercase'`.
8. **Cards** → white bg, `border:'1px solid var(--color-border)'`, `borderRadius:'12px'`, `padding:'28-32px'`.
9. **Page headers** → `backgroundColor:'var(--color-navbar)'` with gold eyebrow text + white h1.

---

## 6. DATA LAYER

### 6.1 `lib/types/index.ts` — Key Interfaces

```typescript
// Property — the core entity
interface Property {
  id: string
  name: string; description: string; address: string
  contact_phone: string; contact_email: string
  check_in_time: string; check_out_time: string  // e.g. "2:00 PM"
  house_rules: string[]
  price_per_night: number; cleaning_fee: number
  max_guests: number; bedrooms: number; bathrooms: number
  bathrooms_detail: BathroomDetail[]  // [{type:'ensuite'|'shared'|'detached_private', count:n}]
  city: string; state: string; country: string
  latitude: number; longitude: number
  is_published: boolean; min_nights: number
  pets_allowed: boolean; pet_charge_per_night: number
  images: PropertyImage[]  // [{id, property_id, image_url, is_primary, display_order}]
  amenities: string[]
  avg_rating: number; review_count: number
  created_at: string  // "YYYY-MM-DD"
}

// BathroomType
type BathroomType = 'ensuite' | 'shared' | 'detached_private'
```

### 6.2 `lib/data/properties.ts`
- Exports `dummyProperties: Property[]` — 6 properties (Goa, Coorg, Jaipur, Munnar, Jaisalmer, Rishikesh).
- This array is **mutated in-memory** by the admin property editor (push/splice).
- IDs are strings: `"1"` through `"6"`.
- All images from `images.unsplash.com` — allowed in `next.config.ts`.

---

## 7. ROUTING PATTERNS

| Route | File | Notes |
|-------|------|-------|
| `/` | `app/page.tsx` | Static, server component |
| `/properties` | `app/(main)/properties/page.tsx` | Suspense → PropertiesClient (useSearchParams) |
| `/properties/[id]` | `app/(main)/properties/[id]/page.tsx` | Client component, `useParams` |
| `/booking/[id]` | `app/(main)/booking/[id]/page.tsx` | Client, reads searchParams for dates/guests |
| `/booking/[id]/confirmation` | `.../confirmation/page.tsx` | Client, reads searchParams |
| `/dashboard` | `app/dashboard/page.tsx` | Client, dummy data |
| `/admin` | `app/admin/page.tsx` | Client, tabs: overview/bookings/properties/iCal |
| `/admin/properties` | `app/admin/properties/page.tsx` | Full-screen modal editor, Suspense wrapped |
| `/login`, `/register`, etc. | `app/(auth)/*/page.tsx` | Client, redirect to /dashboard after 1.5s |
| `/about`, `/contact`, etc. | `app/(main)/*/page.tsx` | Mix of server/client |

**Route groups:**
- `(auth)` — no special layout override currently (Navbar still shows from root layout).
- `(main)` — organizational grouping only.

---

## 8. COMPONENT PATTERNS

### 8.1 'use client' Directive
All interactive components start with `'use client'`. Static/server pages don't need it.

### 8.2 Navigation
```typescript
import { useRouter } from 'next/navigation'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
```

### 8.3 Images
```typescript
import Image from 'next/image'
// Always provide width+height OR fill+sizes
// Unsplash URLs: https://images.unsplash.com/photo-xxx?w=800
```

### 8.4 Maps
```typescript
// Never import Map directly — always use MapWrapper
import MapWrapper from '@/components/shared/MapWrapper'
// Props: latitude, longitude, propertyName, address
```

### 8.5 Path Aliases
```typescript
@/components/...   // → frontend/components/
@/lib/...          // → frontend/lib/
```

### 8.6 Form Pattern
```typescript
// Validation: manual validate() returns boolean, sets errors state
const [form, setForm] = useState({ field: '' })
const [errors, setErrors] = useState<Record<string, string>>({})
const [loading, setLoading] = useState(false)
// Submit: setTimeout 1500ms simulates API, then router.replace('/destination')
```

### 8.7 Input Style Pattern (reused everywhere)
```typescript
const inputStyle = (field: string) => ({
  width: '100%', padding: '14px 16px',
  border: `1px solid ${errors[field] ? '#E53E3E' : 'var(--color-border)'}`,
  borderRadius: '8px', fontSize: '14px',
  color: 'var(--color-text-primary)', outline: 'none',
  backgroundColor: '#ffffff', boxSizing: 'border-box' as const,
})
const labelStyle = {
  fontSize: '11px', letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  color: 'var(--color-text-muted)',
  display: 'block', marginBottom: '8px', fontWeight: '600' as const,
}
```

---

## 9. BACKEND

Architecture: FastAPI + PostgreSQL + SQLAlchemy 2.0 (async) + JWT auth.
All endpoints async. JSONB for list fields (amenities, house_rules, bathrooms_detail).

### 9.1 Models (5 tables)

| Table | Key Fields | Notes |
|-------|-----------|-------|
| `users` | id(UUID), email(unique), password_hash, full_name, phone, role(guest/admin) | Roles: guest default, admin for admin panel |
| `properties` | id(UUID), owner_id(FK→users), name..price, location, JSONB fields, is_published, avg_rating, review_count | Denormalized rating from reviews |
| `property_images` | id(UUID), property_id(FK→properties CASCADE), image_url, is_primary, display_order | One-to-many from properties |
| `bookings` | id(UUID), property_id, guest_id, check_in/out, nights, pricing, status(enum), guest_name/email/phone | Status: pending→confirmed→completed or cancelled |
| `reviews` | id(UUID), property_id, guest_id, booking_id, rating(1-5), comment | UniqueConstraint per booking |
| `ical_links` | id(UUID), property_id, calendar_name, ical_url, direction(export/import), last_synced | Per-property calendar sync |

### 9.2 API Endpoints

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/auth/register` | No | Create user, return JWT |
| POST | `/auth/login` | No | Verify credentials, return JWT |
| GET | `/auth/me` | JWT | Current user from token |
| POST | `/auth/forgot-password` | No | Stub — returns ok |
| POST | `/auth/reset-password` | No | Stub — returns ok |
| GET | `/properties` | No | Filter: city, state, min/max_price, guests, pets, amenities. Paginated. Published only. |
| POST | `/bookings` | JWT | Create booking. Validates availability, calculates pricing server-side. |
| GET | `/bookings/mine` | JWT | User's bookings. Filter by status. |
| GET | `/bookings/{id}` | JWT | Single booking (owner or admin). |
| GET | `/users/dashboard` | JWT | Aggregated: upcoming, past stays, total spent, profile. |
| PATCH | `/users/profile` | JWT | Update name, phone. |
| PATCH | `/users/password` | JWT | Change password (verify old). |
| GET | `/admin/dashboard` | Admin | Stats: bookings, properties, revenue, pending. |
| GET/POST | `/admin/properties` | Admin | List all (incl. unpublished) / Create. |
| PATCH/DELETE | `/admin/properties/{id}` | Admin | Update (full 7-section edit) / Delete. |
| POST | `/admin/properties/{id}/images` | Admin | Add image. |
| PATCH/DELETE | `/admin/images/{id}` | Admin | Update (primary/reorder) / Delete. |
| GET/PATCH | `/admin/bookings` | Admin | List all bookings (search, filter) / Update status. |
| POST/GET/DELETE | `/ical/properties/{id}/links` | Admin | iCal link CRUD. |

### 9.3 Key Design Decisions

- **Pricing server-side** — `services/booking.py:calculate_pricing()`. Client sends dates+pets; server computes total. Prevents tampering.
- **Availability check** — Overlap query on confirmed/pending bookings: `check_in < :checkout AND check_out > :checkin`.
- **JWT payload** — `{sub: user.id, role: user.role, exp: ...}`. 24h expiry. No refresh tokens (v1).
- **JSONB for lists** — amenities, house_rules, bathrooms_detail stored as JSONB. Direct match to frontend TS arrays.
- **Denormalized ratings** — `avg_rating` and `review_count` on properties table. Updated via `update_property_rating()` on review create/delete.
- **UUID PKs** — All tables use UUID primary keys. Compatible with frontend, better for multi-tenant.
- **Async throughout** — All DB operations use `AsyncSession`. `async_sessionmaker` in database.py.

### 9.4 Dependencies Pattern

```python
# app/dependencies.py
get_db()             → AsyncSession (yield)
get_current_user()   → User (JWT from Authorization header, 401 if invalid)
get_admin()          → User (asserts role==admin, 403 if not)
```

### 9.5 Config (pydantic-settings)

```python
DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/earthystay"
JWT_SECRET="change-me-in-production"
JWT_ALGORITHM="HS256"
JWT_EXPIRE_MINUTES=1440  # 24h
CORS_ORIGINS=["http://localhost:3000"]
```
All overridable via `.env` file.

### 9.6 Frontend Migration Notes

Frontend currently uses `dummyProperties` array (in-memory). To wire to real backend:
1. Replace `lib/data/properties.ts` reads with `fetch('http://localhost:8000/properties?…')`
2. Admin property editor POST/PATCH to `http://localhost:8000/admin/properties`
3. Booking flow POST to `http://localhost:8000/bookings`
4. Auth pages POST to `/auth/login` / `/auth/register`, store JWT in localStorage/cookie
5. Dashboard data from `GET /users/dashboard`
6. Admin dashboard from `GET /admin/dashboard` + admin bookings/properties endpoints

---

## 10. KEY BUSINESS LOGIC

### Pricing Calculation
```
basePrice = price_per_night × nights
petCharge = pets × nights × pet_charge_per_night
total = basePrice + cleaning_fee + petCharge
```

### Night Calculation
```typescript
const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime()
const nights = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
```

### Booking Flow
1. Property detail page → user selects dates/guests/pets → "Reserve Now"
2. Navigates to `/booking/[id]?checkIn=&checkOut=&guests=&pets=&nights=&total=`
3. Guest fills info + agrees to non-refundable policy → "Pay ₹X"
4. Simulated 1.5s delay → `/booking/[id]/confirmation?name=&email=&checkIn=&checkOut=&total=`

### Non-Refundable Policy
**All bookings are 100% non-refundable.** This is displayed prominently on: property detail, booking page (step 3), confirmation, dashboard, cancellation policy page.

---

## 11. ADMIN PANEL

### Property Editor (`app/admin/properties/page.tsx`)
Full-screen modal with 7 sections (stepper via left sidebar):
1. **basic** — name, description, bedrooms/bathrooms/guests (stepper), check times, contact
2. **location** — address, city, state, country, lat/lng
3. **photos** — drag-drop upload zone + image grid with primary/remove
4. **amenities** — pill toggles from `AMENITY_OPTIONS` array (32 options)
5. **pricing** — nightly rate, cleaning fee, pet charge (with preview card)
6. **policies** — min nights stepper, published toggle, non-refundable notice
7. **rules** — predefined rule chips + custom input

Completion % calculated per section, shown in sidebar.
Save mutates `dummyProperties` array directly (in-memory, no persistence).

### Admin Dashboard Tabs
- **Overview** — 6 stat cards + recent bookings table + properties summary
- **Bookings** — searchable table with status actions (confirm/cancel/complete)
- **Properties** — list with edit/view/delete buttons
- **iCal** — export URL + import URL per property + connected calendars

---

## 12. DUMMY DATA REFERENCE

### Bookings (used in admin + dashboard)
```
BK001: Earthy Villa Goa, Mohammed Pithapur, Jun 15-18 2026, ₹28,000, confirmed
BK002: Heritage Haveli Jaipur, Priya Sharma, Jul 20-22 2026, ₹25,500, confirmed  
BK003: Forest Retreat Coorg, Rahul Mehta, Mar 10-13 2026, ₹20,300, completed
BK004: Desert Camp Jaisalmer, Anjali Kumar, Aug 5-8 2026, ₹29,700, pending
```

### Properties Summary
| ID | Name | City | Price/night | Rating |
|----|------|------|-------------|--------|
| 1 | Earthy Villa Goa | Goa | ₹8,500 | 4.9 |
| 2 | Forest Retreat Coorg | Coorg, Karnataka | ₹6,500 | 4.7 |
| 3 | Heritage Haveli Jaipur | Jaipur, Rajasthan | ₹12,000 | 4.8 |
| 4 | Lakeside Cabin Munnar | Munnar, Kerala | ₹5,500 | 4.6 |
| 5 | Desert Camp Jaisalmer | Jaisalmer, Rajasthan | ₹9,500 | 4.9 |
| 6 | Cliff House Rishikesh | Rishikesh, Uttarakhand | ₹7,000 | 4.7 |

---

## 13. WHAT DOESN'T EXIST YET (future work)

- Real payment integration (Razorpay — planned, user has keys, not wired)
- Real iCal sync logic (endpoints exist, sync engine pending)
- Frontend wired to real backend (still uses dummyProperties, mock setTimeout)
- Destinations page (`/destinations`) — linked but no page
- Offers page (`/offers`) — linked but no page
- Real email sending for forgot-password
- Alembic migrations (using `Base.metadata.create_all` for now)

### Current Session: 2026-05-10

**Completed:**
- Backend folder structure + 30 files (5 models, 6 routers, 3 services, schemas, config)
- PostgreSQL 18.3 confirmed running on WSL (localhost:5432)
- Python venv created, `requirements.txt` installed
- Design decisions confirmed (see plan at `~/.claude/plans/woolly-puzzling-bumblebee.md`)

**Confirmed Design Decisions:**
| Decision | Choice |
|----------|--------|
| Data source | Properties in Excel → manual entry via admin panel |
| User seeding | 1 admin (`staysearthy@gmail.com` / `admin123`), guests self-register |
| Frontend migration | Gradual — properties first |
| Payment gateway | Razorpay (user has API keys) |
| iCal | Full sync (export .ics feed + import parser) |
| Property model | Keep as designed — matches frontend fields |

**Next session — TO DO in order:**
1. Write DATABASE_URL to `backend/.env` (user provides the URL)
2. Start backend: `cd backend && source venv/bin/activate && uvicorn app.main:app --reload`
3. Verify `Base.metadata.create_all` creates all 6 tables on startup
4. Create `backend/seed.py` — admin user seed script
5. Add Razorpay (`app/services/payment.py` + payment endpoints on bookings router)
6. Add iCal engine (`app/services/ical.py` + export/import logic)
7. Update `requirements.txt` — add `razorpay`, `icalendar`
8. Begin gradual frontend migration (Step 1: wire `lib/data/properties.ts` → `GET /properties`)

**Next session prompt template:**
```
Context: Earthy Stays backend. Read CODEBASE.md section 9 (backend) and section 17 (current session).
Task: Continue from where we left off — [step from TO DO list].
```

---

## 14. CODING CONVENTIONS FOR THIS REPO

### TypeScript
- Strict mode enabled. No `any` types.
- Use `as const` for literal string types in style objects.
- Type event handlers: `(e.currentTarget as HTMLButtonElement)`.

### File Naming
- Pages: `page.tsx` (Next.js convention)
- Components: PascalCase `.tsx`
- Data/utils: camelCase `.ts`

### State Management
- No Redux/Zustand — local `useState` only.
- Forms: controlled inputs + manual validation.

### Comments
- Minimal inline comments. Self-documenting code preferred.

### Adding a New Page
1. Create `app/(main)/your-route/page.tsx`
2. Add `'use client'` if interactive
3. Wrap content in `<div className="page-shell">`
4. Use `<div className="content-shell">` for max-width container
5. Use dark header section with `backgroundColor:'var(--color-navbar)'`
6. Follow existing style patterns (no new patterns without necessity)

### Adding a New Component
1. Place in `components/layout/`, `components/property/`, or `components/shared/`
2. Accept typed props interface
3. Use CSS variables for all colors
4. Export as default

### Adding a Backend Endpoint
1. Add to `backend/main.py`
2. Create Pydantic model if needed
3. Update CORS if new origin needed
4. Frontend calls via `fetch('http://localhost:8000/endpoint')`

---

## 15. NIM / DeepSeek EFFICIENCY NOTES

To stay within free tier token limits:

- **Reference this file** instead of re-reading all source files each session.
- **Specify exactly which file** to edit: "Edit `frontend/app/(main)/properties/[id]/page.tsx`"
- **Give diffs, not full rewrites** when modifying existing files.
- **One task per prompt** — don't ask for multiple new pages at once.
- **Reuse patterns** — the input/label/button/card patterns are already defined above; tell the model to use them.
- **Don't re-explain the stack** — just say "using the established patterns in CODEBASE.md".

### Prompt Template
```
Context: Earthy Stays Next.js 16 + FastAPI project. Read CODEBASE.md for all conventions.
Task: [specific task]
File to modify/create: [path]
Constraints: Follow existing inline-style patterns, use CSS vars, TypeScript strict.
```

---

## 16. QUICK REFERENCE — IMPORT PATHS

```typescript
// Types
import { Property, Booking, BathroomDetail } from '@/lib/types'

// Data
import { dummyProperties } from '@/lib/data/properties'

// Components
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/layout/Hero'
import PropertyCard from '@/components/property/PropertyCard'
import MapWrapper from '@/components/shared/MapWrapper'

// Next.js
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
```

---

## 17. NEXT SESSION PICKUP (2026-05-10)

### State
- Backend: 30 files scaffolded, venv ready, deps installed
- PostgreSQL 18.3 running on localhost:5432
- `Base.metadata.create_all` active in `main.py` lifespan (tables auto-create)
- Frontend: still on `dummyProperties`, no API calls yet
- Plan file: `~/.claude/plans/woolly-puzzling-bumblebee.md`

### Blocked on user
- DATABASE_URL for `.env` (user provides connection string)

### TODO (unblocked, in order)
1. Write `.env` file with DATABASE_URL
2. `uvicorn app.main:app --reload` → verify tables create + `GET /` 200
3. `backend/seed.py` — admin seed (`staysearthy@gmail.com` / `admin123`)
4. Razorpay: `app/services/payment.py` + payment endpoints in bookings router
5. iCal engine: `app/services/ical.py` + export/import routes
6. Gradual frontend migration: `lib/api.ts` → wire properties first

### Decisions made (don't re-litigate)
| What | Answer |
|------|--------|
| Data | Manual entry via admin panel |
| Users | 1 admin seed, guests self-register |
| Migrations | `create_all` for now, Alembic later |
| Payment | Razorpay (user has keys, env vars) |
| iCal | Full implementation |
| Frontend | Gradual, properties-first |
| Property model | As designed, matches frontend |

---

*Last updated: 2026-05-10 — Backend scaffolded. PostgreSQL 18.3 running. Venv ready. Waiting for DATABASE_URL to start app. See section 17 for next session TODO.*