from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.dependencies import get_admin
from app.models.user import User
from app.models.property import Property
from app.models.booking import Booking, BookingStatus
from app.models.ical import ICalLink
from app.schemas.ical import ICalLinkCreate, ICalLinkOut
from app.services.booking import auto_cleanup_expired_bookings

router = APIRouter(prefix="/ical", tags=["ical"])


# ── Helpers ────────────────────────────────────────────────────────────────────

def _ics_datetime(dt: datetime) -> str:
    """Format a date/datetime as iCal YYYYMMDD or YYYYMMDDTHHMMSSZ."""
    if hasattr(dt, "hour"):
        return dt.strftime("%Y%m%dT%H%M%SZ")
    return dt.strftime("%Y%m%d")


def _ics_date(d) -> str:
    """Format a date as YYYYMMDD."""
    return d.strftime("%Y%m%d")


def _fold_line(line: str) -> str:
    """RFC 5545 line folding at 75 octets."""
    if len(line.encode()) <= 75:
        return line
    result = []
    while line:
        chunk = line[:75]
        line = line[75:]
        result.append(chunk)
    return "\r\n ".join(result)


def build_ical(property_name: str, bookings: list[Booking]) -> str:
    now = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//EarthyStay//EarthyStay//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        f"X-WR-CALNAME:{property_name}",
        "X-WR-TIMEZONE:UTC",
    ]
    for booking in bookings:
        uid = f"{booking.id}@earthystay.com"
        summary = f"Booking: {booking.guest_name or 'Guest'}"
        desc = (
            f"Ref: {booking.booking_ref}\\n"
            f"Guests: {booking.guests}\\n"
            f"Status: {booking.status.value}"
        )
        lines += [
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{now}",
            f"DTSTART;VALUE=DATE:{_ics_date(booking.check_in)}",
            f"DTEND;VALUE=DATE:{_ics_date(booking.check_out)}",
            _fold_line(f"SUMMARY:{summary}"),
            _fold_line(f"DESCRIPTION:{desc}"),
            "STATUS:CONFIRMED",
            "END:VEVENT",
        ]
    lines.append("END:VCALENDAR")
    return "\r\n".join(lines) + "\r\n"


# ── Export ─────────────────────────────────────────────────────────────────────

@router.get("/export/{property_id}")
async def export_ical(
    property_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Public endpoint — returns a .ics file of all confirmed bookings."""
    await auto_cleanup_expired_bookings(db)
    property = await db.get(Property, property_id)
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")

    result = await db.execute(
        select(Booking).where(
            Booking.property_id == property_id,
            Booking.status.in_([BookingStatus.confirmed, BookingStatus.pending]),
            Booking.is_shadow_block == False,
        )
    )
    bookings = result.scalars().all()
    ical_content = build_ical(property.name, bookings)

    return Response(
        content=ical_content,
        media_type="text/calendar; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{property_id}.ics"',
            "Cache-Control": "no-cache",
        },
    )


# ── Import links CRUD ──────────────────────────────────────────────────────────

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
    link = ICalLink(
        property_id=property_id,
        calendar_name=data.calendar_name,
        ical_url=data.ical_url,
        direction=data.direction,
    )
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