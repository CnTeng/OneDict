import * as z from "zod";
import { contextSchema } from "./context";
import type { WordEntry } from "./word";

export const lookupRequestSchema = z.object({
  text: z.string().min(1),
  context: contextSchema.optional(),
});

export type LookupRequest = z.output<typeof lookupRequestSchema>;

export interface WordLookupSource {
  providerId: string;
  providerName: string;
  providerIconUrl: string;
}

export type WordLookupResult =
  | { status: "found"; entry: WordEntry }
  | { status: "empty" }
  | { status: "failed"; error: unknown };

export interface WordLookupTask extends WordLookupSource {
  result: Promise<WordLookupResult>;
}
