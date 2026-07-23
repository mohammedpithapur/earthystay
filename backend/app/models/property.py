import uuid
from datetime import datetime

from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.database import Base, utc_now


class Property(Base):
    __tablename__ = "properties"
    __table_args__ = (
        Index("ix_properties_is_published", "is_published"),
        Index("ix_properties_owner_id", "owner_id"),
        Index("ix_properties_is_published_city", "is_published", "city"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    city: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), default="India", nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(20), nullable=False)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    check_in_time: Mapped[str] = mapped_column(String(20), default="2:00 PM", nullable=False)
    check_out_time: Mapped[str] = mapped_column(String(20), default="11:00 AM", nullable=False)
    house_rules: Mapped[dict] = mapped_column(JSONB, default=list, nullable=False)
    price_per_night: Mapped[int] = mapped_column(Integer, nullable=False)
    cleaning_fee: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    extra_guest_charge_per_night: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    base_guests: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    max_guests: Mapped[int] = mapped_column(Integer, nullable=False)
    bedrooms: Mapped[int] = mapped_column(Integer, nullable=False)
    bathrooms: Mapped[int] = mapped_column(Integer, nullable=False)
    bathrooms_detail: Mapped[dict] = mapped_column(JSONB, default=list, nullable=False)
    min_nights: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    pets_allowed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    pet_charge_per_night: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    max_pets: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    amenities: Mapped[dict] = mapped_column(JSONB, default=list, nullable=False)
    is_published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    override_house_rules: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    override_amenities: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    override_details: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    avg_rating: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    review_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    images: Mapped[list["PropertyImage"]] = relationship("PropertyImage", back_populates="property", cascade="all, delete-orphan")
    group_memberships: Mapped[list["PropertyGroupMember"]] = relationship(
        "PropertyGroupMember",
        back_populates="property",
        cascade="all, delete-orphan",
    )
    owner: Mapped["User"] = relationship("User")


class PropertyImage(Base):
    __tablename__ = "property_images"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    property: Mapped["Property"] = relationship("Property", back_populates="images")
