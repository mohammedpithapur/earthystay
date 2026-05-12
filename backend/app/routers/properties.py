from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.property import PropertyListOut, PropertyOut
from app.services.property import get_property_filters

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
    limit: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    amenity_list = amenities.split(",") if amenities else None
    return await get_property_filters(
        db, city=city, state=state, min_price=min_price, max_price=max_price,
        guests=guests, pets_allowed=pets_allowed, amenities=amenity_list,
        page=page, limit=limit,
    )