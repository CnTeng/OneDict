import { AppServices } from "@services/app";
import { HtmlAudioService } from "@services/audio";
import { createConfigService } from "@services/config";
import { browserStorage } from "./storage";

const config = createConfigService(browserStorage);

export function createAppServices() {
  return new AppServices(config, new HtmlAudioService(() => document.createElement("audio")));
}
