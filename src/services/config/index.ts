import type {
  IAiConfigService,
  IAnkiConfigService,
  IConfigService,
  IStorageAdapter,
} from "@common/types";
import { aiConfigSchema, ankiConfigSchema } from "@common/types/config";
import { ConfigStore } from "./store";

export class ConfigService implements IConfigService {
  readonly ai: IAiConfigService;
  readonly anki: IAnkiConfigService;

  constructor(storage: IStorageAdapter) {
    this.ai = new ConfigStore("extensions.onedict.config.ai", aiConfigSchema, storage);
    this.anki = new ConfigStore("extensions.onedict.config.anki", ankiConfigSchema, storage);
  }
}
