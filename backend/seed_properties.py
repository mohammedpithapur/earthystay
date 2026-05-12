import asyncio
import uuid
from datetime import datetime

from app.database import async_session
from app.models.property import Property, PropertyImage


PROPERTIES = [
    {
        "name": "Earthy Villa Goa",
        "description": "A stunning beachside villa nestled among coconut palms with direct ocean views. Perfect for families and groups looking for a luxurious yet earthy retreat.",
        "address": "Survey No. 12, Calangute Beach Road, Calangute, Goa - 403516",
        "city": "Goa", "state": "Goa", "country": "India",
        "latitude": 15.2993, "longitude": 73.9148,
        "contact_phone": "+91 98765 43210", "contact_email": "villa.goa@earthystay.com",
        "check_in_time": "2:00 PM", "check_out_time": "11:00 AM",
        "house_rules": [],
        "price_per_night": 8500, "cleaning_fee": 1000,
        "max_guests": 8, "bedrooms": 4, "bathrooms": 3,
        "bathrooms_detail": [{"type": "ensuite", "count": 2}, {"type": "shared", "count": 1}],
        "min_nights": 2, "pets_allowed": True, "pet_charge_per_night": 500,
        "amenities": ["WiFi", "Pool", "Parking", "Kitchen", "Air Conditioning", "Beach Access"],
        "is_published": True, "avg_rating": 4.9, "review_count": 38,
        "images": [
            {"image_url": "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800", "is_primary": True, "display_order": 1},
            {"image_url": "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800", "is_primary": False, "display_order": 2},
        ],
    },
    {
        "name": "Forest Retreat Coorg",
        "description": "Wake up to misty mountains and coffee plantations. This serene retreat offers the perfect escape into nature with modern comforts.",
        "address": "Estate Road, Madikeri, Coorg, Karnataka - 571201",
        "city": "Coorg", "state": "Karnataka", "country": "India",
        "latitude": 12.4244, "longitude": 75.7382,
        "contact_phone": "+91 98765 43211", "contact_email": "retreat.coorg@earthystay.com",
        "check_in_time": "1:00 PM", "check_out_time": "10:00 AM",
        "house_rules": ["No smoking inside the property", "No loud music after 9:00 PM", "Pets must be leashed in common areas", "Please respect the natural surroundings", "Campfire only in designated areas"],
        "price_per_night": 6500, "cleaning_fee": 800,
        "max_guests": 6, "bedrooms": 3, "bathrooms": 2,
        "bathrooms_detail": [{"type": "ensuite", "count": 2}],
        "min_nights": 2, "pets_allowed": True, "pet_charge_per_night": 300,
        "amenities": ["WiFi", "Fireplace", "Kitchen", "Garden", "Mountain View"],
        "is_published": True, "avg_rating": 4.7, "review_count": 24,
        "images": [
            {"image_url": "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800", "is_primary": True, "display_order": 1},
            {"image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", "is_primary": False, "display_order": 2},
        ],
    },
    {
        "name": "Heritage Haveli Jaipur",
        "description": "Experience royal Rajasthani hospitality in this beautifully restored heritage property in the heart of the Pink City.",
        "address": "Civil Lines, Near Rambagh Palace, Jaipur, Rajasthan - 302006",
        "city": "Jaipur", "state": "Rajasthan", "country": "India",
        "latitude": 26.9124, "longitude": 75.7873,
        "contact_phone": "+91 98765 43212", "contact_email": "haveli.jaipur@earthystay.com",
        "check_in_time": "3:00 PM", "check_out_time": "12:00 PM",
        "house_rules": ["No smoking anywhere on the property", "No pets allowed", "Heritage artefacts must not be touched", "Formal attire requested in dining areas", "Quiet hours after 10:30 PM"],
        "price_per_night": 12000, "cleaning_fee": 1500,
        "max_guests": 10, "bedrooms": 5, "bathrooms": 4,
        "bathrooms_detail": [{"type": "ensuite", "count": 2}, {"type": "detached_private", "count": 1}, {"type": "shared", "count": 1}],
        "min_nights": 1, "pets_allowed": False, "pet_charge_per_night": 0,
        "amenities": ["WiFi", "Pool", "Parking", "Restaurant", "Spa", "Air Conditioning"],
        "is_published": True, "avg_rating": 4.8, "review_count": 56,
        "images": [
            {"image_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800", "is_primary": True, "display_order": 1},
            {"image_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800", "is_primary": False, "display_order": 2},
        ],
    },
    {
        "name": "Lakeside Cabin Munnar",
        "description": "A cozy wooden cabin perched above a shimmering lake surrounded by tea gardens. The ultimate romantic getaway in the hills of Kerala.",
        "address": "Mattupetty Road, Near Echo Point, Munnar, Kerala - 685612",
        "city": "Munnar", "state": "Kerala", "country": "India",
        "latitude": 10.0889, "longitude": 77.0595,
        "contact_phone": "+91 98765 43213", "contact_email": "cabin.munnar@earthystay.com",
        "check_in_time": "2:00 PM", "check_out_time": "10:00 AM",
        "house_rules": ["No smoking inside the cabin", "Pets must be kept on leash near the lake", "No loud music at any time", "Please dispose of waste responsibly", "Swimming in the lake is at own risk"],
        "price_per_night": 5500, "cleaning_fee": 700,
        "max_guests": 4, "bedrooms": 2, "bathrooms": 1,
        "bathrooms_detail": [{"type": "shared", "count": 1}],
        "min_nights": 2, "pets_allowed": True, "pet_charge_per_night": 250,
        "amenities": ["WiFi", "Lake View", "Fireplace", "Kitchen", "Hiking Trails"],
        "is_published": True, "avg_rating": 4.6, "review_count": 19,
        "images": [
            {"image_url": "https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=800", "is_primary": True, "display_order": 1},
            {"image_url": "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800", "is_primary": False, "display_order": 2},
        ],
    },
    {
        "name": "Desert Camp Jaisalmer",
        "description": "Sleep under a blanket of stars in our luxury desert camp. Experience the magic of the Thar Desert with all modern comforts.",
        "address": "Sam Sand Dunes Road, Jaisalmer, Rajasthan - 345001",
        "city": "Jaisalmer", "state": "Rajasthan", "country": "India",
        "latitude": 26.9157, "longitude": 70.9083,
        "contact_phone": "+91 98765 43214", "contact_email": "camp.jaisalmer@earthystay.com",
        "check_in_time": "4:00 PM", "check_out_time": "10:00 AM",
        "house_rules": ["No smoking inside tents", "No pets allowed in the desert camp", "Follow guide instructions during safari", "Respect local culture and traditions", "Campfire rules must be strictly followed"],
        "price_per_night": 9500, "cleaning_fee": 1200,
        "max_guests": 6, "bedrooms": 3, "bathrooms": 3,
        "bathrooms_detail": [{"type": "ensuite", "count": 2}, {"type": "detached_private", "count": 1}],
        "min_nights": 2, "pets_allowed": False, "pet_charge_per_night": 0,
        "amenities": ["Desert Safari", "Bonfire", "Camel Ride", "Star Gazing", "Restaurant"],
        "is_published": True, "avg_rating": 4.9, "review_count": 43,
        "images": [
            {"image_url": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800", "is_primary": True, "display_order": 1},
            {"image_url": "https://images.unsplash.com/photo-1471400974796-1c823d00a96f?w=800", "is_primary": False, "display_order": 2},
        ],
    },
    {
        "name": "Cliff House Rishikesh",
        "description": "A stunning property perched on the cliffs above the Ganges. Perfect for adventure seekers and spiritual travellers alike.",
        "address": "Laxman Jhula Road, Tapovan, Rishikesh, Uttarakhand - 249192",
        "city": "Rishikesh", "state": "Uttarakhand", "country": "India",
        "latitude": 30.0869, "longitude": 78.2676,
        "contact_phone": "+91 98765 43215", "contact_email": "cliff.rishikesh@earthystay.com",
        "check_in_time": "1:00 PM", "check_out_time": "11:00 AM",
        "house_rules": ["No smoking or alcohol on the property", "Pets must be kept away from the cliff edge", "Yoga deck is for guests only", "River activities require prior booking", "Quiet hours after 9:30 PM"],
        "price_per_night": 7000, "cleaning_fee": 900,
        "max_guests": 8, "bedrooms": 4, "bathrooms": 3,
        "bathrooms_detail": [{"type": "ensuite", "count": 3}, {"type": "shared", "count": 1}, {"type": "detached_private", "count": 0}],
        "min_nights": 1, "pets_allowed": True, "pet_charge_per_night": 400,
        "amenities": ["WiFi", "River View", "Yoga Deck", "Kitchen", "Adventure Activities"],
        "is_published": True, "avg_rating": 4.7, "review_count": 31,
        "images": [
            {"image_url": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800", "is_primary": True, "display_order": 1},
            {"image_url": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800", "is_primary": False, "display_order": 2},
        ],
    },
]

ADMIN_ID = "d1260ec7-918d-4a02-8395-072dce10871d"


async def seed_properties():
    async with async_session() as db:
        for p in PROPERTIES:
            prop = Property(
                id=uuid.uuid4(),
                owner_id=uuid.UUID(ADMIN_ID),
                name=p["name"],
                description=p["description"],
                address=p["address"],
                city=p["city"],
                state=p["state"],
                country=p["country"],
                latitude=p["latitude"],
                longitude=p["longitude"],
                contact_phone=p["contact_phone"],
                contact_email=p["contact_email"],
                check_in_time=p["check_in_time"],
                check_out_time=p["check_out_time"],
                house_rules=p["house_rules"],
                price_per_night=p["price_per_night"],
                cleaning_fee=p["cleaning_fee"],
                max_guests=p["max_guests"],
                bedrooms=p["bedrooms"],
                bathrooms=p["bathrooms"],
                bathrooms_detail=p["bathrooms_detail"],
                min_nights=p["min_nights"],
                pets_allowed=p["pets_allowed"],
                pet_charge_per_night=p["pet_charge_per_night"],
                amenities=p["amenities"],
                is_published=p["is_published"],
                avg_rating=p["avg_rating"],
                review_count=p["review_count"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(prop)
            await db.flush()

            for img in p["images"]:
                db.add(PropertyImage(
                    id=uuid.uuid4(),
                    property_id=prop.id,
                    image_url=img["image_url"],
                    is_primary=img["is_primary"],
                    display_order=img["display_order"],
                ))

        await db.commit()
        print(f"Seeded {len(PROPERTIES)} properties with images.")


if __name__ == "__main__":
    asyncio.run(seed_properties())