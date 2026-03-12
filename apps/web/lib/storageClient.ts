import type { UserLifeConfig } from "@one-day-less/core";
import { createIndexedDbStorage } from "@one-day-less/storage";

export async function loadUserLifeConfigClient(): Promise<UserLifeConfig | null> {
  if (typeof window === "undefined") return null;
  const storage = createIndexedDbStorage();
  try {
    return await storage.loadUserLifeConfig();
  } catch {
    return null;
  }
}

export async function saveUserLifeConfigClient(
  config: UserLifeConfig
): Promise<void> {
  if (typeof window === "undefined") return;
  const storage = createIndexedDbStorage();
  await storage.saveUserLifeConfig(config);
}

export async function resetUserLifeConfigClient(): Promise<void> {
  if (typeof window === "undefined") return;
  await new Promise<void>((resolve, reject) => {
    const request = window.indexedDB.deleteDatabase("one-day-less");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error ?? new Error("IndexedDB error"));
    request.onblocked = () => resolve();
  });
}

