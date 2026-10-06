import { resolveSupportedLanguages } from "@common/language";
import type {
  IDictionaryService,
  LookupRequest,
  WordLookupResult,
  WordLookupTask,
} from "@common/types";
import { dictionaryProviders } from "./providers";

export class DictionaryService implements IDictionaryService {
  lookup({ text, context }: LookupRequest): WordLookupTask[] {
    const languages = resolveSupportedLanguages(
      text,
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
          .then(() => provider.lookup(text))
          .then((entry): WordLookupResult =>
            entry
              ? {
                  status: "found",
                  entry: {
                    ...entry,
                    metadata: { ...entry.metadata, ...(language ? { language } : {}) },
                  },
                }
              : { status: "empty" },
          )
          .catch((error: unknown): WordLookupResult => ({
            status: "failed",
            error,
          }));

        return { ...source, result };
      });
  }
}
