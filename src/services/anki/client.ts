import type { TextEntry, WordEntry } from "@common/types";
import {
  ANKI_MODEL,
  ANKI_TEMPLATE_MARKER,
  ANKI_TEXT_MODEL,
  ANKI_TEXT_TEMPLATE_MARKER,
} from "./builtin";
import { getDecks } from "./deck";
import { checkModel, syncModel } from "./model";
import { createTextNote, createWordNote } from "./note";
import { type AnkiRequest, createAnkiRequest } from "./request";

export class AnkiClient {
  private readonly request: AnkiRequest;

  constructor(baseUrl: string, signal?: AbortSignal) {
    this.request = createAnkiRequest(baseUrl, signal);
  }

  getDecks(): Promise<string[]> {
    return getDecks(this.request);
  }

  syncTemplate(): Promise<void> {
    return syncModel(this.request);
  }

  createWordNote(deckName: string, entry: WordEntry, context?: string): Promise<void> {
    return checkModel(this.request, ANKI_MODEL, ANKI_TEMPLATE_MARKER).then(() =>
      createWordNote(this.request, deckName, entry, context),
    );
  }

  createTextNote(deckName: string, entry: TextEntry, context?: string): Promise<void> {
    return checkModel(this.request, ANKI_TEXT_MODEL, ANKI_TEXT_TEMPLATE_MARKER).then(() =>
      createTextNote(this.request, deckName, entry, context),
    );
  }
}
