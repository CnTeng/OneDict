import type { StorageAdapter } from "@services/config/storage";

export const browserStorage: StorageAdapter = {
  async get(key: string): Promise<unknown> {
    const result = await chrome.storage.sync.get(key);
    return result[key];
  },

  async set(key, value): Promise<void> {
    await chrome.storage.sync.set({ [key]: value });
  },

  subscribe(key, listener) {
    const handleChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: chrome.storage.AreaName,
    ) => {
      if (areaName !== "sync" || !(key in changes)) return;
      listener(changes[key].newValue);
    };

    chrome.storage.onChanged.addListener(handleChange);
    return () => chrome.storage.onChanged.removeListener(handleChange);
  },
};
