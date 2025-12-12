import { savePending } from "./indexedDb";

export async function saveOfflineRecord(data) {
  await savePending(data);

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.sync.register("sync-pending-forms");
    } catch (err) {
      console.log("⚠ Sync registration failed", err);
    }
  }
}
