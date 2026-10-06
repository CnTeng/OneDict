import type { IStorageAdapter, StorageValue } from "@common/types";

export class BrowserStorage implements IStorageAdapter {
  async get(key: string): Promise<unknown> {
    const result = await chrome.storage.sync.get(key);
    return result[key];
  }

  async set(key: string, value: StorageValue): Promise<void> {
    return chrome.storage.sync.set({ [key]: value });
  }

  subscribe(key: string, listener: (value: unknown) => void): () => void {
    const handleChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: chrome.storage.AreaName,
    ) => {
      if (areaName !== "sync" || !(key in changes)) return;
      listener(changes[key].newValue);
    };

    chrome.storage.onChanged.addListener(handleChange);
    return () => chrome.storage.onChanged.removeListener(handleChange);
  }
}
