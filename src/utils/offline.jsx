import { openDB } from "idb";

const DB_NAME = "farmer-db";
const STORE = "pending";

// Create DB
export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        const s = db.createObjectStore(STORE, { keyPath: "id" });
        s.createIndex("by-status", "status");
      }
    },
  });
}

// Save offline record
export async function saveOfflineRecord(record) {
  const db = await getDB();
  await db.put(STORE, { ...record, status: "pending" });

  // Register Background Sync
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register("sync-farmers");
    } catch (e) {
      console.warn("Background Sync Not Available:", e);
    }
  }
}

export async function getPending() {
  const db = await getDB();
  try {
    return await db.getAllFromIndex(STORE, "by-status", "pending");
  } catch {
    return await db.getAll(STORE);
  }
}

export async function markSynced(id) {
  const db = await getDB();
  const item = await db.get(STORE, id);
  if (item) {
    item.status = "synced";
    await db.put(STORE, item);
  }
}
