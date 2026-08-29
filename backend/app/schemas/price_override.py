from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, Field


class PriceOverrideCreate(BaseModel):
    start_date: date
    end_date: date
    price_per_night: int = Field(gt=0, description="Price per night in INR")
    label: str | None = None


class PriceOverrideOut(BaseModel):
    id: UUID
    property_id: UUID
    start_date: date
    end_date: date
    price_per_night: int
    label: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}