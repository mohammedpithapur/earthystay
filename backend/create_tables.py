import asyncio
from app.database import engine, Base
import app.models

async def main():
    async with engine.begin() as conn:
        print("Creating all tables in database...")
        await conn.run_sync(Base.metadata.create_all)
    print("All tables created successfully (0 demo data inserted)!")

if __name__ == "__main__":
    asyncio.run(main())
