import os
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool, AsyncAdaptedQueuePool

from app.config import settings


def utc_now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


# On AWS Lambda the execution environment is frozen between invocations.
# Using NullPool means each request gets a fresh connection that is closed
# immediately after use — no stale connections, no pool exhaustion.
# On a traditional server (local dev / Docker) we use AsyncAdaptedQueuePool for performance.
_IS_LAMBDA = os.environ.get("AWS_LAMBDA_FUNCTION_NAME") is not None

engine = create_async_engine(
    settings.DATABASE_URL,
    poolclass=NullPool if _IS_LAMBDA else AsyncAdaptedQueuePool,
    connect_args={
        "statement_cache_size": 0,
        "server_settings": {"search_path": "main, public"},
    },
    echo=False,
    **({} if _IS_LAMBDA else {
        "pool_size": 15,
        "max_overflow": 25,
        "pool_timeout": 30,
        "pool_recycle": 1800,
        "pool_pre_ping": False,
    })
)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()
