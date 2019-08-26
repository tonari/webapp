'use strict';

self.addEventListener('push', function (event) {
  const title = 'Tonari';

  const data = event.data.json();

  if (!data.lon || !data.lat) {
    return;
  }

  const options = {
    body: 'Please help us out by answering some questions.',
    icon: 'https://tonari.app/logo-square-144.png',
    badge: 'https://tonari.app/logo-badge-72.png',
    data
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  const data = event.notification.data;
  event.notification.close();

  event.waitUntil(
    clients.openWindow(`https://tonari.app/#/now/${data.lat}_${data.lon}/${data.id.sourceId}%20${data.id.originalId}/go`)
  );
});
