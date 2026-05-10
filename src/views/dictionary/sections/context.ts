import { tokenize } from "@common/tokenizer";
import { cn } from "tailwind-variants";

const MARKDOWN_TAGS = {
  bold: "strong",
  italic: "em",
  strike: "s",
  code: "code",
} as const;

export interface DictionaryContextSectionOptions {
  doc: Document;
  context?: string;
}

export class DictionaryContextSection {
  readonly element: HTMLDivElement;
  readonly isEmpty: boolean;

  private readonly doc: Document;
  private readonly context?: string;

  constructor({ doc, context }: DictionaryContextSectionOptions) {
    this.doc = doc;
    this.context = context;

    this.element = this.doc.createElement("div");
    this.element.className = cn("mt-4 text-left") as string;
    this.isEmpty = !this.context || this.context.trim() === "";

    if (this.isEmpty) return;
    this.render();
  }

  private render() {
    const label = this.doc.createElement("div");
    label.className = cn(
      "text-base-content/55 mb-2 ml-1 text-[0.7rem] font-bold tracking-widest uppercase",
    ) as string;
    label.textContent = "Context";

    const contentElement = this.doc.createElement("div");
    contentElement.className = cn(
      "border-base-300/70 border-l pl-3 text-[0.9rem] leading-relaxed italic",
    ) as string;
    contentElement.append(this.renderMarkdown(this.context!.trim()));

    this.element.append(label, contentElement);
  }

  private renderMarkdown(text: string) {
    const fragment = this.doc.createDocumentFragment();

    text.split("\n").forEach((line, lineIndex) => {
      if (lineIndex > 0) fragment.append(this.doc.createElement("br"));
      tokenize(line).forEach((token) => {
        this.appendMarkdownToken(fragment, token);
      });
    });

    return fragment;
  }

  private appendMarkdownToken(
    fragment: DocumentFragment,
    token: ReturnType<typeof tokenize>[number],
  ) {
    if (token.type === "marker") return;

    if (token.type === "text") {
      fragment.append(this.doc.createTextNode(token.value));
      return;
    }

    const element = this.doc.createElement(MARKDOWN_TAGS[token.type] ?? "span");
    if (token.type === "code") {
      element.className = cn(
        "bg-base-200 text-base-content rounded-sm px-1 font-mono text-[0.85em]",
      ) as string;
    }
    element.textContent = token.value;
    fragment.append(element);
  }
}
