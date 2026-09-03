from datetime import date, datetime
from uuid import UUID
from pydantic import BaseModel, Field


class PriceOverrideCreate(BaseModel):
    start_date: date
    end_date: date
    price_per_night: int | None = Field(default=None, description="Direct price per night in INR")
    discount_percent: int | None = Field(default=None, ge=1, le=90, description="Discount percentage between 1 and 90")
    label: str | None = None


class PriceOverrideOut(BaseModel):
    id: UUID
    property_id: UUID
    start_date: date
    end_date: date
    price_per_night: int
    discount_percent: int | None = None
    label: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}