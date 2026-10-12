import * as z from "zod";
import { t } from "../i18n";

export const ankiConfigSchema = z
  .object({
    connectUrl: z.string().default("http://127.0.0.1:8765"),
    deck: z.string().default("Default"),
  })
  .prefault({});

export type AnkiConfig = z.output<typeof ankiConfigSchema>;

export const aiConfigSchema = z
  .object({
    baseUrl: z
      .url({ protocol: /^https?$/, abort: true, error: t("errors.apiUrl") })
      .refine(
        (value) => {
          const url = new URL(value);
          return !url.username && !url.password && !url.search && !url.hash;
        },
        { error: t("errors.apiUrl") },
      )
      .default("https://api.openai.com/v1"),
    model: z.string().trim().default(""),
    apiKey: z.string().trim().default(""),
    responseLanguage: z.string().trim().default("Chinese"),
  })
  .prefault({});

export type AiConfig = z.output<typeof aiConfigSchema>;

export const configBackupSchema = z.strictObject({
  ai: aiConfigSchema.unwrap(),
  anki: ankiConfigSchema.unwrap(),
});

export type ConfigBackup = z.output<typeof configBackupSchema>;

export const webdavConfigSchema = z
  .object({
    url: z
      .union([
        z.literal(""),
        z.url({ protocol: /^https?$/, error: () => t("webdav.invalidConnection") }).refine(
          (value) => {
            const url = new URL(value);
            return !url.username && !url.password && !url.search && !url.hash;
          },
          { error: () => t("webdav.invalidConnection") },
        ),
      ])
      .default(""),
    username: z
      .string()
      .max(4096)
      .refine((value) => !value.includes(":"), { error: () => t("webdav.invalidConnection") })
      .default(""),
    password: z.string().max(4096).default(""),
  })
  .prefault({});

export type WebdavConfig = z.output<typeof webdavConfigSchema>;
