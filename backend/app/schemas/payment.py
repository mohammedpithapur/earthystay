from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class PaymentOrderCreate(BaseModel):
    """Request body for POST /payments/create-order"""
    booking_id: UUID


class PaymentOrderOut(BaseModel):
    """Returned to frontend so it can open Razorpay checkout modal"""
    payment_id: UUID            # our internal DB record id
    razorpay_order_id: str      # Razorpay's order ID
    amount: int                 # paise (INR × 100)
    currency: str               # "INR"
    key_id: str                 # RAZORPAY_KEY_ID — safe to expose to frontend


class PaymentVerifyIn(BaseModel):
    """
    Razorpay returns these three fields in the checkout handler callback.
    We verify the HMAC-SHA256 signature server-side before confirming the booking.
    """
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentOut(BaseModel):
    id: UUID
    booking_id: UUID
    razorpay_order_id: str
    razorpay_payment_id: str | None
    amount: int
    currency: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
