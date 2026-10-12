import type { IAppServices } from "@common/types";
import { AiService } from "@services/ai";
import { AnkiService } from "@services/anki";
import { ConfigService } from "@services/config";
import { DictionaryService } from "@services/dict";
import { HtmlAudioService } from "./audio";
import { BrowserFileService } from "./file";
import { BrowserStorage } from "./storage";

const config = new ConfigService(new BrowserStorage());

export function createAppServices(): IAppServices {
  return {
    file: new BrowserFileService(document),
    config,
    dictionary: new DictionaryService(),
    anki: new AnkiService(config.anki),
    ai: new AiService(config.ai),
    audio: new HtmlAudioService(),
  };
}
