from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


# ── PropertyImage ──

class PropertyImageOut(BaseModel):
    id: UUID
    image_url: str
    is_primary: bool
    display_order: int

    model_config = {"from_attributes": True}


class PropertyImageCreate(BaseModel):
    image_url: str
    is_primary: bool = False
    display_order: int = 0


class PropertyImageUpdate(BaseModel):
    is_primary: bool | None = None
    display_order: int | None = None


# ── Property ──

class PropertyOut(BaseModel):
    id: UUID
    owner_id: UUID
    name: str
    description: str
    address: str
    city: str
    state: str
    country: str
    latitude: float
    longitude: float
    contact_phone: str
    contact_email: str
    check_in_time: str
    check_out_time: str
    house_rules: list[str]
    price_per_night: int
    cleaning_fee: int
    max_guests: int
    bedrooms: int
    bathrooms: int
    bathrooms_detail: list[dict]
    min_nights: int
    pets_allowed: bool
    pet_charge_per_night: int
    amenities: list[str]
    is_published: bool
    override_house_rules: bool
    override_amenities: bool
    override_details: bool
    avg_rating: float
    review_count: int
    created_at: datetime
    updated_at: datetime
    images: list[PropertyImageOut] = Field(default_factory=list)

    model_config = {"from_attributes": True}


class PropertyCreate(BaseModel):
    name: str
    description: str
    address: str
    city: str
    state: str
    country: str = "India"
    latitude: float
    longitude: float
    contact_phone: str
    contact_email: str
    check_in_time: str = "2:00 PM"
    check_out_time: str = "11:00 AM"
    house_rules: list[str] = []
    price_per_night: int
    cleaning_fee: int = 0
    max_guests: int
    bedrooms: int
    bathrooms: int
    bathrooms_detail: list[dict] = []
    min_nights: int = 1
    pets_allowed: bool = False
    pet_charge_per_night: int = 0
    amenities: list[str] = []
    is_published: bool = False
    override_house_rules: bool = False
    override_amenities: bool = False
    override_details: bool = False
    images: list[PropertyImageCreate] = Field(default_factory=list)


class PropertyUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    country: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    contact_phone: str | None = None
    contact_email: str | None = None
    check_in_time: str | None = None
    check_out_time: str | None = None
    house_rules: list[str] | None = None
    price_per_night: int | None = None
    cleaning_fee: int | None = None
    max_guests: int | None = None
    bedrooms: int | None = None
    bathrooms: int | None = None
    bathrooms_detail: list[dict] | None = None
    min_nights: int | None = None
    pets_allowed: bool | None = None
    pet_charge_per_night: int | None = None
    amenities: list[str] | None = None
    is_published: bool | None = None
    override_house_rules: bool | None = None
    override_amenities: bool | None = None
    override_details: bool | None = None
    images: list[PropertyImageCreate] | None = None


class PropertyListOut(BaseModel):
    items: list[PropertyOut]
    total: int
    page: int
    limit: int