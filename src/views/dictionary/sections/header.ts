import { cn } from "cn";

export interface DictionaryHeaderSectionOptions {
  container: HTMLElement | DocumentFragment;
  word: string;
  provider: string;
}

export class DictionaryHeaderSection {
  readonly element: HTMLDivElement;

  private readonly document: Document;
  private readonly word: string;
  private readonly provider: string;

  constructor({ container, word, provider }: DictionaryHeaderSectionOptions) {
    this.document = container.ownerDocument ?? document;
    this.word = word;
    this.provider = provider;

    this.element = this.document.createElement("div");
    this.element.className = cn("mb-2.5 flex items-center justify-between");

    this.render();
    container.append(this.element);
  }

  private render() {
    const left = this.document.createElement("div");
    left.className = cn("flex items-baseline gap-2.5");

    const wordElement = this.document.createElement("h2");
    wordElement.className = cn(
      "text-foreground text-[1.65rem] leading-tight font-bold tracking-tight",
    );
    wordElement.textContent = this.word;

    const providerElement = this.document.createElement("span");
    providerElement.className = cn(
      "text-muted-foreground bg-muted/70 border-border/50 rounded-full border px-2 py-0.5 text-[0.65rem] font-medium uppercase opacity-90",
    );
    providerElement.textContent = this.provider;

    left.append(wordElement, providerElement);
    this.element.append(left);
  }
}
