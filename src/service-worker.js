/* eslint-disable no-restricted-globals */

// ---- Workbox imports ----
import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { skipWaiting } from 'workbox-core';

skipWaiting();
clientsClaim();

// 🔥 यह लाइन Workbox build के लिए जरूरी है
precacheAndRoute(self.__WB_MANIFEST);

// ---- Your Background Sync Listener ----
self.addEventListener('sync', event => {
  if (event.tag === 'sync-farmers') {
    event.waitUntil(notifyClientsToSync());
  }
});

async function notifyClientsToSync() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  for (const client of clients) {
    client.postMessage({ type: 'SYNC_PENDING' });
  }
}
