// EarthyStay Service Worker — handles Web Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch {
    data = { title: 'EarthyStay', body: event.data.text() };
  }

  const title = data.title || 'EarthyStay';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/logo.svg',
    badge: '/logo.svg',
    tag: 'earthystay-booking',
    renotify: true,
    data: { url: data.url || '/admin' },
    actions: [
      { action: 'open', title: 'Open Admin' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/admin';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If admin tab is already open, focus it
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
