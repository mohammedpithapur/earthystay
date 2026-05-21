from pydantic import BaseModel
from uuid import UUID
from datetime import datetime, date


class ReviewCreate(BaseModel):
    property_id: UUID
    guest_name: str
    rating: int  # 1-5
    comment: str | None = None
    platform: str | None = None
    created_at: datetime | None = None


class ReviewOut(BaseModel):
    id: UUID
    property_id: UUID
    guest_id: UUID | None = None
    booking_id: UUID | None = None
    guest_name: str
    platform: str | None = None
    rating: int
    comment: str | None
    created_at: datetime

    model_config = {"from_attributes": True}