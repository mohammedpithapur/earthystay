import pytest

pytestmark = pytest.mark.asyncio


def _prop_payload(name: str, overrides: dict | None = None):
    data = {
        "name": name,
        "description": f"{name} description",
        "address": "123 Test Street",
        "city": "Goa",
        "state": "Goa",
        "country": "India",
        "latitude": 15.2993,
        "longitude": 74.124,
        "contact_phone": "+91 9999999999",
        "contact_email": f"{name.lower().replace(' ', '')}@example.com",
        "check_in_time": "2:00 PM",
        "check_out_time": "11:00 AM",
        "house_rules": ["No smoking", "No pets"],
        "price_per_night": 5000,
        "cleaning_fee": 800,
        "max_guests": 4,
        "bedrooms": 2,
        "bathrooms": 2,
        "bathrooms_detail": [{"type": "ensuite", "count": 2}],
        "min_nights": 1,
        "pets_allowed": False,
        "pet_charge_per_night": 0,
        "amenities": ["WiFi", "Pool"],
        "is_published": True,
    }
    if overrides:
        data.update(overrides)
    return data


async def test_property_inherits_from_whole_property(client, admin_headers):
    """Sub-property without overrides should inherit attributes from the Whole Property."""
    whole = await client.post(
        "/admin/properties", headers=admin_headers,
        json=_prop_payload("Whole Estate", {
            "house_rules": ["No loud music", "Check-in after 3pm"],
            "amenities": ["WiFi", "Gym", "Pool"],
            "description": "A grand estate with scenic views",
            "check_in_time": "3:00 PM",
        })
    )
    assert whole.status_code == 200, whole.text

    sub = await client.post(
        "/admin/properties", headers=admin_headers,
        json=_prop_payload("Room 1", {
            "house_rules": ["Sub-specific rule"],
            "amenities": ["WiFi"],
            "description": "Small cozy room",
            "override_house_rules": False,
            "override_amenities": False,
            "override_details": False,
        })
    )
    assert sub.status_code == 200, sub.text

    # Create group
    group = await client.post("/admin/groups", headers=admin_headers, json={"name": "Estate Group"})
    assert group.status_code == 200, group.text
    group_id = group.json()["id"]

    # Add whole property as master
    await client.post(
        f"/admin/groups/{group_id}/members", headers=admin_headers,
        json={"property_id": whole.json()["id"], "is_whole_property": True}
    )
    # Add sub-property
    await client.post(
        f"/admin/groups/{group_id}/members", headers=admin_headers,
        json={"property_id": sub.json()["id"], "is_whole_property": False}
    )

    # Fetch sub-property - should inherit from whole
    fetched = await client.get(f"/properties/{sub.json()['id']}")
    assert fetched.status_code == 200, fetched.text
    data = fetched.json()

    # Check inherited values from Whole Estate
    assert "No loud music" in data["house_rules"]
    assert "Gym" in data["amenities"]
    assert data["description"] == "A grand estate with scenic views"
    assert data["check_in_time"] == "3:00 PM"


async def test_property_override_preserves_own_values(client, admin_headers):
    """Sub-property with override_house_rules=True should keep its own house rules."""
    whole = await client.post(
        "/admin/properties", headers=admin_headers,
        json=_prop_payload("Villa Master", {
            "house_rules": ["Master rule only"],
            "amenities": ["Sauna", "Jacuzzi"],
        })
    )
    assert whole.status_code == 200, whole.text

    sub = await client.post(
        "/admin/properties", headers=admin_headers,
        json=_prop_payload("Villa Room", {
            "house_rules": ["My own rule"],
            "amenities": ["WiFi"],
            "override_house_rules": True,
            "override_amenities": False,
        })
    )
    assert sub.status_code == 200, sub.text

    group = await client.post("/admin/groups", headers=admin_headers, json={"name": "Villa Group"})
    group_id = group.json()["id"]

    await client.post(
        f"/admin/groups/{group_id}/members", headers=admin_headers,
        json={"property_id": whole.json()["id"], "is_whole_property": True}
    )
    await client.post(
        f"/admin/groups/{group_id}/members", headers=admin_headers,
        json={"property_id": sub.json()["id"], "is_whole_property": False}
    )

    fetched = await client.get(f"/properties/{sub.json()['id']}")
    assert fetched.status_code == 200, fetched.text
    data = fetched.json()

    # house_rules overridden — keep own
    assert "My own rule" in data["house_rules"]
    assert "Master rule only" not in data["house_rules"]

    # amenities NOT overridden — inherit from master
    assert "Sauna" in data["amenities"]
    assert "Jacuzzi" in data["amenities"]


async def test_patch_override_flag(client, admin_headers):
    """PATCH /admin/properties/{id} should update override flags."""
    prop = await client.post(
        "/admin/properties", headers=admin_headers,
        json=_prop_payload("Override Toggle", {"override_house_rules": False})
    )
    assert prop.status_code == 200
    prop_id = prop.json()["id"]

    patch = await client.patch(
        f"/admin/properties/{prop_id}", headers=admin_headers,
        json={"override_house_rules": True}
    )
    assert patch.status_code == 200, patch.text
    assert patch.json()["override_house_rules"] is True
