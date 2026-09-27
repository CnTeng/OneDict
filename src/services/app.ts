import type {
  DictionaryEntry,
  IAnkiConfigService,
  IAnkiService,
  IConfigService,
  IDictionaryService,
} from "@common/types";
import { type AnkiClient, createAnkiClient } from "@services/anki";
import { config as configService } from "@services/config";
import { DictionaryService } from "@services/dict";

class AnkiService implements IAnkiService {
  constructor(private readonly config: IAnkiConfigService) {}

  private async getAnki(): Promise<AnkiClient> {
    return this.config.get().then(({ connectUrl }) => createAnkiClient(connectUrl));
  }

  async createNote(result: DictionaryEntry): Promise<void> {
    const config = await this.config.get();
    if (!config.deck) return;

    await createAnkiClient(config.connectUrl).createNote(config.deck, result);
  }

  async getDecks(): Promise<string[]> {
    return this.getAnki().then((anki) => anki.getDecks());
  }

  async syncTemplate(): Promise<void> {
    await (await this.getAnki()).syncTemplate();
  }
}

export class AppServices {
  readonly config: IConfigService = configService;
  readonly dictionary: IDictionaryService = new DictionaryService();
  readonly anki: IAnkiService = new AnkiService(this.config.anki);
}
