import * as z from "zod";

const ankiConfigObjectSchema = z.object({
  connectUrl: z.string().default("http://127.0.0.1:8765"),
  deck: z.string().default("Default"),
});

export const ankiConfigSchema = ankiConfigObjectSchema.prefault({});

export type AnkiConfig = z.output<typeof ankiConfigSchema>;
