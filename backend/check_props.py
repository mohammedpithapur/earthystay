import asyncio
from app.database import async_session
from sqlalchemy import text

async def check():
    async with async_session() as s:
        # Check property count
        r = await s.execute(text("SELECT COUNT(*) FROM properties"))
        count = r.scalar()
        print(f"Total properties in DB: {count}")

        if count > 0:
            # Sample a few
            r = await s.execute(text("""
                SELECT id, name, is_active, price_per_night,
                       (SELECT COUNT(*) FROM property_images WHERE property_id = properties.id) AS image_count
                FROM properties
                LIMIT 5
            """))
            print("\nSample properties:")
            for row in r:
                print(f"  id={str(row[0])[:8]}... name={row[1]!r} active={row[2]} price={row[3]} images={row[4]}")

        # Check images
        r2 = await s.execute(text("SELECT COUNT(*) FROM property_images"))
        print(f"\nTotal images: {r2.scalar()}")

asyncio.run(check())
