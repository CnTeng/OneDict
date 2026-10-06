import * as z from "zod";

const ankiConfigObjectSchema = z.object({
  connectUrl: z.string().default("http://127.0.0.1:8765"),
  deck: z.string().default("Default"),
});

export const ankiConfigSchema = ankiConfigObjectSchema.prefault({});

export type AnkiConfig = z.output<typeof ankiConfigSchema>;

const apiBaseUrlError =
  "Enter an HTTP or HTTPS API base URL without credentials, query, or fragment.";

export const aiConfigSchema = z
  .object({
    baseUrl: z
      .url({ protocol: /^https?$/, abort: true, error: apiBaseUrlError })
      .refine((value) => {
        const url = new URL(value);
        return !url.username && !url.password && !url.search && !url.hash;
      }, apiBaseUrlError)
      .default("https://api.openai.com/v1"),
    model: z.string().trim().default(""),
    apiKey: z.string().trim().default(""),
    responseLanguage: z.string().trim().default("Chinese"),
  })
  .prefault({});

export type AiConfig = z.output<typeof aiConfigSchema>;
