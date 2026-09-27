import { resolveSupportedLanguages } from "@common/language";
import type {
  Context,
  DictionaryLookupResult,
  DictionaryLookupTask,
  IDictionaryService,
} from "@common/types";
import { dictionaryProviders } from "./providers";

export class DictionaryService implements IDictionaryService {
  lookup(word: string, context?: Context): DictionaryLookupTask[] {
    const languages = resolveSupportedLanguages(
      word,
      [...new Set(dictionaryProviders.flatMap((provider) => provider.supportedLanguages))],
      context?.lang,
    );

    return dictionaryProviders
      .filter((provider) =>
        provider.supportedLanguages.some((language) => languages.includes(language)),
      )
      .map((provider) => {
        const source = {
          providerId: provider.id,
          providerName: provider.name,
          providerIconUrl: provider.iconUrl,
        };
        const language = provider.supportedLanguages.find((language) =>
          languages.includes(language),
        );
        const result = Promise.resolve()
          .then(() => provider.lookup(word))
          .then((entry): DictionaryLookupResult =>
            entry
              ? {
                  status: "found",
                  entry: {
                    ...entry,
                    metadata: { ...entry.metadata, ...(language ? { language } : {}) },
                    ...(context?.context ? { context: context.context } : {}),
                  },
                }
              : { status: "empty" },
          )
          .catch((error: unknown): DictionaryLookupResult => ({
            status: "failed",
            error,
          }));

        return { ...source, result };
      });
  }
}
