import type { AiConfig, AnkiConfig, ConfigBackup, WebdavConfig } from "./config";
import type { LookupRequest, WordLookupTask } from "./lookup";
import type { TextEntry } from "./text";
import type { Pronunciation, WordEntry } from "./word";

export type StorageValue = string | number | boolean | object | null;

export interface IStorageAdapter {
  get(key: string): Promise<unknown>;
  set(key: string, value: StorageValue): Promise<void>;
  subscribe(key: string, listener: (value: unknown) => void): () => void;
}

export interface IConfigStore<T> {
  get(): Promise<T>;
  set(config: T): Promise<void>;
  onDidChange(listener: (config: T) => void): () => void;
}

export type IAiConfigService = IConfigStore<AiConfig>;
export type IAnkiConfigService = IConfigStore<AnkiConfig>;
export type IWebdavConfigService = IConfigStore<WebdavConfig>;

export interface IConfigBackupAdapter {
  test(signal?: AbortSignal): Promise<void>;
  read(signal?: AbortSignal): Promise<string>;
  write(content: string, signal?: AbortSignal): Promise<void>;
}

export interface IConfigService {
  readonly anki: IAnkiConfigService;
  readonly ai: IAiConfigService;
  readonly webdav: IWebdavConfigService;
  read(source: Pick<IConfigBackupAdapter, "read">, signal?: AbortSignal): Promise<ConfigBackup>;
  write(target: Pick<IConfigBackupAdapter, "write">, signal?: AbortSignal): Promise<void>;
  restoreBackup(backup: ConfigBackup): Promise<void>;
}

export interface IAiService {
  testConnection(config: AiConfig, signal?: AbortSignal): Promise<void>;
  explain(
    request: LookupRequest,
    signal?: AbortSignal,
    onContent?: (content: string) => void,
  ): Promise<TextEntry>;
  listModels(config: AiConfig, signal?: AbortSignal): Promise<string[]>;
}

export interface IDictionaryService {
  lookup(request: LookupRequest): WordLookupTask[];
}

export interface IDictionaryProvider {
  readonly id: string;
  readonly name: string;
  readonly iconUrl: string;
  readonly supportedLanguages: readonly string[];

  lookup(word: string): Promise<WordEntry | null>;
}

export interface IAudioService {
  canPlay(pronunciation: Pronunciation, index: number): boolean;
  play(pronunciation: Pronunciation, index: number): Promise<void>;
}

export interface IAnkiService {
  createWordNote(entry: WordEntry, context?: string): Promise<void>;
  createTextNote(entry: TextEntry, context?: string): Promise<void>;
  getDecks(config?: AnkiConfig, signal?: AbortSignal): Promise<string[]>;
  syncTemplate(config?: AnkiConfig, signal?: AbortSignal): Promise<void>;
}

export interface IAppServices {
  readonly config: IConfigService;
  readonly dictionary: IDictionaryService;
  readonly anki: IAnkiService;
  readonly ai: IAiService;
  readonly audio: IAudioService;
}
