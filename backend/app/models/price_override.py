import uuid
from datetime import datetime, date

from sqlalchemy import String, Integer, Date, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base, utc_now


class PropertyPriceOverride(Base):
    """
    Date-range price override set by admin for a property.
    Nights from start_date to end_date (inclusive start, exclusive end)
    are priced at price_per_night instead of the base property.price_per_night.
    """
    __tablename__ = "property_price_overrides"
    __table_args__ = (
        Index("ix_price_overrides_prop_dates", "property_id", "start_date", "end_date"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    price_per_night: Mapped[int] = mapped_column(Integer, nullable=False)
    label: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    property: Mapped["Property"] = relationship("Property", back_populates="price_overrides")  # type: ignore[name-defined]