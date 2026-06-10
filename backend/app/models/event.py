from __future__ import annotations
import uuid
import enum
from datetime import datetime, date

from sqlalchemy import String, Integer, DateTime, Date, Text, Boolean, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base, utc_now


class EventStatus(str, enum.Enum):
    pending = "pending"
    contacted = "contacted"
    confirmed = "confirmed"
    cancelled = "cancelled"


class EventRequest(Base):
    __tablename__ = "event_requests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    destination: Mapped[str] = mapped_column(String(100), nullable=False)
    hotel: Mapped[str] = mapped_column(String(100), nullable=False)
    nature_of_event: Mapped[str] = mapped_column(String(100), nullable=False)
    event_start_date: Mapped[date] = mapped_column(Date, nullable=False)
    event_end_date: Mapped[date] = mapped_column(Date, nullable=False)
    no_of_guests: Mapped[int] = mapped_column(Integer, nullable=False)
    requires_rooms: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    no_of_rooms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    additional_details: Mapped[str | None] = mapped_column(Text, nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[EventStatus] = mapped_column(SAEnum(EventStatus), default=EventStatus.pending, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
