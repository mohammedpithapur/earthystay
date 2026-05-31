import logging

import httpx

from app.config import settings


logger = logging.getLogger("earthystay.email")


async def send_password_reset_email(to_email: str, reset_url: str) -> bool:
    if not settings.RESEND_API_KEY:
        if settings.ENVIRONMENT == "development":
            logger.info("Password reset link for %s: %s", to_email, reset_url)
            return True
        logger.error("RESEND_API_KEY is not configured")
        return False

    async with httpx.AsyncClient(timeout=10) as client:
        response = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.RESEND_API_KEY}"},
            json={
                "from": settings.RESEND_FROM_EMAIL,
                "to": [to_email],
                "subject": "Reset your EarthyStay password",
                "html": (
                    "<p>Use this link to reset your EarthyStay password.</p>"
                    f'<p><a href="{reset_url}">Reset password</a></p>'
                    "<p>This link expires in 30 minutes.</p>"
                ),
            },
        )
    if response.is_success:
        return True
    logger.error("Resend password reset email failed: %s %s", response.status_code, response.text)
    return False
