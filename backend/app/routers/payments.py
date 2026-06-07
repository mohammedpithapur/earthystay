"""
Payments router — Razorpay integration.

Endpoints:
  POST /payments/create-order   → creates Razorpay order + Payment record (user auth)
  POST /payments/verify         → verifies HMAC signature → confirms booking (user auth)
  POST /payments/webhook        → Razorpay event handler — source of truth (public, sig-verified)
  POST /payments/{id}/refund    → triggers Razorpay refund (admin only)
"""
import hashlib
import hmac
import json
import sys
import types
import uuid

# ── pkg_resources shim ────────────────────────────────────────────────────────
# razorpay SDK (v1.4.2) imports pkg_resources to read its own version.
# In Python 3.12 venvs with modern setuptools, pkg_resources may not be on
# sys.path even when setuptools is installed. Inject a minimal shim so the
# SDK can load without error.
try:
    import pkg_resources  # noqa: F401
except ImportError:
    _shim = types.ModuleType("pkg_resources")

    class _Dist:
        version = "0.0.0"

    _shim.get_distribution = lambda _name: _Dist()  # type: ignore[attr-defined]
    _shim.DistributionNotFound = Exception  # type: ignore[attr-defined]
    sys.modules["pkg_resources"] = _shim

import razorpay

from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db, utc_now
from app.dependencies import get_admin, get_current_user
from app.models.booking import Booking, BookingStatus, PaymentStatus
from app.models.payment import Payment, RazorpayPaymentStatus
from app.models.user import User
from app.models.property import Property
from app.schemas.booking import BookingOut
from app.schemas.payment import PaymentOrderCreate, PaymentOrderOut, PaymentOut, PaymentVerifyIn
from app.services.email import send_booking_confirmation_email, send_admin_new_booking_email
from app.services.sms import send_booking_confirmation_sms


router = APIRouter(prefix="/payments", tags=["payments"])


def _get_razorpay_client() -> razorpay.Client:
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


def _verify_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """HMAC-SHA256 verification as per Razorpay docs."""
    message = f"{order_id}|{payment_id}"
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        message.encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


# ── POST /payments/create-order ──────────────────────────────────────────────

@router.post("/create-order", response_model=PaymentOrderOut)
async def create_payment_order(
    data: PaymentOrderCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a Razorpay order for a pending booking.
    Idempotent: if a Payment record already exists for this booking,
    returns it instead of creating a duplicate order.
    """
    booking = await db.get(Booking, data.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.guest_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    if booking.status != BookingStatus.pending:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot pay for a booking with status '{booking.status.value}'",
        )
    if booking.payment_status != PaymentStatus.unpaid:
        raise HTTPException(
            status_code=409,
            detail=f"Booking payment status is already '{booking.payment_status.value}'",
        )

    # Idempotency: return existing order if already created
    existing = await db.scalar(
        select(Payment).where(Payment.booking_id == booking.id)
    )
    if existing and existing.status == RazorpayPaymentStatus.created:
        return PaymentOrderOut(
            payment_id=existing.id,
            razorpay_order_id=existing.razorpay_order_id,
            amount=existing.amount,
            currency=existing.currency,
            key_id=settings.RAZORPAY_KEY_ID,
        )

    amount_paise = booking.total * 100  # ₹ → paise

    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(
            status_code=503,
            detail="Payment gateway not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env",
        )

    client = _get_razorpay_client()
    rz_order = client.order.create(
        {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": booking.booking_ref,
            "payment_capture": 1,  # auto-capture
        }
    )

    payment = Payment(
        id=uuid.uuid4(),
        booking_id=booking.id,
        razorpay_order_id=rz_order["id"],
        amount=amount_paise,
        currency="INR",
        status=RazorpayPaymentStatus.created,
    )
    db.add(payment)
    await db.commit()
    await db.refresh(payment)

    return PaymentOrderOut(
        payment_id=payment.id,
        razorpay_order_id=payment.razorpay_order_id,
        amount=payment.amount,
        currency=payment.currency,
        key_id=settings.RAZORPAY_KEY_ID,
    )


# ── POST /payments/verify ────────────────────────────────────────────────────

@router.post("/verify", response_model=BookingOut)
async def verify_payment(
    data: PaymentVerifyIn,
    background_tasks: BackgroundTasks,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Called by frontend after Razorpay checkout succeeds.
    Verifies HMAC-SHA256 signature, then atomically:
      - marks Payment as paid
      - sets Booking.status = confirmed, Booking.payment_status = paid
    Returns the updated booking.
    """
    payment = await db.scalar(
        select(Payment).where(Payment.razorpay_order_id == data.razorpay_order_id)
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    # Verify ownership
    booking = await db.get(Booking, payment.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.guest_id != user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    # Idempotency: already verified
    if payment.status == RazorpayPaymentStatus.paid:
        return booking

    # Verify HMAC-SHA256 signature
    if not _verify_signature(
        data.razorpay_order_id,
        data.razorpay_payment_id,
        data.razorpay_signature,
    ):
        payment.status = RazorpayPaymentStatus.failed
        await db.commit()
        raise HTTPException(status_code=400, detail="Payment signature verification failed")

    # Atomic update: payment + booking in one transaction
    payment.status = RazorpayPaymentStatus.paid
    payment.razorpay_payment_id = data.razorpay_payment_id
    payment.razorpay_signature = data.razorpay_signature
    payment.updated_at = utc_now()

    booking.status = BookingStatus.confirmed
    booking.payment_status = PaymentStatus.paid

    await db.commit()
    await db.refresh(booking)

    # Trigger notifications in the background
    property_obj = await db.get(Property, booking.property_id)
    property_name = property_obj.name if property_obj else "EarthyStay Property"

    background_tasks.add_task(
        send_booking_confirmation_email,
        to_email=booking.guest_email,
        guest_name=booking.guest_name,
        booking_ref=booking.booking_ref,
        property_name=property_name,
        check_in=str(booking.check_in),
        check_out=str(booking.check_out),
        guests=str(booking.guests),
        nights=str(booking.nights),
        total=str(booking.total),
    )
    if booking.guest_phone:
        background_tasks.add_task(
            send_booking_confirmation_sms,
            phone=booking.guest_phone,
            booking_ref=booking.booking_ref,
            property_name=property_name,
            check_in=str(booking.check_in),
            check_out=str(booking.check_out),
            total=str(booking.total),
        )
    admin_email = property_obj.contact_email if (property_obj and property_obj.contact_email) else "admin@earthystay.com"
    background_tasks.add_task(
        send_admin_new_booking_email,
        admin_email=admin_email,
        guest_name=booking.guest_name,
        guest_email=booking.guest_email,
        guest_phone=booking.guest_phone or "",
        booking_ref=booking.booking_ref,
        property_name=property_name,
        check_in=str(booking.check_in),
        check_out=str(booking.check_out),
        guests=str(booking.guests),
        nights=str(booking.nights),
        total=str(booking.total),
    )

    return booking


# ── POST /payments/webhook ───────────────────────────────────────────────────

@router.post("/webhook", status_code=200)
async def razorpay_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Razorpay sends signed POST events here.
    This is the SOURCE OF TRUTH — more reliable than the frontend verify endpoint
    because the user might close the browser before verify is called.

    Always returns 200 — Razorpay will retry on any non-200 response.
    """
    body = await request.body()
    sig = request.headers.get("X-Razorpay-Signature", "")
    webhook_secret = settings.RAZORPAY_KEY_SECRET  # use webhook secret if configured separately

    # Verify webhook signature
    expected = hmac.new(
        webhook_secret.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()
    if not hmac.compare_digest(expected, sig):
        # Return 200 anyway so Razorpay doesn't retry — but log the failure
        return {"status": "signature_mismatch"}

    try:
        event = json.loads(body)
    except json.JSONDecodeError:
        return {"status": "invalid_json"}

    event_type: str = event.get("event", "")
    payload = event.get("payload", {})

    # ── payment.captured ──────────────────────────────────────────────────────
    if event_type == "payment.captured":
        payment_entity = payload.get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")
        payment_id = payment_entity.get("id")

        if order_id and payment_id:
            payment = await db.scalar(
                select(Payment).where(Payment.razorpay_order_id == order_id)
            )
            if payment and payment.status != RazorpayPaymentStatus.paid:
                payment.status = RazorpayPaymentStatus.paid
                payment.razorpay_payment_id = payment_id
                payment.updated_at = utc_now()

                booking = await db.get(Booking, payment.booking_id)
                if booking:
                    booking.status = BookingStatus.confirmed
                    booking.payment_status = PaymentStatus.paid
                    await db.commit()
                    await db.refresh(booking)

                    # Trigger notifications
                    property_obj = await db.get(Property, booking.property_id)
                    property_name = property_obj.name if property_obj else "EarthyStay Property"

                    background_tasks.add_task(
                        send_booking_confirmation_email,
                        to_email=booking.guest_email,
                        guest_name=booking.guest_name,
                        booking_ref=booking.booking_ref,
                        property_name=property_name,
                        check_in=str(booking.check_in),
                        check_out=str(booking.check_out),
                        guests=str(booking.guests),
                        nights=str(booking.nights),
                        total=str(booking.total),
                    )
                    if booking.guest_phone:
                        background_tasks.add_task(
                            send_booking_confirmation_sms,
                            phone=booking.guest_phone,
                            booking_ref=booking.booking_ref,
                            property_name=property_name,
                            check_in=str(booking.check_in),
                            check_out=str(booking.check_out),
                            total=str(booking.total),
                        )
                    admin_email = property_obj.contact_email if (property_obj and property_obj.contact_email) else "admin@earthystay.com"
                    background_tasks.add_task(
                        send_admin_new_booking_email,
                        admin_email=admin_email,
                        guest_name=booking.guest_name,
                        guest_email=booking.guest_email,
                        guest_phone=booking.guest_phone or "",
                        booking_ref=booking.booking_ref,
                        property_name=property_name,
                        check_in=str(booking.check_in),
                        check_out=str(booking.check_out),
                        guests=str(booking.guests),
                        nights=str(booking.nights),
                        total=str(booking.total),
                    )
                else:
                    await db.commit()

    # ── payment.failed ────────────────────────────────────────────────────────
    elif event_type == "payment.failed":
        payment_entity = payload.get("payment", {}).get("entity", {})
        order_id = payment_entity.get("order_id")

        if order_id:
            payment = await db.scalar(
                select(Payment).where(Payment.razorpay_order_id == order_id)
            )
            if payment and payment.status == RazorpayPaymentStatus.created:
                payment.status = RazorpayPaymentStatus.failed
                payment.updated_at = utc_now()
                await db.commit()

    # ── refund.created ────────────────────────────────────────────────────────
    elif event_type == "refund.created":
        payment_entity = payload.get("refund", {}).get("entity", {})
        payment_id = payment_entity.get("payment_id")

        if payment_id:
            payment = await db.scalar(
                select(Payment).where(Payment.razorpay_payment_id == payment_id)
            )
            if payment:
                payment.status = RazorpayPaymentStatus.refunded
                payment.updated_at = utc_now()

                booking = await db.get(Booking, payment.booking_id)
                if booking:
                    booking.payment_status = PaymentStatus.refunded

                await db.commit()

    return {"status": "ok"}


# ── POST /payments/{payment_id}/refund ───────────────────────────────────────

@router.post("/{payment_id}/refund", response_model=PaymentOut)
async def refund_payment(
    payment_id: uuid.UUID,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Admin-only: triggers a full refund via Razorpay API.
    Updates payment.status → refunded and booking.payment_status → refunded.
    """
    payment = await db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.status != RazorpayPaymentStatus.paid:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot refund payment with status '{payment.status.value}'",
        )
    if not payment.razorpay_payment_id:
        raise HTTPException(status_code=409, detail="No Razorpay payment ID recorded")

    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payment gateway not configured")

    client = _get_razorpay_client()
    try:
        client.payment.refund(
            payment.razorpay_payment_id,
            {"amount": payment.amount, "speed": "normal"},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Razorpay refund failed: {exc}",
        )

    payment.status = RazorpayPaymentStatus.refunded
    payment.updated_at = utc_now()

    booking = await db.get(Booking, payment.booking_id)
    if booking:
        booking.payment_status = PaymentStatus.refunded

    await db.commit()
    await db.refresh(payment)
    return payment


# ── GET /payments/booking/{booking_id} ───────────────────────────────────────

@router.get("/booking/{booking_id}", response_model=PaymentOut)
async def get_payment_for_booking(
    booking_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns the payment record for a booking (owner or admin only)."""
    booking = await db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.guest_id != user.id and user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    payment = await db.scalar(
        select(Payment).where(Payment.booking_id == booking_id)
    )
    if not payment:
        raise HTTPException(status_code=404, detail="No payment record for this booking")
    return payment
