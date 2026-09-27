import type { IDictionaryProvider } from "@common/types";
import { BingDictionary } from "./bing";
import { JishoDictionary } from "./jisho";
import { YoudaoDictionary } from "./youdao";
import { ZdicDictionary } from "./zdic";

export const dictionaryProviders: readonly IDictionaryProvider[] = [
  new YoudaoDictionary(),
  new BingDictionary(),
  new ZdicDictionary(),
  new JishoDictionary(),
];

if (
  new Set(dictionaryProviders.map((provider) => provider.id)).size !== dictionaryProviders.length
) {
  throw new Error("Dictionary provider IDs must be unique");
}
