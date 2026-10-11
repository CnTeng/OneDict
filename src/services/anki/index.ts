import { t } from "@common/i18n";
import type {
  AnkiConfig,
  IAnkiConfigService,
  IAnkiService,
  TextEntry,
  WordEntry,
} from "@common/types";
import { AnkiClient } from "./client";

export class AnkiService implements IAnkiService {
  constructor(private readonly config: IAnkiConfigService) {}

  private async getAnki(config?: AnkiConfig, signal?: AbortSignal): Promise<AnkiClient> {
    return new AnkiClient((config ?? (await this.config.get())).connectUrl, signal);
  }

  createWordNote(entry: WordEntry, context?: string): Promise<void> {
    return this.getNoteConfig().then((config) =>
      new AnkiClient(config.connectUrl).createWordNote(config.deck, entry, context),
    );
  }

  createTextNote(entry: TextEntry, context?: string): Promise<void> {
    return this.getNoteConfig().then((config) =>
      new AnkiClient(config.connectUrl).createTextNote(config.deck, entry, context),
    );
  }

  private getNoteConfig(): Promise<AnkiConfig> {
    return this.config.get().then((config) => {
      if (!config.deck) throw new Error(t("errors.ankiDeck"));
      return config;
    });
  }

  getDecks(config?: AnkiConfig, signal?: AbortSignal): Promise<string[]> {
    return this.getAnki(config, signal).then((anki) => anki.getDecks());
  }

  syncTemplate(config?: AnkiConfig, signal?: AbortSignal): Promise<void> {
    return this.getAnki(config, signal).then((anki) => anki.syncTemplate());
  }
}
