import type { DictionaryEntry, IDictionaryProvider } from "@common/types";
import ky, { type Options, type StandardSchemaV1 } from "ky";

export abstract class DictionaryProvider implements IDictionaryProvider {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly iconUrl: string;
  abstract readonly supportedLanguages: readonly string[];

  abstract lookup(word: string): Promise<DictionaryEntry | null>;

  protected fetchDocument(url: string, options?: Options): Promise<Document> {
    return ky
      .get(url, options)
      .text()
      .then((html) => new DOMParser().parseFromString(html, "text/html"));
  }

  protected fetchJson<Schema extends StandardSchemaV1>(
    schema: Schema,
    url: string,
    options?: Options,
  ) {
    return ky.get(url, options).json(schema);
  }

  protected normalizeText(text?: string | null): string {
    return text?.replace(/\s+/g, " ").trim() ?? "";
  }
}
