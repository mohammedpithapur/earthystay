# EarthyStay — Production Readiness Checklist

> Audit date: 2026-05-31  
> Target: 10,000 visits/day  
> Status: ⚠️  Not yet production-ready — see tasks below

---

## 🔴 Priority 1 — Critical (Security / Will Break in Prod)

### Backend — Secrets & Config

- [x] **Remove hardcoded JWT secrets from `config.py`**  
  `JWT_SECRET` and `JWT_REFRESH_SECRET` have literal string defaults in source code.  
  Replace with required fields (no default) so the app refuses to start without them.
  ```python
  # BEFORE (insecure)
  JWT_SECRET: str = "LeYLzV74iWt3EN7GU9S78FCjd1uEyzIdAiZZ0hKjxRm"
  # AFTER
  JWT_SECRET: str  # required — must be set in .env
  ```

- [x] **Remove hardcoded DATABASE_URL from `config.py`**  
  Plain-text password `12345678` is in source code. Same fix — make it a required field.

- [x] **Set `COOKIE_SECURE=True` in production**  
  Default is `False`, which sends the refresh token cookie over plain HTTP.  
  Set `COOKIE_SECURE=True` in your production `.env` (requires HTTPS on your server).

- [x] **Create `.env.example` in `/backend`**  
  Developers (and CI/CD) need to know what variables are required.  
  List every key with a placeholder value, never the real value.
  ```
  DATABASE_URL=postgresql+asyncpg://user:password@host/dbname
  JWT_SECRET=generate-with-openssl-rand-hex-32
  JWT_REFRESH_SECRET=generate-with-openssl-rand-hex-32
  COOKIE_SECURE=true
  COOKIE_DOMAIN=yourdomain.com
  CORS_ORIGINS=["https://yourdomain.com"]
  SUPABASE_URL=https://xxxx.supabase.co
  SUPABASE_SERVICE_KEY=your-service-key
  GOOGLE_CLIENT_ID=your-client-id
  GOOGLE_CLIENT_SECRET=your-client-secret
  GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/callback/google
  ```

- [x] **Add production CORS origins to `config.py` / `.env`**  
  `CORS_ORIGINS` currently defaults to `localhost:3000` and a WSL IP.  
  Set to `["https://yourdomain.com"]` in production `.env`.

- [x] **Remove `allow_origin_regex` in `main.py` (or make it dev-only)**  
  The regex `^https?://(localhost|127\.0\.0\.1)(:\d+)?$` always allows localhost,
  including in production. Wrap it in an `if settings.ENVIRONMENT == "development"` guard.

### Frontend — next.config.ts

- [x] **Remove `dangerouslyAllowLocalIP: true` from `next.config.ts`**  
  This is a development-only flag. It must be removed before deploying.

- [x] **Move Supabase hostname to an environment variable**  
  `ydxtenrfkhzbzognyitg.supabase.co` is hardcoded in `remotePatterns`.  
  Use `process.env.NEXT_PUBLIC_SUPABASE_HOSTNAME` instead.

- [x] **Create `.env.example` in `/frontend`**
  ```
  NEXT_PUBLIC_API_BASE=https://api.yourdomain.com
  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

### Backend — Startup

- [x] **Remove `Base.metadata.create_all` from lifespan in `main.py`**  
  Running `create_all` on every server startup is a dev shortcut. It conflicts with Alembic
  and causes race conditions with multiple instances. Use Alembic migrations exclusively.
  ```python
  # REMOVE this block from lifespan:
  async with engine.begin() as conn:
      await conn.run_sync(Base.metadata.create_all)
  ```

- [x] **Run Alembic migrations as part of deployment**  
  Add `alembic upgrade head` as a pre-start step in your deployment pipeline / Dockerfile.

### Deployment

- [x] **Write `Dockerfile` for the backend**  
  Use a multi-stage build: `python:3.12-slim`, install deps, copy app, run with uvicorn.

- [x] **Write `Dockerfile` for the frontend**  
  Add `output: 'standalone'` to `next.config.ts`, then use `node:20-alpine` image.

- [x] **Write `docker-compose.yml`** (or equivalent deployment config)  
  Orchestrate backend + frontend together for easy local prod testing.

---

## 🟠 Priority 2 — High (Reliability / Performance Under Load)

### Database — Connection Pool

- [x] **Configure SQLAlchemy connection pool in `database.py`**  
  Current: SQLAlchemy defaults (`pool_size=5`, `max_overflow=10`, no recycle, no pre-ping).  
  Supabase transaction pooler (port 6543) has connection limits.  
  ```python
  engine = create_async_engine(
      settings.DATABASE_URL,
      pool_size=10,
      max_overflow=20,
      pool_timeout=30,
      pool_recycle=1800,      # recycle connections every 30 min
      pool_pre_ping=True,     # test connection before use (avoids stale conn errors)
      connect_args={"statement_cache_size": 0},
  )
  ```

### Database — Missing Indexes

- [x] **Add index on `bookings.property_id`**  
  Used in every availability check query. Currently does a full table scan.

- [x] **Add index on `bookings.guest_id`**  
  Used in `GET /bookings/mine`. Currently does a full table scan.

- [x] **Add index on `bookings.status`**  
  Filtered on in every booking list query (admin + user dashboard).

- [x] **Add composite index on `(bookings.property_id, bookings.check_in, bookings.check_out)`**  
  The availability overlap check is the hottest query path — critical for performance.

- [x] **Add index on `properties.is_published`**  
  Every public property listing query filters `WHERE is_published = TRUE`.

- [x] **Add index on `properties.owner_id`**  
  Used in admin views to list properties by owner.

- [x] **Add composite index on `(properties.is_published, properties.city)`**  
  The most common browse pattern: published properties in a city.

  > After adding indexes to models, generate and run an Alembic migration.

### Security — Rate Limiting

- [x] **Add rate limiting to `POST /auth/login`**  
  Install `slowapi` and limit to 5–10 requests/minute per IP.
  Without this, brute-force password attacks are trivially possible.

- [x] **Add rate limiting to `POST /auth/register`**  
  Prevent spam account creation.

- [x] **Add rate limiting to `POST /bookings`**  
  Prevent booking spam.

### Security — Password Validation

- [x] **Add minimum password length validation in `RegisterIn` schema**  
  Currently a user can register with password `"a"`. Add `min_length=8` validator.
  ```python
  @validator('password')
  def password_strength(cls, v):
      if len(v) < 8:
          raise ValueError('Password must be at least 8 characters')
      return v
  ```

---

## 🟡 Priority 3 — Medium (Observability / Missing Features)

### Ops — Health Check

- [x] **Add `GET /health` endpoint to `main.py`**  
  Should check DB connectivity and return `{"status": "ok"}` or `503`.  
  Required for load balancers, Docker healthchecks, and uptime monitors.
  ```python
  @app.get("/health")
  async def health(db: AsyncSession = Depends(get_db)):
      await db.execute(text("SELECT 1"))
      return {"status": "ok"}
  ```

### Ops — Logging

- [x] **Add structured request logging middleware**  
  Install `loguru` or configure Python's `logging` with JSON formatter.  
  Log: method, path, status code, response time, request ID on every request.

- [x] **Add error tracking (Sentry)**  
  Install `sentry-sdk[fastapi]`. One line of setup gives you automatic error capture,
  performance tracing, and alerts on 500 errors.
  ```python
  import sentry_sdk
  sentry_sdk.init(dsn=settings.SENTRY_DSN, traces_sample_rate=0.1)
  ```

### Ops — Requirements

- [x] **Pin all package versions in `requirements.txt`**  
  `uvicorn`, `asyncpg`, `bcrypt`, `supabase`, `httpx` have no version constraints.
  Unpinned deps can break silently on next deploy. Run `pip freeze > requirements.txt`
  after testing to lock all transitive deps.

- [x] **Move test deps to `requirements-dev.txt`**  
  `pytest`, `pytest-asyncio`, `pytest-html` should not be installed in production.
  Create a separate `requirements-dev.txt` and use `pip install -r requirements-dev.txt`
  only in CI/dev environments.

- [x] **Add `gunicorn` to `requirements.txt`**  
  Production needs `gunicorn` as a process manager wrapping uvicorn workers.
  ```
  CMD ["gunicorn", "app.main:app", "-k", "uvicorn.workers.UvicornWorker", "-w", "4", "--bind", "0.0.0.0:8000"]
  ```

### Features — Password Reset (Stub → Real)

- [x] **Implement `POST /auth/forgot-password`**  
  Currently returns `{"message": "..."}` without sending any email.  
  Needs: generate a signed reset token, store expiry, send email via Resend/SendGrid.

- [x] **Implement `POST /auth/reset-password`**  
  Currently returns success without changing anything.  
  Needs: verify token, check expiry, update password hash, invalidate token.

- [x] **Choose and configure an email provider**  
  Options: [Resend](https://resend.com) (easiest), SendGrid, AWS SES.  
  Add `RESEND_API_KEY` (or equivalent) to `.env.example`.

### User Model — Missing Fields

- [x] **Add `is_active` field to `User` model**  
  Without this there is no way to suspend or ban a user short of deleting them.
  ```python
  is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
  ```
  Add guard in `get_current_user` dependency to reject inactive users.

- [x] **Add `is_email_verified` field (optional but recommended)**  
  Allows you to block unverified accounts from making bookings.

### Security — Token Improvements

- [x] **Use `secrets.choice` instead of `random.choices` for `booking_ref` generation**  
  `random` is not cryptographically random. Use `secrets` module.
  ```python
  import secrets, string
  def _generate_booking_ref() -> str:
      chars = string.ascii_uppercase + string.digits
      return 'ES-' + ''.join(secrets.choice(chars) for _ in range(6))
  ```

---

## 🔵 Priority 4 — Low (Performance Optimisations)

### Frontend — Caching / ISR

- [x] **Add ISR (Incremental Static Regeneration) to property listing page**  
  The `/properties` page is public and mostly static. Revalidate every hour:
  ```typescript
  export const revalidate = 3600 // regenerate at most once per hour
  ```

- [x] **Add `output: 'standalone'` to `next.config.ts`**  
  Required for building a minimal Docker image of the Next.js app.

- [x] **Add security response headers in `next.config.ts`**  
  Add `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and CSP headers
  via the `headers()` config function.

### Backend — Caching (Redis)

- [x] **Add Redis caching for property listings**  
  Install `redis[asyncio]`. Cache `GET /properties` responses for 5 minutes.  
  Reduces DB load by ~80% for the highest-traffic endpoint.

- [x] **Cache user lookup in `get_current_user` dependency**  
  Currently hits the DB on every authenticated request to fetch the user row.  
  A short Redis TTL (60s) keyed on user ID would eliminate this overhead.

### Backend — bcrypt Performance

- [x] **Offload bcrypt to a thread pool**  
  `bcrypt.checkpw` is CPU-bound and blocks the async event loop.  
  Wrap in `asyncio.to_thread()`:
  ```python
  import asyncio
  async def verify_password_async(plain: str, hashed: str) -> bool:
      return await asyncio.to_thread(bcrypt.checkpw, plain.encode(), hashed.encode())
  ```

---

## Done ✅ (Already Production-Quality)

- [x] Async FastAPI with SQLAlchemy async — correct pattern
- [x] JWT dual-token system (access + httpOnly refresh cookie)
- [x] Pessimistic DB locking on booking creation (prevents double-booking)
- [x] Separate JWT secrets for access vs refresh tokens
- [x] Refresh token includes `jti` claim (ready for blocklist)
- [x] bcrypt password hashing
- [x] Supabase CDN for images (scalable, not on your server)
- [x] Foreign key constraints with cascade delete
- [x] Alembic installed and migration directory set up
- [x] Admin role-based access control
- [x] TypeScript strict mode on frontend
- [x] Next.js App Router with server components
- [x] `booking_ref` indexed
- [x] `users.email` unique + indexed
- [x] `properties.city` indexed
- [x] `expire_on_commit=False` on async session (correct)
- [x] iCal export (RFC 5545 compliant)
- [x] Group blocking on bookings (atomic)

---

## Recommended Deployment Stack

| Layer | Recommended Service | Notes |
|-------|-------------------|-------|
| **Frontend** | Vercel | Zero config Next.js, free tier, global CDN |
| **Backend** | Railway / Render | Auto-deploys from Git, free tier available |
| **Database** | Supabase (existing) | Already in use |
| **Images** | Supabase Storage (existing) | Already in use |
| **Email** | Resend | Easiest API, generous free tier |
| **Error tracking** | Sentry | Free for small projects |
| **Rate limiting** | slowapi (in-process) | Or Cloudflare in front of API |
| **Caching** | Upstash Redis | Serverless Redis, free tier |

---

*Generated by: Production audit — May 2026*
