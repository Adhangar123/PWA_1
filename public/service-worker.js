/* eslint-disable no-restricted-globals */
importScripts("https://cdn.jsdelivr.net/npm/idb/build/iife/index-min.js");

const CACHE_NAME = "farmer-app-cache-v2";
const FILES_TO_CACHE = ["/", "/index.html", "/manifest.json"];

const DB_NAME = "farmer-db";
const STORE = "pending";
const API_URL =
  "https://backend-survey-13977221722.asia-south2.run.app/api/submit";

/* INSTALL */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

/* ACTIVATE */
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

/* FETCH – NETWORK FIRST */
self.addEventListener("fetch", (event) => {
  if (event.request.method === "POST") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

/* OPEN INDEXED DB */
function openDBLocal() {
  return idb.openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    },
  });
}

/* BACKGROUND SYNC */
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-pending-forms") {
    event.waitUntil(syncPending());
  }
});

async function syncPending() {
  const db = await openDBLocal();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);

  const all = await store.getAll();
  if (!all.length) return;

  for (const item of all) {
    try {
      const fd = new FormData();

      /* FORM FIELDS (same as OnboardForm finalSubmit) */
      Object.keys(item).forEach((key) => {
        if (
          [
            "id",
            "points",
            "farmerPhoto",
            "farmerID",
            "agreement",
            "createdAt",
          ].includes(key)
        )
          return;

        fd.append(key, item[key] ?? "");
      });

      /* LAT / LNG */
      fd.append("latitude", item.latitude || "");
      fd.append("longitude", item.longitude || "");

      /* MAP POINTS */
      if (Array.isArray(item.points)) {
        item.points.forEach((p, idx) => {
          fd.append(`points[${idx}][lat]`, p.lat);
          fd.append(`points[${idx}][lng]`, p.lng);
        });
      }

      /* FILES */
      if (item.farmerPhoto) fd.append("photo", item.farmerPhoto);
      if (item.farmerID) fd.append("aadharCard", item.farmerID);
      if (item.agreement) fd.append("agreement", item.agreement);

      const res = await fetch(API_URL, {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        await store.delete(item.id);
        notifyClient({ type: "SYNC_SUCCESS", id: item.id });
      }
    } catch (err) {
      console.error("❌ Sync failed", err);
    }
  }
}

/* NOTIFY UI */
function notifyClient(message) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => client.postMessage(message));
  });
}
