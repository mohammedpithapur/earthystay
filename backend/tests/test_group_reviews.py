import pytest

pytestmark = pytest.mark.asyncio


def _prop_payload(name: str):
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
        "bathrooms_detail": [],
        "min_nights": 1,
        "pets_allowed": False,
        "pet_charge_per_night": 0,
        "amenities": ["WiFi"],
        "is_published": True,
    }


async def test_admin_can_create_review(client, admin_headers):
    """Admin can create a review for any property."""
    prop = await client.post("/admin/properties", headers=admin_headers, json=_prop_payload("Review Test"))
    assert prop.status_code == 200, prop.text
    prop_id = prop.json()["id"]

    review = await client.post(
        "/admin/reviews", headers=admin_headers,
        json={
            "property_id": prop_id,
            "guest_name": "Jane Doe",
            "rating": 5,
            "comment": "Wonderful stay!",
            "platform": "Airbnb",
        }
    )
    assert review.status_code == 201, review.text
    data = review.json()
    assert data["guest_name"] == "Jane Doe"
    assert data["rating"] == 5
    assert data["platform"] == "Airbnb"


async def test_review_updates_property_rating(client, admin_headers):
    """Adding a review recalculates the property's avg_rating and review_count."""
    prop = await client.post("/admin/properties", headers=admin_headers, json=_prop_payload("Rating Prop"))
    assert prop.status_code == 200
    prop_id = prop.json()["id"]

    # Initially no reviews
    fetched = await client.get(f"/properties/{prop_id}")
    assert fetched.json()["avg_rating"] == 0.0
    assert fetched.json()["review_count"] == 0

    # Add a review with rating 4
    await client.post(
        "/admin/reviews", headers=admin_headers,
        json={"property_id": prop_id, "guest_name": "Alice", "rating": 4, "platform": "Booking.com"}
    )

    fetched = await client.get(f"/properties/{prop_id}")
    assert fetched.json()["avg_rating"] == 4.0
    assert fetched.json()["review_count"] == 1

    # Add a second review with rating 2
    await client.post(
        "/admin/reviews", headers=admin_headers,
        json={"property_id": prop_id, "guest_name": "Bob", "rating": 2, "platform": "Direct"}
    )

    fetched = await client.get(f"/properties/{prop_id}")
    assert fetched.json()["avg_rating"] == 3.0
    assert fetched.json()["review_count"] == 2


async def test_group_reviews_shared_across_subproperties(client, admin_headers):
    """Reviews added to one group property are visible on all group members."""
    whole = await client.post("/admin/properties", headers=admin_headers, json=_prop_payload("Group Master"))
    sub1 = await client.post("/admin/properties", headers=admin_headers, json=_prop_payload("Sub Room A"))
    sub2 = await client.post("/admin/properties", headers=admin_headers, json=_prop_payload("Sub Room B"))

    whole_id = whole.json()["id"]
    sub1_id = sub1.json()["id"]
    sub2_id = sub2.json()["id"]

    # Create group
    group = await client.post("/admin/groups", headers=admin_headers, json={"name": "Sharing Group"})
    group_id = group.json()["id"]

    await client.post(f"/admin/groups/{group_id}/members", headers=admin_headers,
                      json={"property_id": whole_id, "is_whole_property": True})
    await client.post(f"/admin/groups/{group_id}/members", headers=admin_headers,
                      json={"property_id": sub1_id, "is_whole_property": False})
    await client.post(f"/admin/groups/{group_id}/members", headers=admin_headers,
                      json={"property_id": sub2_id, "is_whole_property": False})

    # Add review to sub1
    await client.post(
        "/admin/reviews", headers=admin_headers,
        json={"property_id": sub1_id, "guest_name": "Traveler", "rating": 5, "platform": "Google"}
    )

    # Review should appear in sub2's endpoint too
    reviews_sub2 = await client.get(f"/properties/{sub2_id}/reviews")
    assert reviews_sub2.status_code == 200, reviews_sub2.text
    reviews = reviews_sub2.json()
    assert len(reviews) == 1
    assert reviews[0]["guest_name"] == "Traveler"


async def test_group_rating_synced_to_all_members(client, admin_headers):
    """Rating of all group members updates when any member gets a review."""
    whole = await client.post("/admin/properties", headers=admin_headers, json=_prop_payload("Rating Master"))
    sub = await client.post("/admin/properties", headers=admin_headers, json=_prop_payload("Rating Room"))

    whole_id = whole.json()["id"]
    sub_id = sub.json()["id"]

    group = await client.post("/admin/groups", headers=admin_headers, json={"name": "Rating Group"})
    group_id = group.json()["id"]

    await client.post(f"/admin/groups/{group_id}/members", headers=admin_headers,
                      json={"property_id": whole_id, "is_whole_property": True})
    await client.post(f"/admin/groups/{group_id}/members", headers=admin_headers,
                      json={"property_id": sub_id, "is_whole_property": False})

    # Add reviews to whole property
    await client.post("/admin/reviews", headers=admin_headers,
                      json={"property_id": whole_id, "guest_name": "Guest1", "rating": 4})
    await client.post("/admin/reviews", headers=admin_headers,
                      json={"property_id": whole_id, "guest_name": "Guest2", "rating": 2})

    # Both properties should have avg_rating=3.0
    whole_data = await client.get(f"/properties/{whole_id}")
    sub_data = await client.get(f"/properties/{sub_id}")

    assert whole_data.json()["avg_rating"] == 3.0
    assert sub_data.json()["avg_rating"] == 3.0
    assert sub_data.json()["review_count"] == 2


async def test_admin_delete_review_recalculates_rating(client, admin_headers):
    """Deleting a review recalculates avg_rating correctly."""
    prop = await client.post("/admin/properties", headers=admin_headers, json=_prop_payload("Delete Review"))
    prop_id = prop.json()["id"]

    r1 = await client.post("/admin/reviews", headers=admin_headers,
                           json={"property_id": prop_id, "guest_name": "A", "rating": 5})
    r2 = await client.post("/admin/reviews", headers=admin_headers,
                           json={"property_id": prop_id, "guest_name": "B", "rating": 1})

    assert r1.status_code == 201
    assert r2.status_code == 201

    # avg is 3.0
    fetched = await client.get(f"/properties/{prop_id}")
    assert fetched.json()["avg_rating"] == 3.0

    # Delete review with rating 1
    del_resp = await client.delete(f"/admin/reviews/{r2.json()['id']}", headers=admin_headers)
    assert del_resp.status_code == 200

    # avg should now be 5.0
    fetched = await client.get(f"/properties/{prop_id}")
    assert fetched.json()["avg_rating"] == 5.0
    assert fetched.json()["review_count"] == 1


async def test_unauthenticated_cannot_create_review(client):
    """Anonymous users cannot create admin reviews."""
    resp = await client.post(
        "/admin/reviews",
        json={"property_id": "00000000-0000-0000-0000-000000000000", "guest_name": "Hacker", "rating": 5}
    )
    assert resp.status_code in (401, 403)
