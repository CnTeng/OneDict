import { aiConfigSchema, ankiConfigSchema } from "@common/config";
import type { IConfigService } from "@common/types";
import type { StorageAdapter } from "./storage";
import { createConfigStore } from "./store";

export function createConfigService(storage: StorageAdapter) {
  return {
    anki: createConfigStore("extensions.onedict.config.anki", ankiConfigSchema, storage),
    ai: createConfigStore("extensions.onedict.config.ai", aiConfigSchema, storage),
  } satisfies IConfigService;
}
