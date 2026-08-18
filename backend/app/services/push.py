"""
Web Push notification service using pywebpush + VAPID.
Sends push to all stored subscriptions (or filtered by user_id list).
"""
import json
import logging

from pywebpush import webpush, WebPushException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.push_subscription import PushSubscription

logger = logging.getLogger("earthystay.push")


async def send_push_to_all(
    db: AsyncSession,
    title: str,
    body: str,
    url: str = "/admin",
    icon: str = "/logo.svg",
) -> None:
    """Send a push notification to every stored subscription."""
    if not settings.VAPID_PRIVATE_KEY or not settings.VAPID_PUBLIC_KEY:
        logger.warning("VAPID keys not configured — skipping push notification")
        return

    subs = (await db.execute(select(PushSubscription))).scalars().all()
    if not subs:
        logger.info("No push subscriptions found — skipping")
        return

    payload = json.dumps({
        "title": title,
        "body": body,
        "url": url,
        "icon": icon,
    })

    vapid_claims = {"sub": f"mailto:{settings.VAPID_CONTACT_EMAIL}"}

    dead_endpoints: list[str] = []
    for sub in subs:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
                },
                data=payload,
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims=vapid_claims,
            )
        except WebPushException as exc:
            status = exc.response.status_code if exc.response else 0
            logger.error("Push failed for %s (status=%s): %s", sub.endpoint[:60], status, exc)
            # 404 / 410 = subscription expired, clean it up
            if status in (404, 410):
                dead_endpoints.append(sub.endpoint)
        except Exception as exc:
            logger.error("Unexpected push error: %s", exc)

    # Clean up dead subscriptions
    for endpoint in dead_endpoints:
        dead = await db.scalar(select(PushSubscription).where(PushSubscription.endpoint == endpoint))
        if dead:
            await db.delete(dead)
    if dead_endpoints:
        await db.commit()
