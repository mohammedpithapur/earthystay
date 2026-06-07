import hashlib
import json

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.booking import Booking, BookingStatus
from app.models.property import Property
from app.schemas.property import PropertyListOut, PropertyOut
from app.services.property import get_property_filters
from app.services.cache import cache_get_json, cache_set_json

router = APIRouter(prefix="/properties", tags=["properties"])


@router.get("", response_model=PropertyListOut)
async def list_properties(
    city: str | None = Query(None),
    state: str | None = Query(None),
    min_price: int | None = Query(None),
    max_price: int | None = Query(None),
    guests: int | None = Query(None),
    pets_allowed: bool | None = Query(None),
    amenities: str | None = Query(None),  # comma-separated
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    cache_payload = {
        "city": city,
        "state": state,
        "min_price": min_price,
        "max_price": max_price,
        "guests": guests,
        "pets_allowed": pets_allowed,
        "amenities": amenities,
        "page": page,
        "limit": limit,
    }
    cache_hash = hashlib.sha256(json.dumps(cache_payload, sort_keys=True).encode()).hexdigest()
    cache_key = f"properties:list:{cache_hash}"
    cached = await cache_get_json(cache_key)
    if cached:
        return cached

    amenity_list = amenities.split(",") if amenities else None
    result = await get_property_filters(
        db, city=city, state=state, min_price=min_price, max_price=max_price,
        guests=guests, pets_allowed=pets_allowed, amenities=amenity_list,
        page=page, limit=limit,
    )
    response = PropertyListOut.model_validate(result).model_dump(mode="json")
    await cache_set_json(cache_key, response, ttl_seconds=300)
    return response


@router.get("/{property_id}", response_model=PropertyOut)
async def get_property(
    property_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Property)
        .options(selectinload(Property.images))
        .where(Property.id == property_id, Property.is_published == True)
    )
    property = result.scalar_one_or_none()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    from app.services.property import apply_property_inheritance
    return await apply_property_inheritance(db, property)


@router.get("/{property_id}/availability")
async def get_property_availability(
    property_id: str,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Property.id).where(Property.id == property_id, Property.is_published == True)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Property not found")

    result = await db.execute(
        select(Booking.check_in, Booking.check_out).where(
            Booking.property_id == property_id,
            Booking.status.in_([BookingStatus.confirmed, BookingStatus.pending]),
        )
    )
    return [
        {"check_in": check_in, "check_out": check_out}
        for check_in, check_out in result.all()
    ]
