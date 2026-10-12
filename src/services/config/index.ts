import { t } from "@common/i18n";
import type {
  ConfigBackup,
  IAiConfigService,
  IAnkiConfigService,
  IConfigBackupAdapter,
  IConfigService,
  IStorageAdapter,
  IWebdavConfigService,
} from "@common/types";
import {
  aiConfigSchema,
  ankiConfigSchema,
  configBackupSchema,
  webdavConfigSchema,
} from "@common/types/config";
import { ConfigStore } from "./store";

export { FileBackup } from "./file";
export { WebdavBackup } from "./webdav";

export class ConfigService implements IConfigService {
  readonly ai: IAiConfigService;
  readonly anki: IAnkiConfigService;
  readonly webdav: IWebdavConfigService;

  constructor(storage: IStorageAdapter) {
    this.ai = new ConfigStore("extensions.onedict.config.ai", aiConfigSchema, storage);
    this.anki = new ConfigStore("extensions.onedict.config.anki", ankiConfigSchema, storage);
    this.webdav = new ConfigStore("extensions.onedict.config.webdav", webdavConfigSchema, storage);
  }

  read(source: Pick<IConfigBackupAdapter, "read">, signal?: AbortSignal): Promise<ConfigBackup> {
    signal?.throwIfAborted();
    return source
      .read(signal)
      .then((content) => {
        signal?.throwIfAborted();
        return configBackupSchema.safeParse(JSON.parse(content));
      })
      .then((result) => {
        if (!result.success) throw new Error(t("config.invalidBackup"));
        return result.data;
      })
      .catch((error: unknown) => {
        if (error instanceof SyntaxError)
          throw new Error(t("config.invalidBackup"), { cause: error });
        throw error;
      });
  }

  async write(target: Pick<IConfigBackupAdapter, "write">, signal?: AbortSignal): Promise<void> {
    signal?.throwIfAborted();
    const [ai, anki] = await Promise.all([this.ai.get(), this.anki.get()]);
    signal?.throwIfAborted();
    await target.write(JSON.stringify(configBackupSchema.parse({ ai, anki }), null, 2), signal);
  }

  async restoreBackup(backup: ConfigBackup): Promise<void> {
    const parsed = configBackupSchema.parse(backup);
    const results = await Promise.allSettled([this.ai.set(parsed.ai), this.anki.set(parsed.anki)]);
    if (results.some((result) => result.status === "rejected"))
      throw new Error(t("config.restoreFailed"));
  }
}
