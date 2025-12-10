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

export async function savePending(r) {
  const db = await getDB();
  await db.put(STORE, r);
}

export async function getPending() {
  const db = await getDB();
  return db.getAll(STORE);
}

export async function deletePending(id) {
  const db = await getDB();
  return db.delete(STORE, id);
}
