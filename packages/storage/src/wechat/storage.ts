import type { UserLifeConfig } from "@one-day-less/core";
import type { StoragePort } from "../index";

declare const wx: {
  getStorage(options: {
    key: string;
    success?: (res: { data: unknown }) => void;
    fail?: () => void;
  }): void;
  setStorage(options: {
    key: string;
    data: unknown;
    success?: () => void;
    fail?: () => void;
  }): void;
};

const CONFIG_KEY = "one_day_less_user_config";

export class WechatStorage implements StoragePort {
  loadUserLifeConfig(): Promise<UserLifeConfig | null> {
    return new Promise(resolve => {
      if (typeof wx === "undefined") {
        resolve(null);
        return;
      }
      wx.getStorage({
        key: CONFIG_KEY,
        success(res) {
          resolve(res.data as UserLifeConfig);
        },
        fail() {
          resolve(null);
        }
      });
    });
  }

  saveUserLifeConfig(config: UserLifeConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof wx === "undefined") {
        resolve();
        return;
      }
      wx.setStorage({
        key: CONFIG_KEY,
        data: config,
        success() {
          resolve();
        },
        fail() {
          reject(new Error("Failed to save config to WeChat storage"));
        }
      });
    });
  }
}

export function createWechatStorage(): StoragePort {
  return new WechatStorage();
}

