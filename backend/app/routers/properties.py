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
from app.services.booking import auto_cleanup_expired_bookings

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
    try:
        await auto_cleanup_expired_bookings(db)
    except Exception:
        pass

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
    try:
        cached = await cache_get_json(cache_key)
        if cached and isinstance(cached, dict) and "items" in cached:
            return cached
    except Exception:
        pass

    amenity_list = amenities.split(",") if amenities else None
    result = await get_property_filters(
        db, city=city, state=state, min_price=min_price, max_price=max_price,
        guests=guests, pets_allowed=pets_allowed, amenities=amenity_list,
        page=page, limit=limit,
    )
    response = PropertyListOut.model_validate(result).model_dump(mode="json")
    try:
        await cache_set_json(cache_key, response, ttl_seconds=300)
    except Exception:
        pass
    return response


@router.get("/locations")
async def get_unique_locations(db: AsyncSession = Depends(get_db)):
    cache_key = "properties:locations:list"
    cached = await cache_get_json(cache_key)
    if cached:
        return cached

    query = select(Property.city, Property.state).where(Property.is_published == True).distinct()
    result = await db.execute(query)
    rows = result.all()
    
    locations = []
    seen = set()
    for row in rows:
        city_str = (row.city or "").strip()
        state_str = (row.state or "").strip()
        if not city_str:
            continue
        key = (city_str.lower(), state_str.lower())
        if key not in seen:
            seen.add(key)
            locations.append({"city": city_str, "state": state_str})
            
    response = {"locations": locations}
    await cache_set_json(cache_key, response, ttl_seconds=3600)
    return response


from app.dependencies import get_optional_current_user
from app.models.user import User, UserRole


import uuid


@router.get("/{property_id}", response_model=PropertyOut)
async def get_property(
    property_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    try:
        target_uuid = uuid.UUID(property_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid property ID format")

    query = select(Property).options(selectinload(Property.images)).where(Property.id == target_uuid)
    is_admin = current_user is not None and current_user.role == UserRole.admin
    if not is_admin:
        query = query.where(Property.is_published == True)

    result = await db.execute(query)
    property = result.scalar_one_or_none()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    from app.services.property import apply_property_inheritance
    return await apply_property_inheritance(db, property)


@router.get("/{property_id}/availability")
async def get_property_availability(
    property_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_current_user),
):
    await auto_cleanup_expired_bookings(db)
    try:
        target_uuid = uuid.UUID(property_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid property ID format")

    query = select(Property.id).where(Property.id == target_uuid)
    is_admin = current_user is not None and current_user.role == UserRole.admin
    if not is_admin:
        query = query.where(Property.is_published == True)

    result = await db.execute(query)
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
