import type { IAppServices } from "@common/types";
import { AiService } from "@services/ai";
import { AnkiService } from "@services/anki";
import { ConfigService } from "@services/config";
import { DictionaryService } from "@services/dict";
import { ZoteroAudioService } from "./audio";
import { ZoteroFileService } from "./file";
import { ZoteroStorage } from "./storage";

const config = new ConfigService(new ZoteroStorage());
const audio = new ZoteroAudioService();

export function createAppServices(): IAppServices {
  return {
    file: new ZoteroFileService(),
    config,
    dictionary: new DictionaryService(),
    anki: new AnkiService(config.anki),
    ai: new AiService(config.ai, {
      error: (message) => Zotero.log(message, "error"),
      warn: (message) => Zotero.log(message, "warning"),
      info: (message) => Zotero.debug(message),
      debug: (message) => Zotero.debug(message),
    }),
    audio,
  };
}
