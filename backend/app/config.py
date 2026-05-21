from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:12345678@172.28.96.1/earthystays"
    JWT_SECRET: str = "LeYLzV74iWt3EN7GU9S78FCjd1uEyzIdAiZZ0hKjxRm"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 20
    CORS_ORIGINS: list[str] = ["http://localhost:3000","http://172.28.104.24:3000"]

    model_config = {"env_file": ".env"}


settings = Settings()