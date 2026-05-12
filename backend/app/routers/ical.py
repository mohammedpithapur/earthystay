from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.dependencies import get_admin
from app.models.user import User
from app.models.property import Property
from app.models.ical import ICalLink
from app.schemas.ical import ICalLinkCreate, ICalLinkOut

router = APIRouter(prefix="/ical", tags=["ical"])


@router.post("/properties/{property_id}/links", response_model=ICalLinkOut)
async def create_ical_link(
    property_id: str,
    data: ICalLinkCreate,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    property = await db.get(Property, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    link = ICalLink(property_id=property_id, **data.model_dump())
    db.add(link)
    await db.commit()
    await db.refresh(link)
    return link


@router.get("/properties/{property_id}/links", response_model=list[ICalLinkOut])
async def list_ical_links(
    property_id: str,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ICalLink).where(ICalLink.property_id == property_id))
    return result.scalars().all()


@router.delete("/links/{link_id}")
async def delete_ical_link(
    link_id: str,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    link = await db.get(ICalLink, link_id)
    if not link:
        raise HTTPException(status_code=404, detail="iCal link not found")
    await db.delete(link)
    await db.commit()
    return {"message": "iCal link deleted"}