import pytest


pytestmark = pytest.mark.asyncio


def _property_payload(name: str):
    return {
        "name": name,
        "description": "A lovely test property",
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


async def test_group_lifecycle_and_constraints(client, admin_headers):
    prop_a = await client.post("/admin/properties", headers=admin_headers, json=_property_payload("Room A"))
    prop_b = await client.post("/admin/properties", headers=admin_headers, json=_property_payload("Whole A"))
    prop_c = await client.post("/admin/properties", headers=admin_headers, json=_property_payload("Room B"))

    group = await client.post("/admin/groups", headers=admin_headers, json={"name": "Group A"})
    assert group.status_code == 200, group.text
    group_id = group.json()["id"]

    add_room = await client.post(
        f"/admin/groups/{group_id}/members",
        headers=admin_headers,
        json={"property_id": prop_a.json()["id"], "is_whole_property": False},
    )
    assert add_room.status_code == 200, add_room.text

    add_whole = await client.post(
        f"/admin/groups/{group_id}/members",
        headers=admin_headers,
        json={"property_id": prop_b.json()["id"], "is_whole_property": True},
    )
    assert add_whole.status_code == 200, add_whole.text

    duplicate = await client.post(
        f"/admin/groups/{group_id}/members",
        headers=admin_headers,
        json={"property_id": prop_a.json()["id"], "is_whole_property": False},
    )
    assert duplicate.status_code == 409

    second_whole = await client.post(
        f"/admin/groups/{group_id}/members",
        headers=admin_headers,
        json={"property_id": prop_c.json()["id"], "is_whole_property": True},
    )
    assert second_whole.status_code == 409

    list_groups = await client.get("/admin/groups", headers=admin_headers)
    assert list_groups.status_code == 200
    assert len(list_groups.json()) == 1

    member_id = add_room.json()["members"][0]["id"]
    remove = await client.delete(f"/admin/groups/{group_id}/members/{member_id}", headers=admin_headers)
    assert remove.status_code == 200
