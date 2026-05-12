from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class ICalLinkCreate(BaseModel):
    calendar_name: str
    ical_url: str
    direction: str  # export | import


class ICalLinkOut(BaseModel):
    id: UUID
    property_id: UUID
    calendar_name: str
    ical_url: str
    direction: str
    last_synced: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}