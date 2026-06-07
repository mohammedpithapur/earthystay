import pytest
from app.services.email import (
    send_booking_confirmation_email,
    send_booking_cancellation_email,
    send_admin_new_booking_email,
)
from app.services.sms import (
    send_booking_confirmation_sms,
    send_booking_cancellation_sms,
)

pytestmark = pytest.mark.asyncio


async def test_email_notifications_in_dev_mode():
    # In dev/mock mode (no API key), these should return True and log to console without raising errors
    res1 = await send_booking_confirmation_email(
        to_email="guest@example.com",
        guest_name="John Doe",
        booking_ref="ES-TEST12",
        property_name="Sunset Villa",
        check_in="2026-07-01",
        check_out="2026-07-05",
        guests="2",
        nights="4",
        total="15000",
    )
    assert res1 is True

    res2 = await send_booking_cancellation_email(
        to_email="guest@example.com",
        guest_name="John Doe",
        booking_ref="ES-TEST12",
        property_name="Sunset Villa",
        refund=True,
        total="15000",
    )
    assert res2 is True

    res3 = await send_booking_cancellation_email(
        to_email="guest@example.com",
        guest_name="John Doe",
        booking_ref="ES-TEST12",
        property_name="Sunset Villa",
        refund=False,
        total="15000",
    )
    assert res3 is True

    res4 = await send_admin_new_booking_email(
        admin_email="host@example.com",
        guest_name="John Doe",
        guest_email="guest@example.com",
        guest_phone="9876543210",
        booking_ref="ES-TEST12",
        property_name="Sunset Villa",
        check_in="2026-07-01",
        check_out="2026-07-05",
        guests="2",
        nights="4",
        total="15000",
    )
    assert res4 is True


async def test_sms_notifications_in_dev_mode():
    res1 = await send_booking_confirmation_sms(
        phone="9876543210",
        booking_ref="ES-TEST12",
        property_name="Sunset Villa",
        check_in="2026-07-01",
        check_out="2026-07-05",
        total="15000",
    )
    assert res1 is True

    res2 = await send_booking_cancellation_sms(
        phone="9876543210",
        booking_ref="ES-TEST12",
        property_name="Sunset Villa",
        refund=True,
    )
    assert res2 is True

    res3 = await send_booking_cancellation_sms(
        phone="9876543210",
        booking_ref="ES-TEST12",
        property_name="Sunset Villa",
        refund=False,
    )
    assert res3 is True
