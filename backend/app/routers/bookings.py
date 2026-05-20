from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func

from app.database import get_db
from app.dependencies import get_current_user, get_admin
from app.models.user import User
from app.models.property import Property
from app.models.booking import Booking, BookingStatus
from app.schemas.booking import BookingCreate, BookingOut, BookingStatusUpdate, BookingListOut
from app.services.booking import calculate_pricing, apply_group_blocking, remove_shadow_blocks

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.post("", response_model=BookingOut)
async def create_booking(
    data: BookingCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    property = await db.get(Property, data.property_id)
    if not property or not property.is_published:
        raise HTTPException(status_code=404, detail="Property not found")

    # Check availability — overlapping confirmed/pending bookings
    overlapping = await db.execute(
        select(Booking).where(
            Booking.property_id == data.property_id,
            Booking.status.in_([BookingStatus.confirmed, BookingStatus.pending]),
            Booking.check_in < data.check_out,
            Booking.check_out > data.check_in,
        )
    )
    if overlapping.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Property is not available for these dates")

    pricing = calculate_pricing(property, data.check_in, data.check_out, data.pets)

    booking = Booking(
        property_id=data.property_id,
        guest_id=user.id,
        check_in=data.check_in,
        check_out=data.check_out,
        guests=data.guests,
        pets=data.pets,
        nights=pricing["nights"],
        base_price=pricing["base_price"],
        cleaning_fee=pricing["cleaning_fee"],
        pet_charge=pricing["pet_charge"],
        total=pricing["total"],
        status=BookingStatus.pending,
        guest_name=user.full_name,
        guest_email=user.email,
        guest_phone=user.phone,
    )
    db.add(booking)
    await db.commit()
    await db.refresh(booking)
    await apply_group_blocking(db, booking)
    return booking


@router.get("/mine", response_model=BookingListOut)
async def my_bookings(
    status: str | None = None,
    page: int = 1,
    limit: int = 20,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    base_query = select(Booking).where(
        Booking.guest_id == user.id,
        Booking.is_shadow_block == False,
    )
    if status:
        base_query = base_query.where(Booking.status == status)

    total = await db.scalar(select(func.count()).select_from(base_query.subquery()))

    paged_query = (
        base_query.order_by(Booking.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(paged_query)
    items = result.scalars().all()
    return {"items": items, "total": total, "page": page, "limit": limit}


@router.get("/{booking_id}", response_model=BookingOut)
async def get_booking(
    booking_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    booking = await db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.guest_id != user.id and user.role.value != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    return booking


# ── Admin booking management ──

@router.get("/admin/all", response_model=BookingListOut)
async def admin_list_bookings(
    search: str | None = None,
    status: str | None = None,
    page: int = 1,
    limit: int = 20,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    base_query = select(Booking).where(Booking.is_shadow_block == False)
    if search:
        base_query = base_query.where(
            or_(Booking.guest_name.ilike(f"%{search}%"), Booking.guest_email.ilike(f"%{search}%"))
        )
    if status:
        base_query = base_query.where(Booking.status == status)

    total = await db.scalar(select(func.count()).select_from(base_query.subquery()))

    paged_query = (
        base_query.order_by(Booking.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    )
    result = await db.execute(paged_query)
    items = result.scalars().all()
    return {"items": items, "total": total, "page": page, "limit": limit}


@router.patch("/admin/{booking_id}", response_model=BookingOut)
async def update_booking_status(
    booking_id: str,
    data: BookingStatusUpdate,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    booking = await db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = BookingStatus(data.status)
    await db.commit()
    await db.refresh(booking)
    if booking.status == BookingStatus.cancelled:
        await remove_shadow_blocks(db, booking)
    return booking