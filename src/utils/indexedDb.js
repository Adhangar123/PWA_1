import { openDB } from "idb";

const DB_NAME = "farmer-db";
const STORE = "pending";

// Create / Open DB
export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        const s = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        s.createIndex("by-status", "status");
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
  return await db.getAllFromIndex(STORE, "by-status", "pending");
}
