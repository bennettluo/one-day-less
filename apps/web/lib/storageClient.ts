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

