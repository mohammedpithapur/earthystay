from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime, date


# ── User ──

class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: str
    phone: str | None
    role: str
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
    password: str
    full_name: str


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
    new_password: str


# ── Dashboard ──

class DashboardOut(BaseModel):
    upcoming_bookings: int
    past_stays: int
    total_spent: int
    profile: UserOut