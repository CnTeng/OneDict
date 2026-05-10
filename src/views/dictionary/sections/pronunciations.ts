import type { Pronunciation } from "@common/model";
import { Icon } from "@views/components";
import { Play } from "lucide";
import { cn } from "tailwind-variants";

export interface DictionaryPronunciationsSectionOptions {
  doc: Document;
  pronunciations: Pronunciation[];
  soundLinks?: HTMLAnchorElement[];
}

export class DictionaryPronunciationsSection {
  readonly element: HTMLDivElement;
  readonly isEmpty: boolean;

  private readonly doc: Document;
  private readonly pronunciations: Pronunciation[];
  private readonly soundLinks?: HTMLAnchorElement[];

  constructor({ doc, pronunciations, soundLinks }: DictionaryPronunciationsSectionOptions) {
    this.doc = doc;
    this.pronunciations = pronunciations;
    this.soundLinks = soundLinks;

    this.element = this.doc.createElement("div");
    this.element.className = cn("mb-2 flex flex-wrap gap-3") as string;
    this.isEmpty = !this.pronunciations || this.pronunciations.length === 0;

    if (this.isEmpty) return;
    this.render();
  }

  private render() {
    this.pronunciations.forEach(({ type, text, audioUrl }, index) => {
      const item = this.doc.createElement("div");
      item.className = cn("flex items-center gap-2") as string;

      if (type) {
        const typeElement = this.doc.createElement("span");
        typeElement.className = cn(
          "text-base-content/55 text-xs font-semibold uppercase opacity-70",
        ) as string;
        typeElement.textContent = type;
        item.append(typeElement);
      }

      if (text) {
        const textElement = this.doc.createElement("span");
        textElement.className = cn("text-base-content font-mono text-sm") as string;
        textElement.textContent = text;
        item.append(textElement);
      }

      const link =
        this.soundLinks?.[index] ||
        (this.soundLinks && this.pronunciations.length === 1 ? this.soundLinks[0] : undefined);

      if (link) {
        const anchor = link.cloneNode(true) as HTMLAnchorElement;
        anchor.replaceChildren(new Icon({ doc: this.doc, iconNode: Play }).element);
        anchor.className = "btn btn-ghost btn-xs btn-circle";
        item.append(anchor);
      } else if (audioUrl) {
        const audio = this.doc.createElement("audio");
        audio.src = audioUrl;

        const audioButton = this.doc.createElement("button");
        audioButton.type = "button";
        audioButton.className = "btn btn-ghost btn-circle btn-xs text-base-content/60 shadow-none";
        audioButton.append(new Icon({ doc: this.doc, iconNode: Play }).element);
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
