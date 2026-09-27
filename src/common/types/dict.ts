import * as z from "zod";

export const exampleSchema = z.object({
  text: z.string(),
  translation: z.string().optional(),
});

export const definitionSchema = z.object({
  partOfSpeech: z.string().optional(),
  text: z.string(),
  examples: z.array(exampleSchema).optional(),
});

export const pronunciationSchema = z.object({
  text: z.string().optional(),
  audioUrl: z.string().optional(),
  type: z.string().optional(),
});

export const metadataSchema = z.looseObject({
  providerId: z.string(),
  providerName: z.string(),
  language: z.string().optional(),
  tags: z.array(z.string()).optional(),
  frequency: z.number().optional(),
});

export const dictionaryEntrySchema = z.object({
  word: z.string(),
  definitions: z.array(definitionSchema),
  pronunciations: z.array(pronunciationSchema),
  metadata: metadataSchema,
  context: z.string().optional(),
});

export type Example = z.output<typeof exampleSchema>;
export type Definition = z.output<typeof definitionSchema>;
export type Pronunciation = z.output<typeof pronunciationSchema>;
export type Metadata = z.output<typeof metadataSchema>;
export type DictionaryEntry = z.output<typeof dictionaryEntrySchema>;

export interface IDictionaryProvider {
  readonly id: string;
  readonly name: string;
  readonly iconUrl: string;
  readonly supportedLanguages: readonly string[];

  lookup(word: string): Promise<DictionaryEntry | null>;
}

export interface DictionaryLookupSource {
  providerId: string;
  providerName: string;
  providerIconUrl: string;
}

export type DictionaryLookupResult =
  | { status: "found"; entry: DictionaryEntry }
  | { status: "empty" }
  | { status: "failed"; error: unknown };

export interface DictionaryLookupTask extends DictionaryLookupSource {
  result: Promise<DictionaryLookupResult>;
}
