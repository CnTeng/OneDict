import type {
  AnkiNote,
  Definition,
  Example,
  Pronunciation,
  TextEntry,
  WordEntry,
} from "@common/types";
import * as z from "zod";
import {
  ANKI_AUDIO_FILENAME_PREFIX,
  ANKI_MODEL_NAME,
  ANKI_TAG,
  ANKI_TEMPLATE_VERSION,
  ANKI_TEXT_MODEL,
  ANKI_TEXT_TEMPLATE_VERSION,
} from "./builtin";
import type { AnkiRequest } from "./request";

const noteIdSchema = z.number();

function encodeFieldText(text: string): string {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function serializeField(value: unknown): string {
  return value === undefined ? "" : JSON.stringify(value, null, 2);
}

function createDefinitionFields(definition?: Definition): {
  definition: Omit<Definition, "examples"> | undefined;
  examples: Example[] | undefined;
} {
  if (!definition) return { definition: undefined, examples: undefined };
  const { examples, ...value } = definition;
  return { definition: value, examples };
}

function createAudioItems(word: string, pronunciations: Pronunciation[]) {
  const timestamp = Date.now();
  return pronunciations.flatMap((pronunciation, index) => {
    if (!pronunciation.audioUrl) return [];
    return {
      url: pronunciation.audioUrl,
      filename: `${ANKI_AUDIO_FILENAME_PREFIX}_${word}${pronunciation.type ? `_${pronunciation.type}` : ""}_${timestamp}_${index}.mp3`,
      fields: ["audio"],
    };
  });
}

function createWordNotePayload(
  deckName: string,
  modelName: string,
  entry: WordEntry,
  context?: string,
): AnkiNote {
  const audio = createAudioItems(entry.word, entry.pronunciations);
  const { definition, examples } = createDefinitionFields(entry.definitions[0]);

  return {
    deckName,
    modelName,
    fields: {
      word: entry.word,
      definition: serializeField(definition),
      examples: serializeField(examples),
      pronunciations: serializeField(entry.pronunciations),
      metadata: serializeField(entry.metadata),
      context: context ?? "",
      version: serializeField(ANKI_TEMPLATE_VERSION),
    },
    tags: [ANKI_TAG],
    ...(audio.length > 0 ? { audio } : {}),
  };
}

async function createNote(request: AnkiRequest, note: AnkiNote): Promise<void> {
  await request("addNote", noteIdSchema, { note });
}

export async function createWordNote(
  request: AnkiRequest,
  deckName: string,
  entry: WordEntry,
  context?: string,
): Promise<void> {
  await createNote(request, createWordNotePayload(deckName, ANKI_MODEL_NAME, entry, context));
}

export async function createTextNote(
  request: AnkiRequest,
  deckName: string,
  entry: TextEntry,
  context?: string,
): Promise<void> {
  if (!entry.text.trim() || !entry.explanation.trim())
    throw new Error("Text cards require selected text and an explanation.");
  await createNote(request, {
    deckName,
    modelName: ANKI_TEXT_MODEL.modelName,
    fields: {
      text: encodeFieldText(entry.text.trim()),
      context: encodeFieldText(context?.trim() ?? ""),
      explanation: encodeFieldText(entry.explanation.trim()),
      version: serializeField(ANKI_TEXT_TEMPLATE_VERSION),
    },
    tags: [ANKI_TAG, "ai"],
  });
}
