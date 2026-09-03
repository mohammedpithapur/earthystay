/**
 * Browser Web Push utilities.
 * Used by the PushSubscribeButton component.
 */

import { buildApiUrl } from '@/lib/api';

/** Converts a base64url string to Uint8Array (required for applicationServerKey). */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

/** Register the service worker (idempotent — safe to call multiple times). */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null;
  try {
    return await navigator.serviceWorker.register('/sw.js', { scope: '/' });
  } catch (err) {
    console.error('[Push] SW registration failed:', err);
    return null;
  }
}

/** Subscribe to push and POST the subscription to the backend. */
export async function subscribeToPush(token: string): Promise<boolean> {
  try {
    // 1. Fetch VAPID public key from backend
    const keyRes = await fetch(buildApiUrl('/push/vapid-public-key'));
    if (!keyRes.ok) throw new Error('Failed to fetch VAPID public key');
    const { public_key } = await keyRes.json();

    // 2. Register service worker
    const reg = await registerServiceWorker();
    if (!reg) throw new Error('Service worker not supported');

    // Wait for SW to be ready
    await navigator.serviceWorker.ready;

    // 3. Subscribe
    const applicationServerKey = urlBase64ToUint8Array(public_key) as unknown as BufferSource;
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    const json = subscription.toJSON();
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;
    if (!p256dh || !auth) throw new Error('Missing subscription keys');

    // 4. Send to backend
    const res = await fetch(buildApiUrl('/push/subscribe'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint: subscription.endpoint, p256dh, auth }),
    });

    return res.ok;
  } catch (err) {
    console.error('[Push] Subscribe error:', err);
    return false;
  }
}

/** Unsubscribe from push and notify the backend. */
export async function unsubscribeFromPush(token: string): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (!subscription) return true;

    const json = subscription.toJSON();
    const p256dh = json.keys?.p256dh ?? '';
    const auth = json.keys?.auth ?? '';

    await fetch(buildApiUrl('/push/unsubscribe'), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint: subscription.endpoint, p256dh, auth }),
    });

    await subscription.unsubscribe();
    return true;
  } catch (err) {
    console.error('[Push] Unsubscribe error:', err);
    return false;
  }
}

/** Ensure current browser push subscription is synced with backend for the current user. */
export async function syncSubscription(token: string): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return false;
    const json = sub.toJSON();
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;
    if (!p256dh || !auth) return false;

    const res = await fetch(buildApiUrl('/push/subscribe'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint: sub.endpoint, p256dh, auth }),
    });
    return res.ok;
  } catch (err) {
    console.error('[Push] Sync subscription error:', err);
    return false;
  }
}

/** Send a test notification to the current user's subscribed devices. */
export async function sendTestPush(token: string): Promise<boolean> {
  try {
    // Ensure subscription is synced to backend DB first
    await syncSubscription(token);

    const res = await fetch(buildApiUrl('/push/test'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({}));
    return (data.devices_notified ?? 0) > 0;
  } catch (err) {
    console.error('[Push] Test push error:', err);
    return false;
  }
}

/** Check if the browser is currently subscribed. */
export async function isSubscribed(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return sub !== null;
  } catch {
    return false;
  }
}

/** Check if push is supported in this browser. */
export function isPushSupported(): boolean {
  return typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;
}
