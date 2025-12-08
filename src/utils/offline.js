import { savePending } from "./indexedDb";

export async function saveOfflineRecord(data) {
  const record = {
    id: Date.now(),
    ...data,
  };

  await savePending(record);

  if ("serviceWorker" in navigator && "sync" in navigator.serviceWorker) {
    const reg = await navigator.serviceWorker.ready;
    await reg.sync.register("sync-pending-forms");
  }

  return true;
}
