import asyncio

from app.database import async_session
from app.models.user import User, UserRole
from app.services.auth import hash_password


async def seed():
    async with async_session() as db:
        admin = User(
            email="admin@earthystay.com",
            password_hash=hash_password("admin123"),
            full_name="Admin",
            phone=None,
            role=UserRole.admin,
        )
        db.add(admin)
        await db.commit()
        print("Admin user seeded: admin@earthystay.com / admin123")


if __name__ == "__main__":
    asyncio.run(seed())