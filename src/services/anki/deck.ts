import * as z from "zod";
import type { AnkiRequest } from "./request";

const deckNamesSchema = z.array(z.string());

export function getDecks(request: AnkiRequest): Promise<string[]> {
  return request("deckNames", deckNamesSchema);
}
