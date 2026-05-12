from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.models.property import Property
from app.models.review import Review


async def get_property_filters(
    db: AsyncSession,
    city: str | None = None,
    state: str | None = None,
    min_price: int | None = None,
    max_price: int | None = None,
    guests: int | None = None,
    pets_allowed: bool | None = None,
    amenities: list[str] | None = None,
    page: int = 1,
    limit: int = 12,
):
    base = select(Property).where(Property.is_published == True)

    if city:
        base = base.where(Property.city.ilike(f"%{city}%"))
    if state:
        base = base.where(Property.state.ilike(f"%{state}%"))
    if min_price is not None:
        base = base.where(Property.price_per_night >= min_price)
    if max_price is not None:
        base = base.where(Property.price_per_night <= max_price)
    if guests is not None:
        base = base.where(Property.max_guests >= guests)
    if pets_allowed is not None:
        base = base.where(Property.pets_allowed == pets_allowed)
    if amenities:
        base = base.where(Property.amenities.op("?|")(amenities))

    # Count total before pagination
    count_query = select(func.count()).select_from(base.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Paginate with eager-loaded images
    offset = (page - 1) * limit
    query = base.options(selectinload(Property.images)).offset(offset).limit(limit).order_by(Property.created_at.desc())

    result = await db.execute(query)
    properties = result.scalars().all()

    return {"items": properties, "total": total, "page": page, "limit": limit}


async def update_property_rating(db: AsyncSession, property_id: str):
    """Recalculate denormalized rating after review changes."""
    result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(Review.property_id == property_id)
    )
    avg_rating, count = result.one()
    prop = await db.get(Property, property_id)
    if prop:
        prop.avg_rating = round(float(avg_rating), 1) if avg_rating else 0.0
        prop.review_count = count
        await db.commit()