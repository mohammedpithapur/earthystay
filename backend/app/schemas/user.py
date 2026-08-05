from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime, date


# ── User ──

class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: str
    phone: str | None
    role: str
    is_active: bool
    is_email_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None


class PasswordChange(BaseModel):
    old_password: str
    new_password: str


# ── Auth ──

class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str
    phone: str | None = None


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class ResetPasswordIn(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class SendOtpIn(BaseModel):
    email: EmailStr


class VerifyOtpIn(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)


# ── Dashboard ──

class DashboardOut(BaseModel):
    upcoming_bookings: int
    past_stays: int
    total_spent: int
    profile: UserOut
