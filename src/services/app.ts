import type {
  IAiService,
  IAnkiService,
  IAudioService,
  IConfigService,
  IDictionaryService,
} from "@common/types";
import { AiService } from "@services/ai";
import { AnkiService } from "@services/anki/service";
import { DictionaryService } from "@services/dict";

export class AppServices {
  readonly dictionary: IDictionaryService;
  readonly anki: IAnkiService;
  readonly ai: IAiService;

  constructor(
    readonly config: IConfigService,
    readonly audio: IAudioService,
    ai: IAiService = new AiService(config.ai),
  ) {
    this.dictionary = new DictionaryService();
    this.anki = new AnkiService(config.anki);
    this.ai = ai;
  }
}
