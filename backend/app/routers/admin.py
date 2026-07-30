import uuid
from datetime import date, timedelta

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_admin
from app.models.user import User
from app.models.property import Property
from app.models.property_group import PropertyGroup, PropertyGroupMember
from app.models.booking import Booking, BookingStatus, PaymentStatus
from app.models.review import Review
from app.schemas.booking import AdminBlockCreate, CalendarEventOut, CalendarOut
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyOut, PropertyImageCreate, PropertyImageUpdate, PropertyImageOut
from app.schemas.property_group import PropertyGroupCreate, PropertyGroupMemberCreate, PropertyGroupMemberUpdate, PropertyGroupOut
from app.services.booking import apply_group_blocking, remove_shadow_blocks
from app.models.property import PropertyImage
from app.services.upload import (
    delete_property_image_from_url,
    upload_property_image_from_bytes,
    upload_property_image_from_data_url,
    UploadStorageError,
    UploadValidationError,
)
from app.services.cache import cache_get_json, cache_set_json

router = APIRouter(prefix="/admin", tags=["admin"])


async def fetch_group(db: AsyncSession, group_id: str) -> PropertyGroup | None:
    result = await db.execute(
        select(PropertyGroup)
        .options(selectinload(PropertyGroup.members).selectinload(PropertyGroupMember.property))
        .where(PropertyGroup.id == group_id)
    )
    return result.scalar_one_or_none()


async def sync_property_images(db: AsyncSession, property_id: str, images: list[PropertyImageCreate] | None) -> None:
    if images is None:
        return

    existing_result = await db.execute(select(PropertyImage).where(PropertyImage.property_id == property_id))
    for image in existing_result.scalars().all():
        await db.delete(image)

    if not images:
        return

    normalized_images = []
    primary_assigned = False
    for index, image_data in enumerate(images):
        is_primary = bool(image_data.is_primary) and not primary_assigned
        primary_assigned = primary_assigned or is_primary
        normalized_images.append(
            PropertyImage(
                property_id=property_id,
                image_url=image_data.image_url,
                is_primary=is_primary,
                display_order=image_data.display_order or index + 1,
            )
        )

    if not primary_assigned and normalized_images:
        normalized_images[0].is_primary = True

    db.add_all(normalized_images)


async def normalize_property_images(images: list[PropertyImageCreate] | None) -> list[PropertyImageCreate] | None:
    if images is None:
        return None

    normalized: list[PropertyImageCreate] = []
    for image in images:
        image_url = image.image_url
        if image_url.startswith("data:image"):
            try:
                image_url = upload_property_image_from_data_url(image_url)
            except UploadValidationError as exc:
                raise HTTPException(status_code=400, detail=str(exc)) from exc
            except UploadStorageError as exc:
                raise HTTPException(status_code=500, detail=f"Image upload failed: {exc}") from exc

        normalized.append(
            PropertyImageCreate(
                image_url=image_url,
                is_primary=image.is_primary,
                display_order=image.display_order,
            )
        )

    return normalized


# ── Dashboard ──

@router.get("/dashboard")
async def dashboard(admin: User = Depends(get_admin), db: AsyncSession = Depends(get_db)):
    cache_key = "admin:dashboard"
    cached = await cache_get_json(cache_key)
    if cached:
        return cached

    total_bookings = await db.scalar(
        select(func.count(Booking.id)).where(Booking.status.in_([BookingStatus.confirmed, BookingStatus.completed]))
    )
    total_properties = await db.scalar(select(func.count(Property.id)))
    revenue = await db.scalar(
        select(func.coalesce(func.sum(Booking.total), 0)).where(
            Booking.status.in_([BookingStatus.confirmed, BookingStatus.completed])
        )
    )
    pending = await db.scalar(select(func.count(Booking.id)).where(Booking.status == BookingStatus.pending))

    today = date.today()
    monthly_stats = []
    
    result = await db.execute(
        select(Booking.created_at, Booking.total)
        .where(Booking.status.in_([BookingStatus.confirmed, BookingStatus.completed]))
    )
    bookings_data = result.all()

    for i in range(5, -1, -1):
        target_month_year = today.year
        target_month = today.month - i
        while target_month <= 0:
            target_month += 12
            target_month_year -= 1

        month_label = date(target_month_year, target_month, 1).strftime("%b %Y")
        
        m_rev = sum(
            b.total for b in bookings_data 
            if b.created_at and b.created_at.year == target_month_year and b.created_at.month == target_month
        )
        m_count = sum(
            1 for b in bookings_data 
            if b.created_at and b.created_at.year == target_month_year and b.created_at.month == target_month
        )

        monthly_stats.append({
            "month": month_label,
            "revenue": m_rev,
            "bookings": m_count
        })

    response_data = {
        "total_bookings": total_bookings,
        "total_properties": total_properties,
        "total_revenue": revenue,
        "pending_bookings": pending,
        "monthly_stats": monthly_stats,
    }
    await cache_set_json(cache_key, response_data, ttl_seconds=30)
    return response_data


@router.get("/analytics")
async def get_admin_analytics(admin: User = Depends(get_admin), db: AsyncSession = Depends(get_db)):
    cache_key = "admin:analytics"
    cached = await cache_get_json(cache_key)
    if cached:
        return cached

    today = date.today()

    result = await db.execute(
        select(Booking, Property)
        .join(Property, Booking.property_id == Property.id)
        .where(Booking.status.in_([BookingStatus.confirmed, BookingStatus.completed]))
    )
    rows = result.all()

    # Daily Stats (Last 30 Days)
    daily_stats = []
    for i in range(29, -1, -1):
        day_date = today - timedelta(days=i)
        day_str = day_date.strftime("%d %b")
        
        day_rev = sum(
            b.total for b, p in rows 
            if b.created_at and b.created_at.date() == day_date
        )
        day_count = sum(
            1 for b, p in rows 
            if b.created_at and b.created_at.date() == day_date
        )
        day_nights = sum(
            b.nights for b, p in rows 
            if b.created_at and b.created_at.date() == day_date
        )

        daily_stats.append({
            "date": day_str,
            "full_date": day_date.isoformat(),
            "revenue": day_rev,
            "bookings": day_count,
            "nights": day_nights,
        })

    # Monthly Stats (Last 12 Months)
    monthly_stats = []
    for i in range(11, -1, -1):
        target_year = today.year
        target_month = today.month - i
        while target_month <= 0:
            target_month += 12
            target_year -= 1

        month_label = date(target_year, target_month, 1).strftime("%b %Y")
        
        m_rev = sum(
            b.total for b, p in rows 
            if b.created_at and b.created_at.year == target_year and b.created_at.month == target_month
        )
        m_count = sum(
            1 for b, p in rows 
            if b.created_at and b.created_at.year == target_year and b.created_at.month == target_month
        )
        m_nights = sum(
            b.nights for b, p in rows 
            if b.created_at and b.created_at.year == target_year and b.created_at.month == target_month
        )

        monthly_stats.append({
            "month": month_label,
            "revenue": m_rev,
            "bookings": m_count,
            "nights": m_nights,
        })

    # Property Performance Breakdown
    property_map = {}
    all_props_res = await db.execute(select(Property).options(selectinload(Property.images)))
    all_properties = all_props_res.scalars().all()
    for prop in all_properties:
        first_img = next((img.image_url for img in prop.images if img.is_primary), prop.images[0].image_url if prop.images else None)
        property_map[str(prop.id)] = {
            "property_id": str(prop.id),
            "name": prop.name,
            "city": prop.city,
            "state": prop.state,
            "price_per_night": prop.price_per_night,
            "total_revenue": 0,
            "bookings_count": 0,
            "nights_booked": 0,
            "image_url": first_img,
        }

    for b, p in rows:
        pid = str(b.property_id)
        if pid in property_map:
            property_map[pid]["total_revenue"] += b.total
            property_map[pid]["bookings_count"] += 1
            property_map[pid]["nights_booked"] += b.nights

    property_performance = list(property_map.values())
    property_performance.sort(key=lambda x: x["total_revenue"], reverse=True)

    total_rev = sum(b.total for b, p in rows)
    total_nights = sum(b.nights for b, p in rows)
    total_bks = len(rows)
    avg_daily_rate = round(total_rev / total_nights) if total_nights > 0 else 0

    analytics_response = {
        "summary": {
            "total_revenue": total_rev,
            "total_bookings": total_bks,
            "total_nights": total_nights,
            "avg_daily_rate": avg_daily_rate,
        },
        "daily_stats": daily_stats,
        "monthly_stats": monthly_stats,
        "property_performance": property_performance,
    }
    await cache_set_json(cache_key, analytics_response, ttl_seconds=30)
    return analytics_response


@router.post("/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    admin: User = Depends(get_admin),
):
    try:
        image_bytes = await file.read()
        public_url = upload_property_image_from_bytes(image_bytes, file.content_type or "")
        return {"url": public_url}
    except UploadValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except UploadStorageError as exc:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {exc}") from exc
    finally:
        await file.close()


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
    images = await normalize_property_images(data.images)
    spaces = data.spaces_detail
    property_data = data.model_dump(exclude={"images", "spaces_detail"})
    if "amenities" in property_data and isinstance(property_data["amenities"], list):
        property_data["amenities"] = [a for a in property_data["amenities"] if isinstance(a, str) and not a.startswith("__space__:") and not a.startswith("{")]
    property = Property(owner_id=admin.id, **property_data)
    if spaces:
        property.spaces_detail = spaces
    db.add(property)

    try:
        await db.flush()
        await sync_property_images(db, str(property.id), images)
        await db.commit()
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to save property") from exc

    result = await db.execute(
        select(Property)
        .options(selectinload(Property.images))
        .where(Property.id == property.id)
    )
    return result.scalar_one()


@router.patch("/properties/{property_id}", response_model=PropertyOut)
async def update_property(
    property_id: str,
    data: PropertyUpdate,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Property)
        .options(selectinload(Property.images))
        .where(Property.id == property_id)
    )
    property = result.scalar_one_or_none()
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    images = await normalize_property_images(data.images)
    update_data = data.model_dump(exclude_unset=True, exclude={"images"})
    spaces = update_data.pop("spaces_detail", None)
    if "amenities" in update_data and isinstance(update_data["amenities"], list):
        update_data["amenities"] = [a for a in update_data["amenities"] if isinstance(a, str) and not a.startswith("__space__:") and not a.startswith("{")]

    try:
        for key, val in update_data.items():
            setattr(property, key, val)

        if spaces is not None:
            property.spaces_detail = spaces

        await sync_property_images(db, property_id, images)
        await db.commit()
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update property") from exc

    result = await db.execute(
        select(Property)
        .options(selectinload(Property.images))
        .where(Property.id == property.id)
    )
    return result.scalar_one()


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


@router.post("/properties/{property_id}/duplicate", response_model=PropertyOut)
async def duplicate_property(
    property_id: str,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    """Clone a property as a new unpublished draft (images re-used, bookings/reviews not copied)."""
    result = await db.execute(
        select(Property)
        .options(selectinload(Property.images))
        .where(Property.id == property_id)
    )
    source = result.scalar_one_or_none()
    if not source:
        raise HTTPException(status_code=404, detail="Property not found")

    new_property = Property(
        owner_id=source.owner_id,
        name=f"Copy of {source.name}",
        description=source.description,
        address=source.address,
        city=source.city,
        state=source.state,
        country=source.country,
        latitude=source.latitude,
        longitude=source.longitude,
        contact_phone=source.contact_phone,
        contact_email=source.contact_email,
        check_in_time=source.check_in_time,
        check_out_time=source.check_out_time,
        house_rules=list(source.house_rules) if source.house_rules else [],
        price_per_night=source.price_per_night,
        cleaning_fee=source.cleaning_fee,
        max_guests=source.max_guests,
        bedrooms=source.bedrooms,
        bathrooms=source.bathrooms,
        bathrooms_detail=list(source.bathrooms_detail) if source.bathrooms_detail else [],
        min_nights=source.min_nights,
        pets_allowed=source.pets_allowed,
        pet_charge_per_night=source.pet_charge_per_night,
        amenities=list(source.amenities) if source.amenities else [],
        is_published=False,
        override_house_rules=source.override_house_rules,
        override_amenities=source.override_amenities,
        override_details=source.override_details,
        avg_rating=0.0,
        review_count=0,
    )
    db.add(new_property)
    await db.flush()

    # Copy images (reuse same URLs — no file copy needed)
    for img in source.images:
        new_img = PropertyImage(
            property_id=new_property.id,
            image_url=img.image_url,
            is_primary=img.is_primary,
            display_order=img.display_order,
        )
        db.add(new_img)

    await db.commit()

    result = await db.execute(
        select(Property)
        .options(selectinload(Property.images))
        .where(Property.id == new_property.id)
    )
    return result.scalar_one()



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

    image_url = data.image_url
    if image_url.startswith("data:image"):
        try:
            image_url = upload_property_image_from_data_url(image_url)
        except UploadValidationError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except UploadStorageError as exc:
            raise HTTPException(status_code=500, detail=f"Image upload failed: {exc}") from exc

    image = PropertyImage(
        property_id=property_id,
        image_url=image_url,
        is_primary=data.is_primary,
        display_order=data.display_order,
    )
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
    try:
        delete_property_image_from_url(image.image_url)
    except UploadStorageError as exc:
        raise HTTPException(status_code=500, detail=f"Image delete failed: {exc}") from exc
    await db.delete(image)
    await db.commit()
    return {"message": "Image deleted"}


# ── Property Groups ──

@router.get("/groups", response_model=list[PropertyGroupOut])
async def list_groups(
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(PropertyGroup)
        .options(selectinload(PropertyGroup.members).selectinload(PropertyGroupMember.property))
        .order_by(PropertyGroup.created_at.desc())
    )
    return result.scalars().all()


@router.post("/groups", response_model=PropertyGroupOut)
async def create_group(
    data: PropertyGroupCreate,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    group = PropertyGroup(name=data.name)
    db.add(group)
    await db.commit()
    await db.refresh(group)
    return await fetch_group(db, str(group.id))


@router.post("/groups/{group_id}/members", response_model=PropertyGroupOut)
async def add_group_member(
    group_id: str,
    data: PropertyGroupMemberCreate,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    group = await db.get(PropertyGroup, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    property = await db.get(Property, data.property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")

    existing = await db.execute(
        select(PropertyGroupMember)
        .where(PropertyGroupMember.group_id == group_id, PropertyGroupMember.property_id == data.property_id)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Property already in this group")

    if data.is_whole_property:
        whole = await db.execute(
            select(PropertyGroupMember)
            .where(PropertyGroupMember.group_id == group_id, PropertyGroupMember.is_whole_property == True)
        )
        if whole.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Group already has a whole-property listing")

    member = PropertyGroupMember(
        group_id=group_id,
        property_id=data.property_id,
        is_whole_property=data.is_whole_property,
    )
    db.add(member)
    await db.commit()
    return await fetch_group(db, group_id)


@router.delete("/groups/{group_id}/members/{member_id}", response_model=PropertyGroupOut)
async def remove_group_member(
    group_id: str,
    member_id: str,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    member = await db.get(PropertyGroupMember, member_id)
    if not member or str(member.group_id) != group_id:
        raise HTTPException(status_code=404, detail="Group member not found")

    await db.delete(member)
    await db.commit()
    return await fetch_group(db, group_id)


@router.patch("/groups/{group_id}/members/{member_id}", response_model=PropertyGroupOut)
async def update_group_member(
    group_id: str,
    member_id: str,
    data: PropertyGroupMemberUpdate,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    member = await db.get(PropertyGroupMember, member_id)
    if not member or str(member.group_id) != group_id:
        raise HTTPException(status_code=404, detail="Group member not found")

    if data.is_whole_property:
        whole = await db.execute(
            select(PropertyGroupMember)
            .where(PropertyGroupMember.group_id == group_id, PropertyGroupMember.is_whole_property == True)
        )
        existing = whole.scalar_one_or_none()
        if existing and existing.id != member.id:
            raise HTTPException(status_code=409, detail="Group already has a whole-property listing")

    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(member, key, val)

    await db.commit()
    return await fetch_group(db, group_id)


@router.put("/groups/{group_id}", response_model=PropertyGroupOut)
async def update_group(
    group_id: str,
    data: PropertyGroupCreate,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    group = await db.get(PropertyGroup, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    group.name = data.name
    await db.commit()
    return await fetch_group(db, group_id)


@router.delete("/groups/{group_id}")
async def delete_group(
    group_id: str,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    group = await db.get(PropertyGroup, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    await db.delete(group)
    await db.commit()
    return {"message": "Group deleted"}


# ── Admin Calendar & Date Blocking ────────────────────────────────────────────

@router.get("/properties/{property_id}/calendar", response_model=CalendarOut)
async def get_property_calendar(
    property_id: str,
    from_date: date = Query(default=None),
    to_date: date = Query(default=None),
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    """Return all calendar events (bookings, admin blocks, shadow blocks) for a property."""
    # Default to a 3-month window centred on today
    if from_date is None:
        from_date = date.today().replace(day=1) - timedelta(days=1)
        from_date = from_date.replace(day=1)  # first of previous month
    if to_date is None:
        to_date = (date.today().replace(day=1) + timedelta(days=62)).replace(day=1) - timedelta(days=1)

    result = await db.execute(
        select(Booking).where(
            Booking.property_id == property_id,
            Booking.status.in_([BookingStatus.confirmed, BookingStatus.pending, BookingStatus.completed]),
            Booking.check_in < to_date,
            Booking.check_out > from_date,
        )
    )
    bookings = result.scalars().all()

    events: list[CalendarEventOut] = []
    for b in bookings:
        if b.is_admin_block:
            event_type = "admin_block"
        elif b.is_shadow_block:
            event_type = "shadow_block"
        else:
            event_type = "guest_booking"

        # For shadow blocks, resolve the parent booking ref
        parent_ref: str | None = None
        if b.is_shadow_block and b.parent_booking_id:
            parent = await db.get(Booking, b.parent_booking_id)
            parent_ref = parent.booking_ref if parent else None

        events.append(CalendarEventOut(
            id=b.id,
            type=event_type,
            check_in=b.check_in,
            check_out=b.check_out,
            guest_name=b.guest_name if not b.is_admin_block else None,
            guest_email=b.guest_email if not b.is_admin_block else None,
            booking_ref=b.booking_ref if not b.is_admin_block else None,
            total=b.total if not b.is_admin_block else None,
            status=b.status.value if not b.is_admin_block else None,
            payment_status=b.payment_status.value if not b.is_admin_block else None,
            note=b.note,
            parent_booking_ref=parent_ref,
        ))

    return CalendarOut(events=events)


@router.post("/properties/{property_id}/blocks", response_model=CalendarEventOut, status_code=201)
async def create_admin_block(
    property_id: str,
    data: AdminBlockCreate,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create an admin date block. Automatically shadow-blocks grouped sibling properties."""
    property_obj = await db.get(Property, property_id)
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")

    # Check for overlap with real guest bookings on this property
    overlap_result = await db.execute(
        select(Booking).where(
            Booking.property_id == property_id,
            Booking.status.in_([BookingStatus.confirmed, BookingStatus.pending]),
            Booking.is_admin_block == False,  # Only check real guest bookings
            Booking.check_in < data.check_out,
            Booking.check_out > data.check_in,
        )
    )
    conflicting = overlap_result.scalar_one_or_none()
    if conflicting:
        raise HTTPException(
            status_code=409,
            detail=f"Dates overlap with an existing guest booking: {conflicting.booking_ref}",
        )

    nights = (data.check_out - data.check_in).days

    block = Booking(
        id=uuid.uuid4(),
        property_id=uuid.UUID(property_id),
        guest_id=admin.id,
        check_in=data.check_in,
        check_out=data.check_out,
        guests=1,
        pets=0,
        nights=nights,
        base_price=0,
        cleaning_fee=0,
        pet_charge=0,
        total=0,
        status=BookingStatus.confirmed,
        payment_status=PaymentStatus.unpaid,
        is_admin_block=True,
        is_shadow_block=False,
        note=data.note,
        guest_name="Admin Block",
        guest_email="admin@earthystay.com",
    )
    db.add(block)
    await db.flush()  # Populate block.id before group blocking
    await apply_group_blocking(db, block, commit=False)
    await db.commit()
    await db.refresh(block)

    return CalendarEventOut(
        id=block.id,
        type="admin_block",
        check_in=block.check_in,
        check_out=block.check_out,
        note=block.note,
    )


@router.delete("/properties/{property_id}/blocks/{block_id}")
async def delete_admin_block(
    property_id: str,
    block_id: str,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete an admin date block and remove all associated group shadow blocks."""
    block = await db.get(Booking, block_id)
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")
    if str(block.property_id) != property_id:
        raise HTTPException(status_code=404, detail="Block not found for this property")
    if not block.is_admin_block:
        raise HTTPException(
            status_code=403,
            detail="Cannot delete a guest booking through this endpoint",
        )

    await remove_shadow_blocks(db, block, commit=False)
    await db.delete(block)
    await db.commit()
    return {"message": "Block removed"}