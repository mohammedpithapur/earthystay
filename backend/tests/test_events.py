import pytest
from app.models.event import EventStatus

pytestmark = pytest.mark.asyncio


async def test_create_event_request_public(client):
    payload = {
        "destination": "Goa",
        "hotel": "Seaside Resort",
        "nature_of_event": "Wedding",
        "event_start_date": "2026-12-01",
        "event_end_date": "2026-12-05",
        "no_of_guests": 150,
        "requires_rooms": True,
        "no_of_rooms": 50,
        "additional_details": "Need beachside dining",
        "name": "Jane Doe",
        "phone": "+91 9999988888",
        "email": "jane@example.com",
    }
    response = await client.post("/events", json=payload)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["destination"] == "Goa"
    assert data["hotel"] == "Seaside Resort"
    assert data["nature_of_event"] == "Wedding"
    assert data["status"] == "pending"
    assert "id" in data


async def test_list_events_requires_admin(client, user_headers):
    # Non-admin guest should be denied
    res_guest = await client.get("/events/admin/all", headers=user_headers)
    assert res_guest.status_code == 403

    # Public user should be denied
    res_pub = await client.get("/events/admin/all")
    assert res_pub.status_code == 403


async def test_list_and_update_events_admin(client, admin_headers):
    # 1. Create a request first
    payload = {
        "destination": "Jaipur",
        "hotel": "Heritage Palace",
        "nature_of_event": "Corporate",
        "event_start_date": "2026-11-10",
        "event_end_date": "2026-11-12",
        "no_of_guests": 50,
        "requires_rooms": False,
        "name": "John Boss",
        "phone": "+91 9999900000",
        "email": "boss@example.com",
    }
    await client.post("/events", json=payload)

    # 2. Get list as Admin
    res_list = await client.get("/events/admin/all", headers=admin_headers)
    assert res_list.status_code == 200, res_list.text
    items = res_list.json()
    assert len(items) >= 1
    event_id = items[0]["id"]

    # 3. Update status as Admin
    res_update = await client.patch(
        f"/events/admin/{event_id}",
        headers=admin_headers,
        json={"status": "contacted"},
    )
    assert res_update.status_code == 200, res_update.text
    assert res_update.json()["status"] == "contacted"
