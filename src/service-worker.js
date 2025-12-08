/* global self */
import { openDB } from "idb";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-farmers") {
    event.waitUntil(syncPendingFarmers());
  }
});

async function syncPendingFarmers() {
  const db = await openDB("farmer-db", 1);
  const all = await db.getAll("pending");

  for (const item of all) {
    if (item.status === "synced") continue;

    try {
      const formData = new FormData();

      // append normal fields
      Object.keys(item).forEach((key) => {
        if (
          !["id", "status", "photo", "aadharCard", "agreement", "latitude", "longitude"].includes(key)
        ) {
          formData.append(key, item[key]);
        }
      });

      // file uploads
      if (item.photo) formData.append("photo", item.photo, "photo.jpg");
      if (item.aadharCard) formData.append("aadharCard", item.aadharCard, "aadhaar.jpg");
      if (item.agreement) formData.append("agreement", item.agreement, "agreement.jpg");

      // GPS arrays
      if (Array.isArray(item.latitude)) item.latitude.forEach((lat) => formData.append("latitude[]", lat));
      if (Array.isArray(item.longitude)) item.longitude.forEach((lng) => formData.append("longitude[]", lng));

      // POST to API
      const res = await fetch("https://new-survey-zh0e.onrender.com/api/submit", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        item.status = "synced";
        await db.put("pending", item);
        notifyClients("Record Synced Successfully");
      }
    } catch (err) {
      console.error("Sync Error:", err);
    }
  }
}

function notifyClients(msg) {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ type: "SYNC_PENDING", message: msg });
    });
  });
}
