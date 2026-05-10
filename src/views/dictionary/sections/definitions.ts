import type { Definition, Example } from "@common/model";
import { cn } from "tailwind-variants";
import { AnkiAddButton } from "./anki-add-button";

export interface DictionaryDefinitionsSectionOptions {
  doc: Document;
  definitions: Definition[];
  showAddButton?: boolean;
  onAddClick?: (index?: number) => void | Promise<void>;
  toggleTranslation?: boolean;
}

export class DictionaryDefinitionsSection {
  readonly element: HTMLDivElement;
  readonly isEmpty: boolean;

  private readonly doc: Document;
  private readonly definitions: Definition[];
  private readonly showAddButton: boolean;
  private readonly onAddClick?: (index?: number) => void | Promise<void>;
  private readonly toggleTranslation: boolean;

  constructor({
    doc,
    definitions,
    showAddButton = false,
    onAddClick,
    toggleTranslation = false,
  }: DictionaryDefinitionsSectionOptions) {
    this.doc = doc;
    this.definitions = definitions;
    this.showAddButton = showAddButton;
    this.onAddClick = onAddClick;
    this.toggleTranslation = toggleTranslation;

    this.element = this.doc.createElement("div");
    this.element.className = cn("divide-border flex flex-col divide-y") as string;
    this.isEmpty = !this.definitions || this.definitions.length === 0;

    if (this.isEmpty) return;
    this.render();
  }

  private render() {
    this.definitions.forEach((definition, index) => {
      this.element.append(this.createDefinition(definition, index));
    });
  }

  private createDefinition(definition: Definition, index: number): HTMLDivElement {
    const container = this.doc.createElement("div");
    const baseClass = "flex flex-1 flex-col gap-1 py-4 first:pt-2 last:pb-2";

    if (this.toggleTranslation) {
      container.dataset.state = "closed";
      container.setAttribute("role", "button");
      container.className = cn(baseClass, "group cursor-pointer outline-none") as string;
      container.onclick = (event) => {
        event.stopPropagation();
        const isClosed = container.dataset.state === "closed";
        container.dataset.state = isClosed ? "open" : "closed";
      };
    } else {
      container.className = baseClass;
    }

    const headerRow = this.doc.createElement("div");
    headerRow.className = cn("flex flex-1 items-center justify-between gap-1") as string;
    headerRow.append(this.createDefinitionContent(definition));

    if (this.showAddButton) {
      headerRow.append(this.createAnkiAddButton(index));
    }

    container.append(headerRow);

    const examples = this.createExamples(definition.examples);
    if (examples) container.append(examples);

    return container;
  }

  private createDefinitionContent(definition: Definition): HTMLDivElement {
    const container = this.doc.createElement("div");
    container.className = cn("leading-relaxed") as string;

    if (definition.partOfSpeech) {
      const posElement = this.doc.createElement("span");
      posElement.className = cn("text-base-content/55 mr-2 text-xs font-medium italic") as string;
      posElement.textContent = definition.partOfSpeech;
      container.append(posElement);
    }

    const textElement = this.doc.createElement("span");
    textElement.className = cn("text-base-content text-sm leading-relaxed") as string;
    textElement.textContent = definition.text;
    container.append(textElement);

    return container;
  }

  private createExamples(examples?: Example[]): HTMLUListElement | null {
    if (!examples || examples.length === 0) return null;

    const list = this.doc.createElement("ul");
    list.className = cn("mt-2 list-disc flex-col space-y-2 pl-3") as string;
    examples.forEach((example) => {
      list.append(this.createExampleItem(example));
    });

    return list.children.length > 0 ? list : null;
  }

  private createExampleItem(example: Example): HTMLLIElement {
    const item = this.doc.createElement("li");
    item.className = cn("text-base-content/70 text-sm") as string;

    const textElement = this.doc.createElement("span");
    textElement.textContent = example.text;
    item.append(textElement);

    if (example.translation) {
      const translationElement = this.doc.createElement("span");
      translationElement.className = cn(
        "ml-1",
        "group-data-[state=closed]:bg-base-300",
        "group-data-[state=closed]:text-transparent!",
        "group-data-[state=closed]:select-none",
        "group-data-[state=closed]:rounded",
        "group-data-[state=closed]:px-1",
        "group-data-[state=closed]:py-0.5",
      ) as string;
      translationElement.textContent = ` ${example.translation}`;
      item.append(translationElement);
    }

    return item;
  }

  private createAnkiAddButton(index: number): HTMLButtonElement {
    return new AnkiAddButton({
      doc: this.doc,
      index,
      onAddClick: this.onAddClick,
    }).element;
  }
}
