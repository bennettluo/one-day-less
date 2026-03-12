import AsyncStorage from "@react-native-async-storage/async-storage";
import type { UserLifeConfig } from "@one-day-less/core";
import type { StoragePort } from "../index";

const CONFIG_KEY = "one_day_less_user_config";

export class AsyncStorageStorage implements StoragePort {
  async loadUserLifeConfig(): Promise<UserLifeConfig | null> {
    const json = await AsyncStorage.getItem(CONFIG_KEY);
    if (!json) return null;
    try {
      return JSON.parse(json) as UserLifeConfig;
    } catch {
      return null;
    }
  }

  async saveUserLifeConfig(config: UserLifeConfig): Promise<void> {
    await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  }
}

export function createAsyncStorageStorage(): StoragePort {
  return new AsyncStorageStorage();
}

