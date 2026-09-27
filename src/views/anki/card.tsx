import {
  type DictionaryEntry,
  definitionSchema,
  exampleSchema,
  metadataSchema,
  pronunciationSchema,
} from "@common/types/dict";
import { HtmlAudioService } from "@services/audio";
import { AnkiCardBack, AnkiCardFront } from "@views/dictionary/card";
import { type ComponentChildren, render } from "preact";
import type * as z from "zod";

type RootRegistry = Map<HTMLElement, () => void>;

const ankiGlobal = globalThis as typeof globalThis & {
  __oneDictAnkiRoots?: RootRegistry;
};

const cardDefinitionSchema = definitionSchema.omit({ examples: true });

function decodeFieldText(text: string): string {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

function readField(id: string): string | undefined {
  const text = document.getElementById(id)?.textContent || undefined;
  if (!text) return undefined;
  return decodeFieldText(text);
}

function parseField<S extends z.ZodType>(id: string, schema: S): z.output<S> | undefined {
  const value = readField(id);
  if (!value) return undefined;
  try {
    return schema.parse(JSON.parse(value));
  } catch {
    return undefined;
  }
}

function getEntry(): DictionaryEntry | undefined {
  const word = readField("raw-word");
  const definition = parseField("raw-definition", cardDefinitionSchema);
  const examples = parseField("raw-examples", exampleSchema.array()) ?? [];
  const pronunciations = parseField("raw-pronunciations", pronunciationSchema.array()) ?? [];
  const metadata = parseField("raw-metadata", metadataSchema);
  const context = readField("raw-context");

  if (!word || !definition || !metadata) return undefined;

  return {
    word,
    definitions: [{ ...definition, examples }],
    pronunciations,
    metadata,
    context,
  };
}

function mountCard(root: HTMLElement, content: ComponentChildren) {
  const roots = (ankiGlobal.__oneDictAnkiRoots ??= new Map());

  for (const [mountedRoot, dispose] of roots) {
    if (mountedRoot.isConnected && mountedRoot !== root) continue;
    dispose();
    roots.delete(mountedRoot);
  }

  render(content, root);
  roots.set(root, () => render(null, root));
}

export function initAnkiFront() {
  const entry = getEntry();
  const root = document.getElementById("onedict-front-root");
  if (!entry || !root) return;

  const rawAudio = document.getElementById("raw-audio");
  const soundLinks = Array.from(rawAudio?.querySelectorAll<HTMLAnchorElement>(".soundLink") ?? []);

  mountCard(
    root,
    <AnkiCardFront
      entry={entry}
      soundLinks={soundLinks}
      audioService={new HtmlAudioService(document)}
    />,
  );
}

export function initAnkiBack() {
  const entry = getEntry();
  const root = document.getElementById("onedict-back-root");
  if (!entry || !root) return;

  mountCard(root, <AnkiCardBack entry={entry} />);
}
