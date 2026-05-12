from pydantic import BaseModel
from uuid import UUID
from datetime import datetime, date


class ReviewCreate(BaseModel):
    booking_id: UUID
    rating: int  # 1-5
    comment: str | None = None


class ReviewOut(BaseModel):
    id: UUID
    property_id: UUID
    guest_id: UUID
    booking_id: UUID
    rating: int
    comment: str | None
    created_at: datetime

    model_config = {"from_attributes": True}