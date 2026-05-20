from datetime import date

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import Booking, BookingStatus
from app.models.property import Property
from app.models.property_group import PropertyGroupMember


def calculate_pricing(property: Property, check_in: date, check_out: date, pets: int) -> dict:
    nights_diff = check_out - check_in
    nights = max(0, nights_diff.days)
    base_price = property.price_per_night * nights
    pet_charge = pets * nights * property.pet_charge_per_night
    total = base_price + property.cleaning_fee + pet_charge
    return {
        "nights": nights,
        "base_price": base_price,
        "cleaning_fee": property.cleaning_fee,
        "pet_charge": pet_charge,
        "total": total,
    }


async def apply_group_blocking(db: AsyncSession, booking: Booking, commit: bool = True) -> None:
    if booking.is_shadow_block:
        return

    member = await db.scalar(
        select(PropertyGroupMember).where(PropertyGroupMember.property_id == booking.property_id)
    )
    if not member:
        return

    if member.is_whole_property:
        target_query = select(PropertyGroupMember).where(
            PropertyGroupMember.group_id == member.group_id,
            PropertyGroupMember.is_whole_property == False,
        )
    else:
        target_query = select(PropertyGroupMember).where(
            PropertyGroupMember.group_id == member.group_id,
            PropertyGroupMember.is_whole_property == True,
        )

    result = await db.execute(target_query)
    targets = result.scalars().all()
    if not targets:
        return

    for target in targets:
        if target.property_id == booking.property_id:
            continue
        shadow = Booking(
            property_id=target.property_id,
            guest_id=booking.guest_id,
            check_in=booking.check_in,
            check_out=booking.check_out,
            guests=booking.guests,
            pets=booking.pets,
            nights=booking.nights,
            base_price=0,
            cleaning_fee=0,
            pet_charge=0,
            total=0,
            status=BookingStatus.confirmed,
            guest_name=booking.guest_name,
            guest_email=booking.guest_email,
            guest_phone=booking.guest_phone,
            is_shadow_block=True,
            parent_booking_id=booking.id,
        )
        db.add(shadow)

    if commit:
        await db.commit()


async def remove_shadow_blocks(db: AsyncSession, booking: Booking, commit: bool = True) -> None:
    if booking.is_shadow_block:
        return

    await db.execute(
        delete(Booking).where(Booking.parent_booking_id == booking.id)
    )
    if commit:
        await db.commit()