import type { DictionaryEntry } from "@common/model";
import { cn } from "tailwind-variants";
import {
  DictionaryContextSection,
  DictionaryDefinitionsSection,
  DictionaryHeaderSection,
  DictionaryMetadataSection,
  DictionaryPronunciationsSection,
} from "./sections";

export interface AnkiCardFrontOptions {
  doc: Document;
  entry: DictionaryEntry;
  soundLinks?: HTMLAnchorElement[];
}

export class AnkiCardFront {
  readonly element: HTMLDivElement;

  private readonly doc: Document;
  private readonly entry: DictionaryEntry;
  private readonly soundLinks: HTMLAnchorElement[];

  constructor({ doc, entry, soundLinks = [] }: AnkiCardFrontOptions) {
    this.doc = doc;
    this.entry = entry;
    this.soundLinks = soundLinks;

    this.element = this.doc.createElement("div");
    this.element.className = cn("mx-auto max-w-[600px] p-5 pt-10") as string;

    this.render();
  }

  private render() {
    const header = new DictionaryHeaderSection({
      doc: this.doc,
      word: this.entry.word,
      provider: this.entry.provider,
    }).element;
    header.className = cn("mb-4 flex items-baseline justify-center gap-3") as string;

    const metadataSection = new DictionaryMetadataSection({
      doc: this.doc,
      metadata: this.entry.metadata,
    });
    const metadata = metadataSection.isEmpty ? null : metadataSection.element;
    if (metadata) metadata.className = cn("mb-4 flex justify-center") as string;

    const pronunciationsSection = new DictionaryPronunciationsSection({
      doc: this.doc,
      pronunciations: this.entry.pronunciations,
      soundLinks: this.soundLinks,
    });
    const pronunciations = pronunciationsSection.isEmpty ? null : pronunciationsSection.element;
    if (pronunciations) {
      pronunciations.className = cn(
        "text-base-content/60 flex justify-center gap-6 text-[1rem]",
      ) as string;
    }

    const contextSection = new DictionaryContextSection({
      doc: this.doc,
      context: this.entry.context,
    });
    const context = contextSection.isEmpty ? null : contextSection.element;

    this.element.append(header);
    if (metadata) this.element.append(metadata);
    if (pronunciations) this.element.append(pronunciations);
    if (context) this.element.append(context);
  }
}

export interface AnkiCardBackOptions {
  doc: Document;
  entry: DictionaryEntry;
}

export class AnkiCardBack {
  readonly element: HTMLDivElement;

  private readonly doc: Document;
  private readonly entry: DictionaryEntry;

  constructor({ doc, entry }: AnkiCardBackOptions) {
    this.doc = doc;
    this.entry = entry;

    this.element = this.doc.createElement("div");
    this.element.className = cn("mx-auto max-w-[600px] p-5 pt-0 text-left") as string;

    this.render();
  }

  private render() {
    const cardContainer = this.doc.createElement("div");
    cardContainer.id = "ankilex-definitions";

    const definitionsSection = new DictionaryDefinitionsSection({
      doc: this.doc,
      definitions: this.entry.definitions,
      showAddButton: false,
      toggleTranslation: true,
    });
    const definitions = definitionsSection.isEmpty ? null : definitionsSection.element;
    if (definitions) {
      definitions.classList.add("text-base-content", "leading-relaxed");
      cardContainer.append(definitions);
    }

    this.element.append(cardContainer);
  }
}
