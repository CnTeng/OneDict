import type { DictionaryEntry as DictionaryEntryData, IAnkiService } from "@common/model";
import {
  DictionaryDefinitionsSection,
  DictionaryHeaderSection,
  DictionaryMetadataSection,
  DictionaryPronunciationsSection,
} from "./sections";

export interface DictionaryEntryOptions {
  doc?: Document;
  entry: DictionaryEntryData;
  showAddButton?: boolean;
  ankiService?: IAnkiService;
}

export class DictionaryEntry {
  readonly element: HTMLDivElement;

  private readonly doc: Document;
  private readonly entry: DictionaryEntryData;
  private readonly showAddButton: boolean;
  private readonly ankiService?: IAnkiService;

  constructor({
    doc = document,
    entry,
    showAddButton = true,
    ankiService,
  }: DictionaryEntryOptions) {
    this.doc = doc;
    this.entry = entry;
    this.showAddButton = showAddButton;
    this.ankiService = ankiService;
    this.element = this.doc.createElement("div");
    this.render();
  }

  private render() {
    const { word, provider, metadata, pronunciations, definitions } = this.entry;
    const fragment = this.doc.createDocumentFragment();

    [
      new DictionaryHeaderSection({ doc: this.doc, word, provider }),
      new DictionaryMetadataSection({ doc: this.doc, metadata }),
      new DictionaryPronunciationsSection({ doc: this.doc, pronunciations }),
      new DictionaryDefinitionsSection({
        doc: this.doc,
        definitions,
        showAddButton: this.showAddButton,
        onAddClick: async (index) => this.addDefinitionToAnki(index),
      }),
    ].forEach((section) => {
      if ("isEmpty" in section && section.isEmpty) return;
      fragment.append(section.element);
    });

    this.element.replaceChildren(fragment);
  }

  private async addDefinitionToAnki(index?: number) {
    if (!this.ankiService) return;
    if (typeof index !== "number") return;
    const definition = this.entry.definitions[index];
    if (!definition) return;

    await this.ankiService.addNote({
      ...this.entry,
      definitions: [definition],
    });
  }
}
