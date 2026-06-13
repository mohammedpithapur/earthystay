import pytest
from sqlalchemy import select
from datetime import date, timedelta
from app.models.booking import Booking

pytestmark = pytest.mark.asyncio


def _property_payload(name: str, overrides: dict | None = None):
    data = {
        "name": name,
        "description": "A lovely test property for calendar tests",
        "address": "123 Calendar Street",
        "city": "Goa",
        "state": "Goa",
        "country": "India",
        "latitude": 15.2993,
        "longitude": 74.124,
        "contact_phone": "+91 9999999999",
        "contact_email": f"{name.lower().replace(' ', '')}@example.com",
        "check_in_time": "2:00 PM",
        "check_out_time": "11:00 AM",
        "house_rules": ["No smoking"],
        "price_per_night": 5000,
        "cleaning_fee": 800,
        "max_guests": 4,
        "bedrooms": 2,
        "bathrooms": 2,
        "bathrooms_detail": [{"type": "ensuite", "count": 2}],
        "min_nights": 1,
        "pets_allowed": False,
        "pet_charge_per_night": 0,
        "amenities": ["WiFi"],
        "is_published": True,
    }
    if overrides:
        data.update(overrides)
    return data


async def test_admin_calendar_blocking_flow(client, admin_headers, user_headers, db_session):
    # 1. Create a property
    res = await client.post("/admin/properties", headers=admin_headers, json=_property_payload("Calendar Property 1"))
    assert res.status_code == 200
    prop = res.json()
    prop_id = prop["id"]

    # 2. Get calendar (should be empty initially)
    cal_res = await client.get(f"/admin/properties/{prop_id}/calendar", headers=admin_headers)
    assert cal_res.status_code == 200
    events = cal_res.json()["events"]
    assert len(events) == 0

    # 3. Create a guest booking
    guest_booking = await client.post(
        "/bookings",
        headers=user_headers,
        json={"property_id": prop_id, "check_in": "2026-06-10", "check_out": "2026-06-12", "guests": 2, "pets": 0},
    )
    assert guest_booking.status_code == 200

    # 4. Attempt to block dates that overlap with the guest booking (should fail with 409)
    block_fail = await client.post(
        f"/admin/properties/{prop_id}/blocks",
        headers=admin_headers,
        json={"check_in": "2026-06-11", "check_out": "2026-06-13", "note": "Maintenance"},
    )
    assert block_fail.status_code == 409
    assert "overlap" in block_fail.json()["detail"].lower()

    # 5. Block valid dates successfully
    block_success = await client.post(
        f"/admin/properties/{prop_id}/blocks",
        headers=admin_headers,
        json={"check_in": "2026-06-15", "check_out": "2026-06-18", "note": "Owner staying"},
    )
    assert block_success.status_code == 201
    block_data = block_success.json()
    block_id = block_data["id"]

    # 6. Verify calendar returns guest booking (gold) and admin block (admin_block)
    cal_res = await client.get(f"/admin/properties/{prop_id}/calendar", headers=admin_headers)
    assert cal_res.status_code == 200
    events = cal_res.json()["events"]
    assert len(events) == 2

    # Map events by type
    events_by_type = {e["type"]: e for e in events}
    assert "guest_booking" in events_by_type
    assert "admin_block" in events_by_type

    admin_evt = events_by_type["admin_block"]
    assert admin_evt["check_in"] == "2026-06-15"
    assert admin_evt["check_out"] == "2026-06-18"
    assert admin_evt["note"] == "Owner staying"
    assert admin_evt["guest_name"] is None  # Sensitive fields hidden for blocks

    # 7. Verify booking flow respects the admin block (should return 409 block)
    booking_attempt = await client.post(
        "/bookings",
        headers=user_headers,
        json={"property_id": prop_id, "check_in": "2026-06-16", "check_out": "2026-06-17", "guests": 2, "pets": 0},
    )
    assert booking_attempt.status_code == 409
    assert "not available" in booking_attempt.json()["detail"].lower()

    # 8. Set up property group to test shadow blocking
    sibling = await client.post("/admin/properties", headers=admin_headers, json=_property_payload("Calendar Property Sibling"))
    assert sibling.status_code == 200
    sibling_id = sibling.json()["id"]

    group = await client.post("/admin/groups", headers=admin_headers, json={"name": "Calendar Test Group"})
    assert group.status_code == 200
    group_id = group.json()["id"]

    await client.post(f"/admin/groups/{group_id}/members", headers=admin_headers, json={"property_id": prop_id, "is_whole_property": False})
    await client.post(f"/admin/groups/{group_id}/members", headers=admin_headers, json={"property_id": sibling_id, "is_whole_property": True})

    # Create admin block on sibling property (the whole unit)
    sibling_block = await client.post(
        f"/admin/properties/{sibling_id}/blocks",
        headers=admin_headers,
        json={"check_in": "2026-06-20", "check_out": "2026-06-22", "note": "Owner staying whole unit"},
    )
    assert sibling_block.status_code == 201

    # Verify shadow block is created on main property
    cal_res_main = await client.get(f"/admin/properties/{prop_id}/calendar", headers=admin_headers)
    assert cal_res_main.status_code == 200
    events_main = cal_res_main.json()["events"]
    shadow_evt = next((e for e in events_main if e["type"] == "shadow_block"), None)
    assert shadow_evt is not None
    assert shadow_evt["check_in"] == "2026-06-20"
    assert shadow_evt["check_out"] == "2026-06-22"

    # 9. Delete the admin block
    del_res = await client.delete(f"/admin/properties/{prop_id}/blocks/{block_id}", headers=admin_headers)
    assert del_res.status_code == 200

    # Verify admin block is removed and calendar events drop by 1
    cal_res = await client.get(f"/admin/properties/{prop_id}/calendar", headers=admin_headers)
    assert cal_res.status_code == 200
    events = cal_res.json()["events"]
    # Should only have guest_booking and the shadow_block now
    assert len(events) == 2
    types = [e["type"] for e in events]
    assert "admin_block" not in types
