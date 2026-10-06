import type { StorageAdapter } from "@services/config/storage";

function parseZoteroValue(raw: unknown): unknown {
  if (raw == null) return undefined;
  if (typeof raw !== "string") return raw;

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

export const zoteroStorage: StorageAdapter = {
  async get(key: string): Promise<unknown> {
    return parseZoteroValue(Zotero.Prefs.get(key));
  },

  async set(key, value): Promise<void> {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      Zotero.Prefs.set(key, value);
    } else {
      Zotero.Prefs.set(key, JSON.stringify(value));
    }
  },

  subscribe(key, listener) {
    const observer = Zotero.Prefs.registerObserver(key, (value: unknown) =>
      listener(parseZoteroValue(value)),
    );
    return () => Zotero.Prefs.unregisterObserver(observer);
  },
};
