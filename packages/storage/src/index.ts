import type { UserLifeConfig } from "@one-day-less/core";

export interface StoragePort {
  loadUserLifeConfig(): Promise<UserLifeConfig | null>;
  saveUserLifeConfig(config: UserLifeConfig): Promise<void>;
}

export interface StorageFactory {
  createStorage(): StoragePort;
}

export * from "./web/indexeddb";
export * from "./rn/asyncStorage";
export * from "./wechat/storage";

