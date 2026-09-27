export type Value = string | number | boolean | object | null;

export interface StorageChange {
  oldValue: unknown;
  newValue: unknown;
}

interface StorageAdapter {
  get(key: string): Promise<unknown>;
  set(key: string, value: Value): Promise<void>;
  remove(key: string): Promise<void>;
  subscribe(key: string, listener: (change: StorageChange) => void): () => void;
}

type ZoteroStorageListener = (event: { key: string; change: StorageChange }) => void;

const zoteroStorageListeners = new Set<ZoteroStorageListener>();

function emitZoteroStorageChange(key: string, change: StorageChange) {
  [...zoteroStorageListeners].forEach((listener) => listener({ key, change }));
}

function getZoteroValue(key: string) {
  const raw = Zotero.Prefs.get(key);
  if (raw == null) return undefined;
  if (typeof raw !== "string") return raw;

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

const zoteroStorage: StorageAdapter = {
  async get(key: string): Promise<unknown> {
    return getZoteroValue(key);
  },

  async set(key: string, value: Value): Promise<void> {
    const oldValue = getZoteroValue(key);
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      Zotero.Prefs.set(key, value);
    } else {
      Zotero.Prefs.set(key, JSON.stringify(value));
    }
    emitZoteroStorageChange(key, { oldValue, newValue: value });
  },

  async remove(key: string): Promise<void> {
    const oldValue = getZoteroValue(key);
    Zotero.Prefs.clear(key);
    emitZoteroStorageChange(key, { oldValue, newValue: undefined });
  },

  subscribe(key: string, listener: (change: StorageChange) => void) {
    const handleChange: ZoteroStorageListener = (event) => {
      if (event.key === key) listener(event.change);
    };
    zoteroStorageListeners.add(handleChange);
    return () => zoteroStorageListeners.delete(handleChange);
  },
};

const chromeStorage: StorageAdapter = {
  async get(key: string): Promise<unknown> {
    const result = await chrome.storage.sync.get(key);
    return result[key];
  },

  async set(key: string, value: Value): Promise<void> {
    await chrome.storage.sync.set({ [key]: value });
  },

  async remove(key: string): Promise<void> {
    await chrome.storage.sync.remove(key);
  },

  subscribe(key: string, listener: (change: StorageChange) => void) {
    const handleChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: chrome.storage.AreaName,
    ) => {
      if (areaName !== "sync" || !(key in changes)) return;
      listener({
        oldValue: changes[key].oldValue,
        newValue: changes[key].newValue,
      });
    };

    chrome.storage.onChanged.addListener(handleChange);
    return () => chrome.storage.onChanged.removeListener(handleChange);
  },
};

const isZotero = typeof Zotero !== "undefined" && typeof Zotero.Prefs !== "undefined";
const storageAdapter = isZotero ? zoteroStorage : chromeStorage;

export const storage = {
  async get(key: string): Promise<unknown> {
    return storageAdapter.get(key);
  },

  async set(key: string, value: Value): Promise<void> {
    await storageAdapter.set(key, value);
  },

  async remove(key: string): Promise<void> {
    await storageAdapter.remove(key);
  },

  subscribe(key: string, listener: (change: StorageChange) => void) {
    return storageAdapter.subscribe(key, listener);
  },
};
