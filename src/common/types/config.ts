import * as z from "zod";
import { t } from "../i18n";

const ankiConfigObjectSchema = z.object({
  connectUrl: z.string().default("http://127.0.0.1:8765"),
  deck: z.string().default("Default"),
});

export const ankiConfigSchema = ankiConfigObjectSchema.prefault({});

export type AnkiConfig = z.output<typeof ankiConfigSchema>;

const apiBaseUrlError = () => t("errors.apiUrl");

export const aiConfigSchema = z
  .object({
    baseUrl: z
      .url({ protocol: /^https?$/, abort: true, error: apiBaseUrlError })
      .refine(
        (value) => {
          const url = new URL(value);
          return !url.username && !url.password && !url.search && !url.hash;
        },
        { error: apiBaseUrlError },
      )
      .default("https://api.openai.com/v1"),
    model: z.string().trim().default(""),
    apiKey: z.string().trim().default(""),
    responseLanguage: z.string().trim().default("Chinese"),
  })
  .prefault({});

export type AiConfig = z.output<typeof aiConfigSchema>;
