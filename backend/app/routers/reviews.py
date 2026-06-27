from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from uuid import UUID

from app.database import get_db, utc_now
from app.dependencies import get_admin
from app.models.user import User
from app.models.property import Property
from app.models.property_group import PropertyGroupMember
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewOut

router = APIRouter(tags=["reviews"])


async def recalculate_property_ratings(db: AsyncSession, property_id: UUID):
    # Find if property belongs to a group
    group_member_res = await db.execute(
        select(PropertyGroupMember).where(PropertyGroupMember.property_id == property_id)
    )
    group_member = group_member_res.scalar_one_or_none()

    property_ids = [property_id]
    if group_member:
        # Fetch all property IDs in this group
        members_res = await db.execute(
            select(PropertyGroupMember.property_id).where(
                PropertyGroupMember.group_id == group_member.group_id
            )
        )
        property_ids = list(members_res.scalars().all())

    # Calculate avg rating and count for these properties
    stats_res = await db.execute(
        select(func.count(Review.id), func.avg(Review.rating)).where(
            Review.property_id.in_(property_ids)
        )
    )
    count, avg_rating = stats_res.fetchone()

    count = count or 0
    avg_rating = round(float(avg_rating), 2) if avg_rating is not None else 0.0

    # Update all affected properties
    for p_id in property_ids:
        prop = await db.get(Property, p_id)
        if prop:
            prop.avg_rating = avg_rating
            prop.review_count = count
            db.add(prop)

    await db.commit()


@router.get("/properties/{property_id}/reviews", response_model=list[ReviewOut])
async def get_property_reviews(property_id: UUID, db: AsyncSession = Depends(get_db)):
    # Check if property belongs to a group
    group_member_res = await db.execute(
        select(PropertyGroupMember).where(PropertyGroupMember.property_id == property_id)
    )
    group_member = group_member_res.scalar_one_or_none()

    property_ids = [property_id]
    if group_member:
        # Fetch all property IDs in this group
        members_res = await db.execute(
            select(PropertyGroupMember.property_id).where(
                PropertyGroupMember.group_id == group_member.group_id
            )
        )
        property_ids = list(members_res.scalars().all())

    # Retrieve all reviews for the group properties
    reviews_res = await db.execute(
        select(Review)
        .where(Review.property_id.in_(property_ids))
        .order_by(Review.created_at.desc())
    )
    return reviews_res.scalars().all()


@router.post("/admin/reviews", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_admin_review(
    data: ReviewCreate,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    # Verify property exists
    prop = await db.get(Property, data.property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")

    review = Review(
        property_id=data.property_id,
        guest_name=data.guest_name,
        rating=data.rating,
        comment=data.comment,
        platform=data.platform,
        created_at=data.created_at or utc_now(),
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)

    # Recalculate ratings
    await recalculate_property_ratings(db, data.property_id)
    
    # Reload from DB to ensure relationships are clean
    await db.refresh(review)
    return review


@router.delete("/admin/reviews/{review_id}", status_code=status.HTTP_200_OK)
async def delete_admin_review(
    review_id: UUID,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    review = await db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    property_id = review.property_id
    await db.delete(review)
    await db.commit()

    # Recalculate ratings
    await recalculate_property_ratings(db, property_id)
    return {"message": "Review deleted successfully"}


@router.patch("/admin/reviews/{review_id}", response_model=ReviewOut)
async def update_admin_review(
    review_id: UUID,
    data: dict,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    review = await db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")

    allowed_fields = {"guest_name", "rating", "comment", "platform"}
    for field, value in data.items():
        if field in allowed_fields:
            setattr(review, field, value)

    await db.commit()
    await db.refresh(review)
    await recalculate_property_ratings(db, review.property_id)
    await db.refresh(review)
    return review
