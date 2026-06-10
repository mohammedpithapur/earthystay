import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_

from app.database import get_db
from app.dependencies import get_admin
from app.models.user import User
from app.models.event import EventRequest, EventStatus
from app.schemas.event import EventRequestCreate, EventRequestUpdate, EventRequestOut


router = APIRouter(prefix="/events", tags=["events"])


@router.post("", response_model=EventRequestOut)
async def create_event_request(
    data: EventRequestCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Public endpoint: allows guest users or anonymous visitors to submit event inquiries.
    """
    event_req = EventRequest(
        destination=data.destination,
        hotel=data.hotel,
        nature_of_event=data.nature_of_event,
        event_start_date=data.event_start_date,
        event_end_date=data.event_end_date,
        no_of_guests=data.no_of_guests,
        requires_rooms=data.requires_rooms,
        no_of_rooms=data.no_of_rooms if data.requires_rooms else 0,
        additional_details=data.additional_details,
        name=data.name,
        phone=data.phone,
        email=str(data.email),
        status=EventStatus.pending,
    )
    db.add(event_req)
    await db.commit()
    await db.refresh(event_req)
    return event_req


@router.get("/admin/all", response_model=list[EventRequestOut])
async def list_admin_events(
    status: EventStatus | None = Query(None),
    search: str | None = Query(None),
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Admin-only endpoint: lists all event inquiries with optional search and status filter.
    """
    query = select(EventRequest)
    if status:
        query = query.where(EventRequest.status == status)
    if search:
        query = query.where(
            or_(
                EventRequest.name.ilike(f"%{search}%"),
                EventRequest.email.ilike(f"%{search}%"),
                EventRequest.phone.ilike(f"%{search}%"),
                EventRequest.destination.ilike(f"%{search}%"),
                EventRequest.hotel.ilike(f"%{search}%"),
            )
        )
    query = query.order_by(EventRequest.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.patch("/admin/{event_id}", response_model=EventRequestOut)
async def update_event_request_status(
    event_id: uuid.UUID,
    data: EventRequestUpdate,
    admin: User = Depends(get_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Admin-only endpoint: updates the status of an event inquiry.
    """
    event_req = await db.get(EventRequest, event_id)
    if not event_req:
        raise HTTPException(status_code=404, detail="Event request not found")

    event_req.status = data.status
    await db.commit()
    await db.refresh(event_req)
    return event_req
