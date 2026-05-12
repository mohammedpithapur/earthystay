import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base
import enum


class ICalDirection(str, enum.Enum):
    export = "export"
    import_ = "import"


class ICalLink(Base):
    __tablename__ = "ical_links"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("properties.id"), nullable=False)
    calendar_name: Mapped[str] = mapped_column(String(255), nullable=False)
    ical_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    direction: Mapped[ICalDirection] = mapped_column(SAEnum(ICalDirection), nullable=False)
    last_synced: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    property: Mapped["Property"] = relationship("Property")