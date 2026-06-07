from __future__ import annotations

import uuid
import enum
from datetime import datetime

from sqlalchemy import String, Integer, DateTime, Enum as SAEnum, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.database import Base, utc_now


class RazorpayPaymentStatus(str, enum.Enum):
    created  = "created"
    paid     = "paid"
    failed   = "failed"
    refunded = "refunded"


class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = (
        UniqueConstraint("booking_id", name="uq_payments_booking_id"),
        UniqueConstraint("razorpay_order_id", name="uq_payments_razorpay_order_id"),
        Index("ix_payments_booking_id", "booking_id"),
        Index("ix_payments_razorpay_order_id", "razorpay_order_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    booking_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("bookings.id", ondelete="CASCADE"),
        nullable=False,
    )
    razorpay_order_id: Mapped[str] = mapped_column(String(100), nullable=False)
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    razorpay_signature: Mapped[str | None] = mapped_column(String(512), nullable=True)
    # amount stored in paise (INR × 100) to match Razorpay convention
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="INR", nullable=False)
    status: Mapped[RazorpayPaymentStatus] = mapped_column(
        SAEnum(RazorpayPaymentStatus),
        default=RazorpayPaymentStatus.created,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utc_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=utc_now, onupdate=utc_now, nullable=False
    )

    booking: Mapped["Booking"] = relationship("Booking", back_populates="payment")  # type: ignore[name-defined]
