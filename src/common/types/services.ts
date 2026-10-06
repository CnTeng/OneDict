import type { TextCard } from "./anki";
import type { AiConfig, AnkiConfig } from "./config";
import type { Context } from "./context";
import type { DictionaryEntry, DictionaryLookupTask, Pronunciation } from "./dict";

export interface IConfigStore<T> {
  get(): Promise<T>;
  set(config: T): Promise<void>;
  onDidChange(listener: (config: T) => void): () => void;
}

export type IAnkiConfigService = IConfigStore<AnkiConfig>;
export type IAiConfigService = IConfigStore<AiConfig>;

export interface AiExplanationRequest {
  word: string;
  context?: Context;
}

export interface IAiService {
  testConnection(config: AiConfig, signal?: AbortSignal): Promise<void>;
  explain(
    request: AiExplanationRequest,
    signal?: AbortSignal,
    onContent?: (content: string) => void,
  ): Promise<string>;
  listModels(config: AiConfig, signal?: AbortSignal): Promise<string[]>;
}

export interface IConfigService {
  anki: IAnkiConfigService;
  ai: IAiConfigService;
}

export interface IDictionaryService {
  lookup(word: string, context?: Context): DictionaryLookupTask[];
}

export interface IAudioService {
  canPlay(pronunciation: Pronunciation, index: number): boolean;
  play(pronunciation: Pronunciation, index: number): Promise<void>;
}

export interface IAnkiService {
  createNote(result: DictionaryEntry): Promise<void>;
  createTextNote(card: TextCard): Promise<void>;
  getDecks(config?: AnkiConfig, signal?: AbortSignal): Promise<string[]>;
  syncTemplate(config?: AnkiConfig, signal?: AbortSignal): Promise<void>;
}
