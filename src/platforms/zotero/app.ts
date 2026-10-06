import { AiService } from "@services/ai";
import { AppServices } from "@services/app";
import { createConfigService } from "@services/config";
import { audioService } from "./audio";
import { zoteroStorage } from "./storage";

const config = createConfigService(zoteroStorage);

export function createAppServices() {
  return new AppServices(
    config,
    audioService,
    new AiService(config.ai, {
      error: (message) => Zotero.log(message, "error"),
      warn: (message) => Zotero.log(message, "warning"),
      info: (message) => Zotero.debug(message),
      debug: (message) => Zotero.debug(message),
    }),
  );
}
