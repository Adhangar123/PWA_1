import { savePending } from "./indexedDb";

export async function saveOfflineRecord(data) {
  // 🔥 IndexedDB me save
  await savePending(data);

  // 🔄 Background sync register
  if ("serviceWorker" in navigator && "SyncManager" in window) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register("sync-pending-forms");
      console.log("🔄 Background sync registered");
    } catch (err) {
      console.warn("⚠ Sync registration failed", err);
    }
  }
}
