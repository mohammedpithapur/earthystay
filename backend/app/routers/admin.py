from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_admin
from app.models.user import User
from app.models.property import Property
from app.models.property_group import PropertyGroup, PropertyGroupMember
from app.models.booking import Booking, BookingStatus
from app.models.review import Review
from app.schemas.property import PropertyCreate, PropertyUpdate, PropertyOut, PropertyImageCreate, PropertyImageUpdate, PropertyImageOut
from app.schemas.property_group import PropertyGroupCreate, PropertyGroupMemberCreate, PropertyGroupMemberUpdate, PropertyGroupOut
from app.models.property import PropertyImage
from app.services.upload import (
    delete_property_image_from_url,
    upload_property_image_from_bytes,
    upload_property_image_from_data_url,
    UploadStorageError,
    UploadValidationError,
)

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
    property_data = data.model_dump(exclude={"images"})
    property = Property(owner_id=admin.id, **property_data)
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

    try:
        for key, val in update_data.items():
            setattr(property, key, val)

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