/* eslint-disable no-restricted-globals */

// Cache name
const CACHE_NAME = "farmer-app-cache-v1";

// Files to cache
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Caching app shell");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH (Network → Fallback to cache)
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// BACKGROUND SYNC
self.addEventListener("sync", async (event) => {
  if (event.tag === "sync-pending-forms") {
    console.log("Syncing pending offline forms...");

    const db = await openDB();
    const all = await db.getAll("pending");

    for (let item of all) {
      try {
        await fetch("https://your-api.com/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });

        await db.delete("pending", item.id);
      } catch (err) {
        console.log("Retry later...");
      }
    }

    self.clients.matchAll().then(clients => {
      clients.forEach(client =>
        client.postMessage({ type: "SYNC_PENDING", message: "Pending data synced!" })
      );
    });
  }
});

// IndexedDB for SW
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("farmer-db", 1);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("pending")) {
        db.createObjectStore("pending", { keyPath: "id" });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = reject;
  });
}
