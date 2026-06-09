// ─── Service Worker ───────────────────────────────────────────────────────────
// Handles background push notifications and scheduled alarms

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for messages from the main app thread (scheduling a notification)
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  if (type === 'SCHEDULE_NOTIFICATION') {
    const { id, title, body, scheduledAt } = payload;
    const delay = scheduledAt - Date.now();

    if (delay <= 0) {
      // Already past the time — fire immediately
      fireNotification(id, title, body);
      return;
    }

    // Schedule using setTimeout within the SW
    // (For long delays use IndexedDB + periodic sync, but for same-day tasks this is fine)
    setTimeout(() => {
      fireNotification(id, title, body);
    }, delay);
  }

  if (type === 'CANCEL_NOTIFICATION') {
    // Future: cancel scheduled notification by ID
    // (Requires storing timeoutIds in a Map)
  }
});

function fireNotification(id, title, body) {
  self.registration.showNotification(title, {
    body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: String(id),          // Groups / replaces previous alert for same task
    renotify: true,
    requireInteraction: true, // Stays on screen until dismissed (like image 2)
    vibrate: [200, 100, 200, 100, 200],
    actions: [
      { action: 'dismiss', title: '✕ Dismiss' },
      { action: 'complete', title: '✓ Complete' },
    ],
    data: { id, title },
  });
}

// Handle notification click / action buttons
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  notification.close();

  if (event.action === 'complete') {
    // Open the app and focus it
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        for (const client of clients) {
          if ('focus' in client) return client.focus();
        }
        return self.clients.openWindow('/');
      })
    );
  }
});
