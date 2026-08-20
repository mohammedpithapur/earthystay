import logging
from pathlib import Path

import httpx
from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.config import settings


logger = logging.getLogger("earthystay.email")
TEMPLATE_DIR = Path(__file__).resolve().parents[1] / "templates"

_jinja_env = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(["html"]),
)


def _render_template(name: str, **context) -> str:
    template = _jinja_env.get_template(name)
    return template.render(**context)


async def send_password_reset_email(to_email: str, reset_url: str) -> bool:
    if not settings.RESEND_API_KEY:
        if settings.ENVIRONMENT == "development":
            logger.info("Password reset link for %s: %s", to_email, reset_url)
            return True
        logger.error("RESEND_API_KEY is not configured")
        return False

    async with httpx.AsyncClient(timeout=10) as client:
        html = _render_template("reset_password.html", reset_url=reset_url)
        response = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": settings.RESEND_FROM_EMAIL,
                "to": [to_email],
                "subject": "Reset your EarthyStay password",
                "html": html,
            },
        )
    if response.is_success:
        return True
    logger.error("Resend password reset email failed: %s %s", response.status_code, response.text)
    return False


async def send_verification_otp_email(to_email: str, code: str) -> bool:
    if not settings.RESEND_API_KEY:
        logger.info("RESEND_API_KEY is not configured or in dev. Verification OTP for %s: %s", to_email, code)
        return True

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            html = _render_template("verification_otp.html", code=code)
            response = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
                json={
                    "from": settings.RESEND_FROM_EMAIL,
                    "to": [to_email],
                    "subject": f"{code} is your EarthyStay verification code",
                    "html": html,
                },
            )
        if response.is_success:
            return True
        logger.error("Resend OTP verification email failed: %s %s", response.status_code, response.text)
        return False
    except Exception as e:
        logger.error("Failed to send OTP email via Resend: %s", e)
        return False


async def send_booking_confirmation_email(
    to_email: str,
    guest_name: str,
    booking_ref: str,
    property_name: str,
    check_in: str,
    check_out: str,
    guests: str,
    nights: str,
    total: str,
    property_city: str = "",
    property_state: str = "",
    property_address: str = "",
    checkin_time: str = "2:00 PM",
    checkout_time: str = "11:00 AM",
    booking_email_instructions: str = "",
    contact_phone: str = "",
    contact_email: str = "",
    contact_whatsapp: str = "",
    contact_spare_phone: str = "",
    house_rules: list[str] = None,
) -> bool:
    dashboard_url = f"{settings.FRONTEND_BASE_URL}/dashboard"
    html = _render_template(
        "booking_confirmation.html",
        guest_name=guest_name,
        booking_ref=booking_ref,
        property_name=property_name,
        property_city=property_city,
        property_state=property_state,
        property_address=property_address,
        checkin_time=checkin_time,
        checkout_time=checkout_time,
        check_in=check_in,
        check_out=check_out,
        guests=guests,
        nights=nights,
        total=total,
        dashboard_url=dashboard_url,
        booking_email_instructions=booking_email_instructions,
        contact_phone=contact_phone,
        contact_email=contact_email,
        contact_whatsapp=contact_whatsapp,
        contact_spare_phone=contact_spare_phone,
        house_rules=house_rules or [],
    )
    subject = f"Booking Confirmed: {property_name} ({booking_ref})"

    if not settings.RESEND_API_KEY:
        if settings.ENVIRONMENT == "development":
            logger.info("[DEV EMAIL] Confirmation to %s:\n%s", to_email, html)
            return True
        logger.error("RESEND_API_KEY is not configured")
        return False

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
                json={
                    "from": settings.RESEND_FROM_EMAIL,
                    "to": [to_email],
                    "subject": subject,
                    "html": html,
                },
            )
        if response.is_success:
            logger.info("Successfully sent booking confirmation email to %s (booking_ref: %s)", to_email, booking_ref)
            return True
        logger.error("Resend confirmation email failed for %s: %s %s", to_email, response.status_code, response.text)
        return False
    except Exception as exc:
        logger.exception("Error sending confirmation email to %s via Resend: %s", to_email, exc)
        return False


async def send_booking_cancellation_email(
    to_email: str,
    guest_name: str,
    booking_ref: str,
    property_name: str,
    refund: bool,
    total: str,
) -> bool:
    dashboard_url = f"{settings.FRONTEND_BASE_URL}/dashboard"
    if refund:
        refund_status_message = f"A full refund of \u20b9{total} has been initiated to your original payment method. Please allow 5-7 business days for it to reflect in your account."
    else:
        refund_status_message = "As per our booking terms, this cancellation is non-refundable."

    html = _render_template(
        "booking_cancellation.html",
        guest_name=guest_name,
        booking_ref=booking_ref,
        property_name=property_name,
        refund_status_message=refund_status_message,
        dashboard_url=dashboard_url,
    )
    subject = f"Booking Cancelled: {booking_ref}"

    if not settings.RESEND_API_KEY:
        if settings.ENVIRONMENT == "development":
            logger.info("[DEV EMAIL] Cancellation to %s:\n%s", to_email, html)
            return True
        logger.error("RESEND_API_KEY is not configured")
        return False

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
                json={
                    "from": settings.RESEND_FROM_EMAIL,
                    "to": [to_email],
                    "subject": subject,
                    "html": html,
                },
            )
        if response.is_success:
            logger.info("Successfully sent cancellation email to %s (booking_ref: %s)", to_email, booking_ref)
            return True
        logger.error("Resend cancellation email failed for %s: %s %s", to_email, response.status_code, response.text)
        return False
    except Exception as exc:
        logger.exception("Error sending cancellation email to %s via Resend: %s", to_email, exc)
        return False


async def send_admin_new_booking_email(
    admin_email: str,
    guest_name: str,
    guest_email: str,
    guest_phone: str,
    booking_ref: str,
    property_name: str,
    check_in: str,
    check_out: str,
    guests: str,
    nights: str,
    total: str,
    property_city: str = "",
    property_state: str = "",
    special_requests: str = "",
    razorpay_payment_id: str = "",
) -> bool:
    admin_url = f"{settings.FRONTEND_BASE_URL}/admin"
    html = _render_template(
        "admin_new_booking.html",
        property_name=property_name,
        property_city=property_city,
        property_state=property_state,
        booking_ref=booking_ref,
        check_in=check_in,
        check_out=check_out,
        nights=nights,
        guests=guests,
        total=total,
        guest_name=guest_name,
        guest_email=guest_email,
        guest_phone=guest_phone or "N/A",
        special_requests=special_requests,
        razorpay_payment_id=razorpay_payment_id or "N/A",
        admin_url=admin_url,
    )
    subject = f"[Admin Alert] New booking for {property_name} ({booking_ref})"

    if not settings.RESEND_API_KEY:
        if settings.ENVIRONMENT == "development":
            logger.info("[DEV EMAIL] Admin Alert to %s:\n%s", admin_email, html)
            return True
        logger.error("RESEND_API_KEY is not configured")
        return False

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": settings.RESEND_FROM_EMAIL,
                "to": [admin_email],
                "subject": subject,
                "html": html,
            },
        )
    if response.is_success:
        return True
    logger.error("Resend admin email failed: %s %s", response.status_code, response.text)
    return False


async def send_event_enquiry_confirmation_email(
    to_email: str,
    name: str,
    event_ref: str,
    nature_of_event: str,
    destination: str,
    hotel: str,
    event_start_date: str,
    event_end_date: str,
    no_of_guests: str,
    requires_rooms: bool,
    no_of_rooms: int,
    additional_details: str,
    phone: str,
) -> bool:
    """Send branded enquiry confirmation to the guest."""
    html = _render_template(
        "event_enquiry_confirmation.html",
        name=name,
        event_ref=event_ref,
        nature_of_event=nature_of_event,
        destination=destination,
        hotel=hotel or "",
        event_start_date=event_start_date,
        event_end_date=event_end_date,
        no_of_guests=no_of_guests,
        requires_rooms=requires_rooms,
        no_of_rooms=no_of_rooms,
        additional_details=additional_details or "",
        phone=phone,
        email=to_email,
    )
    subject = f"Enquiry Received: {nature_of_event} at {destination} — EarthyStay"

    if not settings.RESEND_API_KEY:
        if settings.ENVIRONMENT == "development":
            logger.info("[DEV EMAIL] Event enquiry confirmation to %s", to_email)
            return True
        logger.error("RESEND_API_KEY is not configured")
        return False

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
                json={
                    "from": settings.RESEND_FROM_EMAIL,
                    "to": [to_email],
                    "subject": subject,
                    "html": html,
                },
            )
        if response.is_success:
            logger.info("Sent event enquiry confirmation to %s", to_email)
            return True
        logger.error("Resend event email failed: %s %s", response.status_code, response.text)
        return False
    except Exception as exc:
        logger.exception("Error sending event enquiry email to %s: %s", to_email, exc)
        return False


async def send_admin_event_enquiry_email(
    admin_email: str,
    name: str,
    event_ref: str,
    nature_of_event: str,
    destination: str,
    hotel: str,
    event_start_date: str,
    event_end_date: str,
    no_of_guests: str,
    phone: str,
    guest_email: str,
    additional_details: str,
) -> bool:
    """Send new event enquiry alert to admin."""
    admin_url = f"{settings.FRONTEND_BASE_URL}/admin"
    rows = [
        ("Ref", event_ref),
        ("Event Type", nature_of_event),
        ("Destination", destination),
        ("Venue", hotel or "—"),
        ("Date", f"{event_start_date} – {event_end_date}" if event_end_date != event_start_date else event_start_date),
        ("Guests", no_of_guests),
        ("Name", name),
        ("Phone", phone),
        ("Email", guest_email),
    ]
    rows_html = "".join(
        f"<tr><td style='padding:5px 16px 5px 0;color:#7a7167;white-space:nowrap;'>{label}</td>"
        f"<td style='padding:5px 0;color:#2b2017;font-weight:600;word-break:break-all;'>{value}</td></tr>"
        for label, value in rows
    )
    note_block = (
        f"<div style='background:#fffaf4;border-left:3px solid #ead0af;border-radius:0 8px 8px 0;"
        f"padding:16px 20px;margin-bottom:24px;'>"
        f"<p style='margin:0 0 6px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#b7895f;font-weight:700;'>Message</p>"
        f"<p style='margin:0;font-size:14px;color:#000;line-height:1.7;'>{additional_details}</p></div>"
        if additional_details else ""
    )
    html = (
        f"<!doctype html><html><body style='margin:0;padding:0;background:#f7efe6;font-family:Arial,sans-serif;'>"
        f"<div style='max-width:600px;margin:0 auto;padding:32px 16px;'>"
        f"<div style='background:#2b2017;border-radius:10px 10px 0 0;padding:24px 32px;text-align:center;'>"
        f"<p style='margin:0 0 4px;font-size:12px;letter-spacing:4px;text-transform:uppercase;color:#ffffff;font-weight:700;'>EarthyStay Admin</p>"
        f"<h1 style='margin:0;font-size:22px;color:#ead0af;font-weight:700;'>New Event Enquiry</h1></div>"
        f"<div style='background:#ffffff;padding:32px;'>"
        f"<p style='margin:0 0 20px;font-size:15px;color:#000000;'>A new <strong>{nature_of_event}</strong> enquiry has been submitted.</p>"
        f"<div style='background:#fffaf4;border:1px solid #d9c2a8;border-radius:8px;padding:20px;margin-bottom:24px;'>"
        f"<table style='width:100%;border-collapse:collapse;font-size:14px;'>{rows_html}</table></div>"
        f"{note_block}"
        f"<div style='text-align:center;'>"
        f"<a href='{admin_url}' style='display:inline-block;background:#b7895f;color:#ffffff;text-decoration:none;"
        f"border-radius:6px;padding:12px 28px;font-size:13px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;'>"
        f"Open Admin Panel</a></div></div>"
        f"<div style='background:#ead1b3;border-radius:0 0 10px 10px;padding:16px 32px;text-align:center;border-top:1px solid #d9c2a8;'>"
        f"<p style='margin:0;font-size:12px;color:#2b2017;'>EarthyStay Admin Notification</p></div>"
        f"</div></body></html>"
    )

    subject = f"[Admin] New {nature_of_event} Enquiry — {name} ({destination})"

    if not settings.RESEND_API_KEY:
        logger.info("[DEV EMAIL] Admin event alert to %s", admin_email)
        return True

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
                json={
                    "from": settings.RESEND_FROM_EMAIL,
                    "to": [admin_email],
                    "subject": subject,
                    "html": html,
                },
            )
        if response.is_success:
            return True
        logger.error("Admin event email failed: %s %s", response.status_code, response.text)
        return False
    except Exception as exc:
        logger.exception("Error sending admin event email: %s", exc)
        return False
