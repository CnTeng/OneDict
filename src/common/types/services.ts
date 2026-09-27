import type { AnkiConfig } from "./config";
import type { Context } from "./context";
import type { DictionaryEntry, DictionaryLookupTask } from "./dict";

export interface IConfigStore<T> {
  get(): Promise<T>;
  set(config: T): Promise<void>;
  update(patch: Partial<T>): Promise<T>;
  reset(): Promise<T>;
  onDidChange(listener: (config: T) => void): () => void;
}

export type IAnkiConfigService = IConfigStore<AnkiConfig>;

export interface IConfigService {
  anki: IAnkiConfigService;
  reset(): Promise<void>;
}

export interface IDictionaryService {
  lookup(word: string, context?: Context): DictionaryLookupTask[];
}

export interface IAudioService {
  play(url: string): Promise<void>;
}

export interface IAnkiService {
  createNote(result: DictionaryEntry): Promise<void>;
  getDecks(): Promise<string[]>;
  syncTemplate(): Promise<void>;
}
