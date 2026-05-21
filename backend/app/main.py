from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, properties, bookings, users, admin, ical, reviews



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (use alembic in production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="Earthy Stays API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(bookings.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(ical.router)
app.include_router(reviews.router)


@app.get("/")
async def root():
    return {"message": "Earthy Stays API is running"}

