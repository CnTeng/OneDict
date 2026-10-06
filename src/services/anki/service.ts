import type {
  AnkiConfig,
  DictionaryEntry,
  IAnkiConfigService,
  IAnkiService,
  TextCard,
} from "@common/types";
import { type AnkiClient, createAnkiClient } from "./index";

export class AnkiService implements IAnkiService {
  constructor(private readonly config: IAnkiConfigService) {}

  private async getAnki(config?: AnkiConfig, signal?: AbortSignal): Promise<AnkiClient> {
    return createAnkiClient((config ?? (await this.config.get())).connectUrl, signal);
  }

  async createNote(result: DictionaryEntry): Promise<void> {
    const config = await this.getNoteConfig();
    await createAnkiClient(config.connectUrl).createNote(config.deck, result);
  }

  async createTextNote(card: TextCard): Promise<void> {
    const config = await this.getNoteConfig();
    await createAnkiClient(config.connectUrl).createTextNote(config.deck, card);
  }

  private async getNoteConfig(): Promise<AnkiConfig> {
    const config = await this.config.get();
    if (!config.deck) throw new Error("Choose an Anki deck in Settings before adding cards.");
    return config;
  }

  async getDecks(config?: AnkiConfig, signal?: AbortSignal): Promise<string[]> {
    return this.getAnki(config, signal).then((anki) => anki.getDecks());
  }

  async syncTemplate(config?: AnkiConfig, signal?: AbortSignal): Promise<void> {
    await (await this.getAnki(config, signal)).syncTemplate();
  }
}
