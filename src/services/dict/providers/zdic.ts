import iconUrl from "@assets/providers/zdic.png?inline";
import type { Definition, DictionaryEntry, Example, Pronunciation } from "@common/types";
import { DictionaryProvider } from "../provider";

export class ZdicDictionary extends DictionaryProvider {
  private readonly baseUrl = "https://zdic.net/hans";
  readonly id = "zdic";
  readonly name = "Zdic Chinese Dictionary";
  readonly iconUrl = iconUrl;
  readonly supportedLanguages = ["zh"] as const;

  lookup(word: string): Promise<DictionaryEntry | null> {
    return this.fetchDocument(`${this.baseUrl}/${encodeURIComponent(word)}`).then((doc) =>
      this.parseDocument(doc),
    );
  }

  public parseDocument(doc: Document): DictionaryEntry | null {
    const container = doc.querySelector("#gyjs");
    if (!container) return null;

    return {
      word: this.parseWord(container),
      definitions: this.parseDefinitions(container),
      pronunciations: this.parsePronunciations(container),
      metadata: { providerId: this.id, providerName: this.name },
    };
  }

  private parseWord(container: Element): string {
    return this.normalizeText(container.querySelector(".gy-reading__char")?.textContent);
  }

  private parseDefinitions(container: Element): Definition[] {
    const definitions: Definition[] = [];

    const normalize = (text?: string | null) =>
      this.normalizeText(text).replace(/([，。；：！？])\s+/g, "$1");

    const parseSense = (sense: Element, partOfSpeech?: string) => {
      const text = normalize(sense.querySelector(".gy-sense__def")?.textContent);
      if (!text) return;

      const examples: Example[] = [];
      sense.querySelectorAll(".gy-sense__eg-text, .gy-sense__cit-item").forEach((exampleNode) => {
        const exampleText = normalize(exampleNode.textContent);
        if (!exampleText) return;
        examples.push({ text: exampleText });
      });

      definitions.push({
        partOfSpeech,
        text,
        examples: examples.length > 0 ? examples : undefined,
      });
    };

    container.querySelectorAll(".gy-pos").forEach((section) => {
      const partOfSpeech = normalize(section.querySelector(".gy-pos__badge")?.textContent);
      section.querySelectorAll(".gy-sense").forEach((sense) => {
        parseSense(sense, partOfSpeech || undefined);
      });
    });

    if (definitions.length > 0) return definitions;

    container.querySelectorAll(".gy-sense").forEach((sense) => {
      parseSense(sense, undefined);
    });

    return definitions;
  }

  private parsePronunciations(container: Element): Pronunciation[] {
    const pronunciations: Pronunciation[] = [];

    container.querySelectorAll(".gy-reading__py").forEach((row) => {
      const text = this.normalizeText(row.firstChild?.textContent);
      if (!text || pronunciations.some((pronunciation) => pronunciation.text === text)) return;

      const audios = row.nextElementSibling?.getAttribute("data-audio")?.split(",").filter(Boolean);

      pronunciations.push({
        type: "pinyin",
        text,
        audioUrl: audios?.length === 1 ? `https:${audios[0]}` : undefined,
      });
    });

    return pronunciations;
  }
}
