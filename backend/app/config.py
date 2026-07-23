import json
from typing import Any
from pydantic import model_validator, field_validator, Field, AliasChoices
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    FRONTEND_BASE_URL: str = "http://localhost:3000"
    DATABASE_URL: str = Field(validation_alias=AliasChoices("DATABASE_URL", "TEST_DATABASE_URL"))

    # Access token - short-lived, sent in Authorization header
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 20

    # Refresh token - long-lived, stored in httpOnly cookie
    JWT_REFRESH_SECRET: str | None = None
    JWT_REFRESH_EXPIRE_DAYS: int = 7

    # Cookie settings
    COOKIE_SECURE: bool = False
    COOKIE_DOMAIN: str | None = None

    # Google OAuth - fill these in .env after creating credentials in Google Cloud Console
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:3000/auth/callback/google"

    # Supabase Storage
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_STORAGE_BUCKET: str = "property-images"
    IMAGE_MAX_BYTES: int = 5 * 1024 * 1024

    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://172.28.104.24:3000"]
    SENTRY_DSN: str | None = None
    REDIS_URL: str | None = None
    RESEND_API_KEY: str | None = None
    RESEND_FROM_EMAIL: str = "EarthyStay <noreply@yourdomain.com>"
    FAST2SMS_API_KEY: str | None = None

    RAZORPAY_KEY_ID: str = ""
    RAZORPAY_KEY_SECRET: str = ""

    model_config = {"env_file": ".env"}

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Any) -> list[str]:
        if isinstance(v, str):
            if v.startswith("["):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @model_validator(mode="after")
    def validate_production_settings(self):
        if not self.JWT_REFRESH_SECRET:
            if self.ENVIRONMENT == "production":
                raise ValueError("JWT_REFRESH_SECRET must be set when ENVIRONMENT=production")

            self.JWT_REFRESH_SECRET = self.JWT_SECRET

        if self.ENVIRONMENT != "production":
            return self

        if not self.COOKIE_SECURE:
            raise ValueError("COOKIE_SECURE must be true when ENVIRONMENT=production")

        local_origins = ("localhost", "127.0.0.1", "172.")
        if not self.CORS_ORIGINS or any(origin.startswith("http://") or any(host in origin for host in local_origins) for origin in self.CORS_ORIGINS):
            raise ValueError("CORS_ORIGINS must contain only production HTTPS origins when ENVIRONMENT=production")

        return self


settings = Settings()
