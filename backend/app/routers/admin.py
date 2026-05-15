from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_admin
from app.models.user import User
from app.models.property import Property
from app.models.booking import Booking, BookingStatus
from app.models.review import Review
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyOut, PropertyImageCreate, PropertyImageUpdate, PropertyImageOut
from app.models.property import PropertyImage

router = APIRouter(prefix="/admin", tags=["admin"])


# ── Dashboard ──

@router.get("/dashboard")
async def dashboard(admin: User = Depends(get_admin), db: AsyncSession = Depends(get_db)):
    total_bookings = await db.scalar(select(func.count(Booking.id)))
    total_properties = await db.scalar(select(func.count(Property.id)))
    revenue = await db.scalar(
        select(func.coalesce(func.sum(Booking.total), 0)).where(Booking.status != BookingStatus.cancelled)
    )
    pending = await db.scalar(select(func.count(Booking.id)).where(Booking.status == BookingStatus.pending))
    return {
        "total_bookings": total_bookings,
        "total_properties": total_properties,
        "total_revenue": revenue,
        "pending_bookings": pending,
    }


# ── Properties CRUD ──

@router.get("/properties", response_model=list[PropertyOut])
async def list_properties(
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Property)
        .options(selectinload(Property.images))
        .order_by(Property.created_at.desc())
    )
    return result.scalars().all()


@router.post("/properties", response_model=PropertyOut)
async def create_property(
    data: PropertyCreate,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    property = Property(owner_id=admin.id, **data.model_dump())
    db.add(property)
    await db.commit()
    await db.refresh(property)
    return property


@router.patch("/properties/{property_id}", response_model=PropertyOut)
async def update_property(
    property_id: str,
    data: PropertyUpdate,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    property = await db.get(Property, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(property, key, val)
    await db.commit()
    await db.refresh(property)
    return property


@router.delete("/properties/{property_id}")
async def delete_property(
    property_id: str,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    property = await db.get(Property, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    await db.delete(property)
    await db.commit()
    return {"message": "Property deleted"}


# ── Property Images ──

@router.post("/properties/{property_id}/images", response_model=PropertyImageOut)
async def add_image(
    property_id: str,
    data: PropertyImageCreate,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    property = await db.get(Property, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    image = PropertyImage(property_id=property_id, **data.model_dump())
    db.add(image)
    await db.commit()
    await db.refresh(image)
    return image


@router.patch("/images/{image_id}", response_model=PropertyImageOut)
async def update_image(
    image_id: str,
    data: PropertyImageUpdate,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    image = await db.get(PropertyImage, image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(image, key, val)
    await db.commit()
    await db.refresh(image)
    return image


@router.delete("/images/{image_id}")
async def delete_image(
    image_id: str,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    image = await db.get(PropertyImage, image_id)
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    await db.delete(image)
    await db.commit()
    return {"message": "Image deleted"}