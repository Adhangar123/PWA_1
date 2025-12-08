import { openDB } from "idb";

const DB_NAME = "farmer-db";
const STORE = "pending";

// Open or create IndexedDB
export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("by-status", "status");
      }
    },
  });
}

// Save record offline
export async function saveOfflineRecord(data) {
  const db = await getDB();
  await db.add(STORE, { ...data, status: "pending", createdAt: Date.now() });
}

// Get all pending records
export async function getPending() {
  const db = await getDB();
  return db.getAllFromIndex(STORE, "by-status", "pending");
}
