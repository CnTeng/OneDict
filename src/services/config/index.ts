import { ankiConfigSchema } from "@common/config";
import type { IConfigService } from "@common/types";
import { createConfigStore } from "./store";

const stores = {
  anki: createConfigStore("extensions.onedict.config.anki", ankiConfigSchema),
};

export const config = {
  ...stores,
  async reset() {
    await Promise.all(Object.values(stores).map((store) => store.reset()));
  },
} satisfies IConfigService;
