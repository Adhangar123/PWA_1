/* eslint-disable no-restricted-globals */
importScripts("https://cdn.jsdelivr.net/npm/idb/build/iife/index-min.js");

const CACHE_NAME = "farmer-app-cache-v1";
const FILES_TO_CACHE = ["/", "/index.html", "/manifest.json"];

const DB_NAME = "farmer-db";
const STORE = "pending";
const API_URL = "https://new-survey-zh0e.onrender.com/api/submit";

/* Install */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

/* Activate */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) =>
          key !== CACHE_NAME ? caches.delete(key) : null
        )
      )
    )
  );
  self.clients.claim();
});

/* Fetch – NETWORK FIRST */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Don’t cache POST (form uploads)
  if (req.method === "POST") {
    return event.respondWith(fetch(req).catch(() => new Response(null)));
  }

  event.respondWith(
    fetch(req).catch(() => caches.match(req))
  );
});

/* Open DB */
function openDBLocal() {
  return idb.openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    },
  });
}

/* Background Sync */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-pending-forms") {
    event.waitUntil(syncPending());
  }
});

async function syncPending() {
  const db = await openDBLocal();
  const store = db.transaction(STORE, "readwrite").objectStore(STORE);
  const all = await store.getAll();

  if (!all.length) return;

  for (const item of all) {
    try {
      const fd = new FormData();

      Object.keys(item.formFields).forEach((key) => {
        fd.append(key, item.formFields[key]);
      });

      if (item.photo) fd.append("photo", item.photo);
      if (item.aadharCard) fd.append("aadharCard", item.aadharCard);
      if (item.agreement) fd.append("agreement", item.agreement);

      item.points.forEach((p) => {
        fd.append("latitude[]", p.lat);
        fd.append("longitude[]", p.lng);
      });

      const res = await fetch(API_URL, { method: "POST", body: fd });

      if (res.ok) {
        await store.delete(item.id);
        notify({ type: "SYNC_SUCCESS", id: item.id });
      }
    } catch (e) {
      console.log("Sync failed", e);
    }
  }
}

function notify(msg) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => client.postMessage(msg));
  });
}
