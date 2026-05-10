import { Icon } from "@views/components";
import { Star } from "lucide";
import { cn } from "tailwind-variants";

const FREQUENCY_STAR_COUNT = 5;

export interface DictionaryMetadataSectionOptions {
  doc: Document;
  metadata?: Record<string, unknown>;
}

export class DictionaryMetadataSection {
  readonly element: HTMLDivElement;
  readonly isEmpty: boolean;

  private readonly doc: Document;
  private readonly metadata?: Record<string, unknown>;

  constructor({ doc, metadata }: DictionaryMetadataSectionOptions) {
    this.doc = doc;
    this.metadata = metadata;

    this.element = this.doc.createElement("div");
    this.element.className = cn("mb-2 flex items-center gap-2") as string;

    const tags = (this.metadata?.tags as string[]) || [];
    const frequency = (this.metadata?.frequency as number) || 0;
    this.isEmpty = tags.length === 0 && frequency === 0;

    if (this.isEmpty) return;
    this.render(tags, frequency);
  }

  private render(tags: string[], frequency: number) {
    const frequencyElement = this.createFrequency(frequency);
    const tagsElement = this.createTags(tags);

    if (frequencyElement) this.element.append(frequencyElement);
    if (tagsElement) this.element.append(tagsElement);
  }

  private createFrequency(frequency: number): HTMLDivElement | null {
    if (frequency <= 0) return null;

    const container = this.doc.createElement("div");
    container.className = cn("flex items-center gap-0.5") as string;

    for (let i = 0; i < FREQUENCY_STAR_COUNT; i++) {
      container.append(
        new Icon({
          doc: this.doc,
          iconNode: Star,
          customAttrs: {
            class: cn(
              "h-4 w-4",
              i < frequency ? "text-warning fill-current" : "text-base-content/35",
            ),
          },
        }).element,
      );
    }

    return container;
  }

  private createTags(tags: string[]): HTMLDivElement | null {
    if (tags.length === 0) return null;

    const container = this.doc.createElement("div");
    container.className = cn("flex flex-wrap gap-1.5") as string;

    tags.forEach((tag) => {
      const badge = this.doc.createElement("span");
      badge.className = "badge badge-outline badge-sm border-base-300 text-[11px]";
      badge.textContent = tag;
      container.append(badge);
    });

    return container;
  }
}
