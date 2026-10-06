import type { AnkiModel } from "@common/types";
import { ANKI_MODEL_CSS, ANKI_MODEL_TEMPLATE, ANKI_TEXT_MODEL_TEMPLATE } from "./template";

export const ANKI_MODEL_NAME = "OneDict Word";

export const ANKI_MODEL_FIELDS = [
  "word",
  "definition",
  "examples",
  "pronunciations",
  "audio",
  "metadata",
  "context",
  "version",
] as const;

export const ANKI_TEMPLATE_VERSION = 5;

export const ANKI_TEMPLATE_MARKER = `onedict-template:${ANKI_TEMPLATE_VERSION}`;

export const ANKI_TAG = "onedict";

export const ANKI_AUDIO_FILENAME_PREFIX = "onedict";

export const ANKI_MODEL_STYLE = `/* ${ANKI_TEMPLATE_MARKER} */\n${ANKI_MODEL_CSS}`;

export const ANKI_MODEL = {
  modelName: ANKI_MODEL_NAME,
  inOrderFields: [...ANKI_MODEL_FIELDS],
  css: ANKI_MODEL_STYLE,
  cardTemplates: [ANKI_MODEL_TEMPLATE],
} satisfies AnkiModel;

export const ANKI_TEXT_TEMPLATE_VERSION = 2;
export const ANKI_TEXT_TEMPLATE_MARKER = `onedict-text-template:${ANKI_TEXT_TEMPLATE_VERSION}`;
export const ANKI_TEXT_MODEL = {
  modelName: "OneDict Text",
  inOrderFields: ["text", "context", "explanation", "version"],
  css: `/* ${ANKI_TEXT_TEMPLATE_MARKER} */\n${ANKI_MODEL_CSS}`,
  cardTemplates: [ANKI_TEXT_MODEL_TEMPLATE],
} satisfies AnkiModel;
