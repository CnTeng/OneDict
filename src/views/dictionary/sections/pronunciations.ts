import type { Pronunciation } from "@common/types";
import { Icon, buttonStyles } from "@views/components";
import { cn } from "cn";
import { Play } from "lucide";

export interface DictionaryPronunciationsSectionOptions {
  container: HTMLElement | DocumentFragment;
  pronunciations: Pronunciation[];
  soundLinks?: HTMLAnchorElement[];
}

export class DictionaryPronunciationsSection {
  readonly element: HTMLDivElement;
  readonly isEmpty: boolean;

  private readonly document: Document;
  private readonly pronunciations: Pronunciation[];
  private readonly soundLinks?: HTMLAnchorElement[];

  constructor({ container, pronunciations, soundLinks }: DictionaryPronunciationsSectionOptions) {
    this.document = container.ownerDocument ?? document;
    this.pronunciations = pronunciations;
    this.soundLinks = soundLinks;

    this.element = this.document.createElement("div");
    this.element.className = cn("mb-2.5 flex flex-wrap gap-3.5");
    this.isEmpty = !this.pronunciations || this.pronunciations.length === 0;

    if (this.isEmpty) return;
    this.render();
    container.append(this.element);
  }

  private render() {
    this.pronunciations.forEach(({ type, text, audioUrl }, index) => {
      const item = this.document.createElement("div");
      item.className = cn("flex items-center gap-1.5");

      if (type) {
        const typeElement = this.document.createElement("span");
        typeElement.className = cn(
          "text-muted-foreground text-xs font-semibold uppercase opacity-70",
        );
        typeElement.textContent = type;
        item.append(typeElement);
      }

      if (text) {
        const textElement = this.document.createElement("span");
        textElement.className = cn("text-foreground font-mono text-[0.92rem]");
        textElement.textContent = text;
        item.append(textElement);
      }

      const link =
        this.soundLinks?.[index] ||
        (this.soundLinks && this.pronunciations.length === 1 ? this.soundLinks[0] : undefined);

      if (link) {
        const anchor = link.cloneNode(true) as HTMLAnchorElement;
        anchor.replaceChildren(new Icon({ doc: this.document, iconNode: Play }).element);
        anchor.className = buttonStyles({ variant: "ghost", size: "iconXs" });
        item.append(anchor);
      } else if (audioUrl) {
        const audio = document.createElement("audio");
        audio.src = audioUrl;

        const audioButton = this.document.createElement("button");
        audioButton.type = "button";
        audioButton.className = `${buttonStyles({ variant: "ghost", size: "iconXs" })} text-foreground/60`;
        audioButton.append(new Icon({ doc: this.document, iconNode: Play }).element);
        audioButton.addEventListener("click", (event) => {
          event.stopPropagation();
          audio.currentTime = 0;
          void audio.play();
        });

        item.append(audioButton);
      }

      this.element.append(item);
    });
  }
}
