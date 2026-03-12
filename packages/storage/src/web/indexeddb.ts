import type { UserLifeConfig } from "@one-day-less/core";
import type { StoragePort } from "../index";

const DB_NAME = "one-day-less";
const DB_VERSION = 1;
const STORE_NAME = "user_config";
const CONFIG_KEY = "default";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB error"));
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDatabase().then(
    db =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const store = tx.objectStore(STORE_NAME);
        const request = handler(store);

        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error ?? new Error("IndexedDB error"));
      })
  );
}

export class IndexedDbStorage implements StoragePort {
  async loadUserLifeConfig(): Promise<UserLifeConfig | null> {
    const data = await withStore<unknown>("readonly", store =>
      store.get(CONFIG_KEY)
    );
    if (!data) return null;

    return data as UserLifeConfig;
  }

  async saveUserLifeConfig(config: UserLifeConfig): Promise<void> {
    await withStore("readwrite", store => store.put(config, CONFIG_KEY));
  }
}

export function createIndexedDbStorage(): StoragePort {
  return new IndexedDbStorage();
}

