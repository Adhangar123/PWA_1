import { openDB } from "idb";

const DB_NAME = "farmer-db";
const STORE = "pending";

export function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    },
  });
}

// 🔹 Save offline record
export async function savePending(record) {
  const db = await getDB();
  await db.put(STORE, record);
}

// 🔹 Get all pending records
export async function getPending() {
  const db = await getDB();
  return db.getAll(STORE);
}

// 🔹 Delete synced record
export async function deletePending(id) {
  const db = await getDB();
  await db.delete(STORE, id);
}
