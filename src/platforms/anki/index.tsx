import { i18n } from "@common/i18n";
import {
  type WordEntry,
  definitionSchema,
  exampleSchema,
  metadataSchema,
  pronunciationSchema,
} from "@common/types/word";
import { type ComponentChildren, render } from "preact";
import type * as z from "zod";
import { AnkiAudioService } from "./audio";
import { TextCardBack, TextCardFront } from "./text-card";
import { WordCardBack, WordCardFront } from "./word-card";

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

function getEntry(): WordEntry | undefined {
  const word = readField("raw-word");
  const definition = parseField("raw-definition", cardDefinitionSchema);
  const examples = parseField("raw-examples", exampleSchema.array()) ?? [];
  const pronunciations = parseField("raw-pronunciations", pronunciationSchema.array()) ?? [];
  const metadata = parseField("raw-metadata", metadataSchema);

  if (!word || !metadata) return undefined;

  return {
    word,
    definitions: definition ? [{ ...definition, examples }] : [],
    pronunciations,
    metadata,
  };
}

function mountCard(root: HTMLElement, content: ComponentChildren) {
  void i18n.changeLanguage(navigator.language);
  const roots = (ankiGlobal.__oneDictAnkiRoots ??= new Map());

  for (const [mountedRoot, dispose] of roots) {
    if (mountedRoot.isConnected && mountedRoot !== root) continue;
    dispose();
    roots.delete(mountedRoot);
  }

  render(content, root);
  roots.set(root, () => render(null, root));
}

export function initTextFront() {
  const text = readField("raw-text");
  const root = document.getElementById("onedict-front-root");
  if (!text || !root) return;

  mountCard(root, <TextCardFront text={text} context={readField("raw-context")} />);
}

export function initTextBack() {
  const explanation = readField("raw-explanation");
  const root = document.getElementById("onedict-back-root");
  if (!explanation || !root) return;

  mountCard(root, <TextCardBack explanation={explanation} />);
}

export function initWordFront() {
  const entry = getEntry();
  const root = document.getElementById("onedict-front-root");
  if (!entry || !root) return;

  const rawAudio = document.getElementById("raw-audio");
  const soundLinks = Array.from(rawAudio?.querySelectorAll<HTMLAnchorElement>(".soundLink") ?? []);

  mountCard(
    root,
    <WordCardFront
      entry={entry}
      context={readField("raw-context")}
      audioService={new AnkiAudioService(entry.pronunciations, soundLinks)}
    />,
  );
}

export function initWordBack() {
  const entry = getEntry();
  const root = document.getElementById("onedict-back-root");
  if (!entry || !root) return;

  mountCard(root, <WordCardBack entry={entry} />);
}
