import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, String, UniqueConstraint, Index, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, utc_now


class PropertyGroup(Base):
    __tablename__ = "property_groups"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    members: Mapped[list["PropertyGroupMember"]] = relationship(
        "PropertyGroupMember",
        back_populates="group",
        cascade="all, delete-orphan",
    )


class PropertyGroupMember(Base):
    __tablename__ = "property_group_members"
    __table_args__ = (
        UniqueConstraint("group_id", "property_id", name="uq_property_group_members_group_property"),
        Index(
            "uq_property_group_members_whole_property",
            "group_id",
            unique=True,
            postgresql_where=text("is_whole_property"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("property_groups.id", ondelete="CASCADE"), nullable=False)
    property_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    is_whole_property: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)

    group: Mapped["PropertyGroup"] = relationship("PropertyGroup", back_populates="members")
    property: Mapped["Property"] = relationship("Property", back_populates="group_memberships")
