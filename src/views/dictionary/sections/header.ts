import { cn } from "tailwind-variants";

export interface DictionaryHeaderSectionOptions {
  doc: Document;
  word: string;
  provider: string;
}

export class DictionaryHeaderSection {
  readonly element: HTMLDivElement;

  private readonly doc: Document;
  private readonly word: string;
  private readonly provider: string;

  constructor({ doc, word, provider }: DictionaryHeaderSectionOptions) {
    this.doc = doc;
    this.word = word;
    this.provider = provider;

    this.element = this.doc.createElement("div");
    this.element.className = cn("mb-2 flex items-center justify-between") as string;

    this.render();
  }

  private render() {
    const left = this.doc.createElement("div");
    left.className = cn("flex items-baseline gap-2") as string;

    const wordElement = this.doc.createElement("h2");
    wordElement.className = cn("text-base-content text-2xl font-bold") as string;
    wordElement.textContent = this.word;

    const providerElement = this.doc.createElement("span");
    providerElement.className = cn("text-base-content/45 text-[0.65rem] uppercase") as string;
    providerElement.textContent = this.provider;

    left.append(wordElement, providerElement);
    this.element.append(left);
  }
}
