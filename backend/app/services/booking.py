from datetime import date

from app.models.property import Property


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