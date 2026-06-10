import pytest


pytestmark = pytest.mark.asyncio


def _property_payload(overrides: dict | None = None):
    data = {
        "name": "Test Property",
        "description": "A lovely test property",
        "address": "123 Test Street",
        "city": "Goa",
        "state": "Goa",
        "country": "India",
        "latitude": 15.2993,
        "longitude": 74.124,
        "contact_phone": "+91 9999999999",
        "contact_email": "host@example.com",
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


async def test_list_properties_empty(client):
    response = await client.get("/properties")
    assert response.status_code == 200, response.text
    payload = response.json()
    assert payload["items"] == []


async def test_create_and_get_property(admin_headers, client):
    create = await client.post("/admin/properties", headers=admin_headers, json=_property_payload())
    assert create.status_code == 200, create.text
    prop = create.json()

    get_prop = await client.get(f"/properties/{prop['id']}")
    assert get_prop.status_code == 200, get_prop.text
    assert get_prop.json()["name"] == "Test Property"


async def test_get_property_unpublished(client, admin_headers):
    create = await client.post(
        "/admin/properties",
        headers=admin_headers,
        json=_property_payload({"is_published": False}),
    )
    assert create.status_code == 200, create.text
    prop = create.json()

    response = await client.get(f"/properties/{prop['id']}")
    assert response.status_code == 404


async def test_availability_returns_booked_ranges(client, admin_headers, user_headers):
    create = await client.post("/admin/properties", headers=admin_headers, json=_property_payload())
    prop = create.json()

    booking = await client.post(
        "/bookings",
        headers=user_headers,
        json={
            "property_id": prop["id"],
            "check_in": "2026-06-10",
            "check_out": "2026-06-12",
            "guests": 2,
            "pets": 0,
        },
    )
    assert booking.status_code == 200, booking.text

    availability = await client.get(f"/properties/{prop['id']}/availability")
    assert availability.status_code == 200, availability.text
    ranges = availability.json()
    assert any(r["check_in"] == "2026-06-10" and r["check_out"] == "2026-06-12" for r in ranges)


async def test_locations_endpoint(client, admin_headers):
    from app.services.cache import get_redis
    redis_client = get_redis()
    if redis_client:
        await redis_client.delete("properties:locations:list")

    # 1. Check locations when empty (none published)
    response = await client.get("/properties/locations")
    assert response.status_code == 200, response.text
    assert response.json() == {"locations": []}

    # 2. Create published and unpublished properties
    await client.post("/admin/properties", headers=admin_headers, json=_property_payload({"city": "Goa", "state": "Goa", "is_published": True}))
    await client.post("/admin/properties", headers=admin_headers, json=_property_payload({"city": "Kolkata", "state": "West Bengal", "is_published": True}))
    
    # Another Goa property (should be deduplicated)
    await client.post("/admin/properties", headers=admin_headers, json=_property_payload({"city": "Goa", "state": "Goa", "is_published": True}))
    
    # City Mumbai is NOT published
    await client.post("/admin/properties", headers=admin_headers, json=_property_payload({"city": "Mumbai", "state": "Maharashtra", "is_published": False}))

    # Clear cache before retrieving to ensure fresh query
    if redis_client:
        await redis_client.delete("properties:locations:list")

    # 3. Retrieve locations and check
    response = await client.get("/properties/locations")
    assert response.status_code == 200, response.text
    data = response.json()
    assert "locations" in data
    locs = data["locations"]
    assert len(locs) == 2
    cities = {loc["city"] for loc in locs}
    assert cities == {"Goa", "Kolkata"}

