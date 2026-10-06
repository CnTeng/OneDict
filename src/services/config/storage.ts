type Value = string | number | boolean | object | null;

export interface StorageAdapter {
  get(key: string): Promise<unknown>;
  set(key: string, value: Value): Promise<void>;
  subscribe(key: string, listener: (value: unknown) => void): () => void;
}
