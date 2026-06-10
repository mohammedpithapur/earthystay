from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime, date
from app.models.event import EventStatus


class EventRequestCreate(BaseModel):
    destination: str
    hotel: str
    nature_of_event: str
    event_start_date: date
    event_end_date: date
    no_of_guests: int
    requires_rooms: bool = False
    no_of_rooms: int | None = None
    additional_details: str | None = None
    name: str
    phone: str
    email: EmailStr


class EventRequestUpdate(BaseModel):
    status: EventStatus


class EventRequestOut(BaseModel):
    id: UUID
    destination: str
    hotel: str
    nature_of_event: str
    event_start_date: date
    event_end_date: date
    no_of_guests: int
    requires_rooms: bool
    no_of_rooms: int | None
    additional_details: str | None
    name: str
    phone: str
    email: str
    status: EventStatus
    created_at: datetime

    model_config = {"from_attributes": True}
