import type { DictionaryEntry, IAnkiService } from "@common/model";
import { Editor, Icon, type IconOptions } from "@views/components";
import { DictionaryEntry as DictionaryEntrySection } from "@views/dictionary/entry";
import { LoaderCircle, SearchX, TriangleAlert } from "lucide";
import { cn } from "tailwind-variants";

export interface LookupPanelOptions {
  doc?: Document;
  className?: string;
  ankiService?: IAnkiService;
}

export class LookupPanel {
  readonly element: HTMLDivElement;

  private readonly doc: Document;
  private readonly ankiService?: IAnkiService;
  private currentLoadId = 0;

  constructor({ doc = document, className, ankiService }: LookupPanelOptions) {
    this.doc = doc;
    this.ankiService = ankiService;

    this.element = this.doc.createElement("div");
    this.element.className = className ?? cn("flex min-h-0 flex-1 flex-col") ?? "";

    this.showLoading();
  }

  load(entryPromise: Promise<DictionaryEntry | null>) {
    this.showLoading();
    this.currentLoadId += 1;
    const loadId = this.currentLoadId;

    return entryPromise
      .then((entry) => {
        if (loadId !== this.currentLoadId) return;

        if (!entry) {
          this.showEmpty();
          return;
        }

        this.element.replaceChildren(this.createContent(entry));
      })
      .catch((error) => {
        if (loadId !== this.currentLoadId) return;
        this.showError(error instanceof Error ? error.message : String(error));
      });
  }

  private createContent(entry: DictionaryEntry) {
    const container = this.doc.createElement("div");
    container.className = cn("flex h-0 flex-1 flex-col overflow-hidden") as string;
    container.append(this.renderScrollArea(entry), this.renderEditorWrapper(entry));
    return container;
  }

  private renderScrollArea(entry: DictionaryEntry) {
    const scrollArea = this.doc.createElement("div");
    scrollArea.className = cn("h-0 flex-1 overflow-y-auto px-3 py-3") as string;
    scrollArea.append(
      new DictionaryEntrySection({
        doc: this.doc,
        entry,
        ankiService: this.ankiService,
      }).element,
    );
    return scrollArea;
  }

  private renderEditorWrapper(entry: DictionaryEntry) {
    const editorWrapper = this.doc.createElement("div");
    editorWrapper.className = cn("border-base-300 shrink-0 border-t px-3 py-2") as string;

    const editor = new Editor({
      ownerDocument: this.doc,
      className: cn("border-base-300 h-[18%] min-h-22 border px-3 py-2 shadow-none") as string,
      placeholder: "Context / Note (Markdown supported)...",
    });
    editor.setContent(entry.context ?? "");
    editorWrapper.append(editor.element);

    return editorWrapper;
  }

  private showLoading(message = "Looking up...") {
    this.showStatus({
      message,
      iconNode: LoaderCircle,
      iconClassName: "animate-spin",
      containerClassName: cn(
        "text-base-content/80 flex flex-col items-center justify-center gap-3 py-8",
      ) as string,
      textClassName: cn("text-base-content animate-pulse text-sm") as string,
    });
  }

  private showEmpty(message = "Looking up...") {
    this.showStatus({
      message,
      iconNode: SearchX,
      containerClassName: cn(
        "text-base-content/80 flex flex-col items-center justify-center gap-3 py-8",
      ) as string,
      textClassName: cn("text-base-content text-sm") as string,
    });
  }

  private showError(message = "Something went wrong") {
    this.showStatus({
      message,
      iconNode: TriangleAlert,
      containerClassName:
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-red-200 bg-red-50 py-8 text-red-800 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300",
      textClassName: cn("text-sm") as string,
    });
  }

  private showStatus({
    message,
    iconNode,
    iconClassName,
    containerClassName,
    textClassName,
  }: {
    message: string;
    iconNode: IconOptions["iconNode"];
    iconClassName?: string;
    containerClassName: string;
    textClassName: string;
  }) {
    const container = this.doc.createElement("div");
    container.className = containerClassName;

    const icon = this.doc.createElement("div");
    icon.replaceChildren(
      new Icon({
        doc: this.doc,
        iconNode,
        customAttrs: iconClassName ? { class: iconClassName } : undefined,
      }).element,
    );

    const text = this.doc.createElement("p");
    text.className = textClassName;
    text.textContent = message;

    container.append(icon, text);
    this.element.replaceChildren(container);
  }
}
