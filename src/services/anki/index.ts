import type { DictionaryEntry, TextCard } from "@common/types";
import {
  ANKI_MODEL,
  ANKI_TEMPLATE_MARKER,
  ANKI_TEXT_MODEL,
  ANKI_TEXT_TEMPLATE_MARKER,
} from "./builtin";
import { getDecks } from "./deck";
import { checkModel, syncModel } from "./model";
import { createNoteFromEntry, createNoteFromText } from "./note";
import { createAnkiRequest } from "./request";

export type AnkiClient = {
  getDecks: () => Promise<string[]>;
  syncTemplate: () => Promise<void>;
  createNote: (deckName: string, entry: DictionaryEntry) => Promise<void>;
  createTextNote: (deckName: string, card: TextCard) => Promise<void>;
};

export function createAnkiClient(baseUrl: string, signal?: AbortSignal): AnkiClient {
  const request = createAnkiRequest(baseUrl, signal);

  return {
    getDecks: () => getDecks(request),
    syncTemplate: () => syncModel(request),
    createNote: (deckName, entry) =>
      checkModel(request, ANKI_MODEL, ANKI_TEMPLATE_MARKER).then(() =>
        createNoteFromEntry(request, deckName, entry),
      ),
    createTextNote: (deckName, card) =>
      checkModel(request, ANKI_TEXT_MODEL, ANKI_TEXT_TEMPLATE_MARKER).then(() =>
        createNoteFromText(request, deckName, card),
      ),
  };
}
