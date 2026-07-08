/* Service worker de CoFinder: notificaciones push. */

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: 'CoFinder', body: event.data?.text() ?? '' };
  }
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'CoFinder', {
      body: data.body ?? '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url ?? '/' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? '/';
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windows) => {
        for (const client of windows) {
          if ('focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        return self.clients.openWindow(url);
      }),
  );
});
