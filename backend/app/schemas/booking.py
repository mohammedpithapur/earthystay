from pydantic import BaseModel, model_validator
from uuid import UUID
from datetime import datetime, date


class BookingCreate(BaseModel):
    property_id: UUID
    check_in: date
    check_out: date
    guests: int
    pets: int = 0

    @model_validator(mode="after")
    def validate_booking(self):
        if self.check_out <= self.check_in:
            raise ValueError("check_out must be after check_in")
        if self.guests < 1:
            raise ValueError("at least 1 guest required")
        if self.pets < 0:
            raise ValueError("pets cannot be negative")
        return self


class BookingOut(BaseModel):
    id: UUID
    property_id: UUID
    guest_id: UUID
    check_in: date
    check_out: date
    guests: int
    pets: int
    nights: int
    base_price: int
    cleaning_fee: int
    pet_charge: int
    total: int
    status: str
    booking_ref: str
    guest_name: str
    guest_email: str
    guest_phone: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class BookingStatusUpdate(BaseModel):
    status: str  # confirmed | completed | cancelled


class BookingListOut(BaseModel):
    items: list[BookingOut]
    total: int
    page: int
    limit: int