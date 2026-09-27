import iconUrl from "@assets/providers/jisho.png?inline";
import type { Definition, DictionaryEntry, Pronunciation } from "@common/types";
import * as z from "zod";
import { DictionaryProvider } from "../provider";

const JISHO_ORIGIN = "https://jisho.org";

const jishoEntrySchema = z.object({
  slug: z.string().default(""),
  tags: z.array(z.string()).default(() => []),
  jlpt: z.array(z.string()).default(() => []),
  japanese: z
    .array(
      z.object({
        word: z.string().optional(),
        reading: z.string().optional(),
      }),
    )
    .default(() => []),
  senses: z
    .array(
      z.object({
        english_definitions: z.array(z.string()).default(() => []),
        parts_of_speech: z.array(z.string()).default(() => []),
      }),
    )
    .default(() => []),
});

const jishoResponseSchema = z.object({
  data: z.array(jishoEntrySchema),
});

type JishoEntry = z.infer<typeof jishoEntrySchema>;

function normalizeAudioUrl(url: string): string {
  return new URL(url, JISHO_ORIGIN).href;
}

export class JishoDictionary extends DictionaryProvider {
  private readonly baseUrl = `${JISHO_ORIGIN}/api/v1/search/words`;
  private readonly wordBaseUrl = `${JISHO_ORIGIN}/word`;
  readonly id = "jisho";
  readonly name = "Jisho Japanese Dictionary";
  readonly iconUrl = iconUrl;
  readonly supportedLanguages = ["ja"] as const;

  async lookup(word: string): Promise<DictionaryEntry | null> {
    const result = this.parseResponse(
      await this.fetchJson(jishoResponseSchema, this.baseUrl, {
        searchParams: { keyword: word },
      }),
    );
    if (!result) return null;

    const audioUrl = await this.lookupAudioUrl(result.word);
    if (!audioUrl) return result;

    return {
      ...result,
      pronunciations:
        result.pronunciations.length > 0
          ? result.pronunciations.map((p, i) => (i === 0 ? { ...p, audioUrl } : p))
          : [{ type: "ja", audioUrl }],
    };
  }

  private parseResponse(payload: z.infer<typeof jishoResponseSchema>): DictionaryEntry | null {
    const item = payload.data.find((entry) => this.parseDefinitions(entry).length > 0);
    if (!item) return null;

    const first = item.japanese[0];
    const word = first?.word?.trim() || first?.reading?.trim() || item.slug?.trim();
    if (!word) return null;

    return {
      word,
      definitions: this.parseDefinitions(item),
      pronunciations: this.parsePronunciations(item),
      metadata: {
        ...this.parseMetadata(item),
        providerId: this.id,
        providerName: this.name,
      },
    };
  }

  private parseDefinitions(item: JishoEntry): Definition[] {
    return item.senses.flatMap((sense) => {
      const text = sense.english_definitions
        ?.map((d) => d.trim())
        .filter(Boolean)
        .join("; ");
      if (!text) return [];

      const partOfSpeech = sense.parts_of_speech
        ?.map((p) => p.trim())
        .filter(Boolean)
        .join(", ");

      return [{ partOfSpeech: partOfSpeech || undefined, text }];
    });
  }

  private parsePronunciations(item: JishoEntry): Pronunciation[] {
    const seen = new Set<string>();
    return item.japanese.flatMap((entry) => {
      const text = entry.reading?.trim() || entry.word?.trim() || "";
      if (!text || seen.has(text)) return [];
      seen.add(text);
      return [{ type: "ja", text }];
    });
  }

  private lookupAudioUrl(word: string): Promise<string | undefined> {
    return this.fetchDocument(`${this.wordBaseUrl}/${encodeURIComponent(word)}`)
      .then((doc) =>
        Array.from(doc.querySelectorAll(".concept_light-status audio source[src]")).map(
          (source) => source.getAttribute("src") || "",
        ),
      )
      .then(
        (urls) =>
          Array.from(new Set(urls.filter(Boolean).map(normalizeAudioUrl))).sort((a, b) => {
            const aIsMp3 = a.includes(".mp3");
            const bIsMp3 = b.includes(".mp3");
            return aIsMp3 === bIsMp3 ? 0 : aIsMp3 ? -1 : 1;
          })[0],
      )
      .catch(() => undefined);
  }

  private parseMetadata(item: JishoEntry): Record<string, unknown> {
    const metadata: Record<string, unknown> = {};
    const tags = [...item.tags, ...item.jlpt].filter(Boolean);
    if (tags.length > 0) metadata.tags = tags;
    return metadata;
  }
}
