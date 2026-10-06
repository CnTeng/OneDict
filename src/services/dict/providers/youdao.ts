import iconUrl from "@assets/providers/youdao.png?inline";
import type { Definition, DictionaryEntry, Example, Pronunciation } from "@common/types";
import { DictionaryProvider } from "../provider";

export class YoudaoDictionary extends DictionaryProvider {
  readonly id = "youdao";
  readonly name = "Youdao";
  readonly iconUrl = iconUrl;
  readonly supportedLanguages = ["en"] as const;

  async lookup(word: string): Promise<DictionaryEntry | null> {
    const entry = this.parseDocument(
      await this.fetchDocument(`https://dict.youdao.com/w/${encodeURIComponent(word)}`),
    );
    if (entry || word === word.toLowerCase()) return entry;

    return this.parseDocument(
      await this.fetchDocument(
        `https://dict.youdao.com/w/${encodeURIComponent(word.toLowerCase())}`,
      ),
    );
  }

  public parseDocument(doc: Document): DictionaryEntry | null {
    const container = doc.querySelector("#collinsResult");
    if (!container) return null;
    const definitions = this.parseCollinsDefinitions(container);

    return {
      word: this.parseWord(container),
      definitions: definitions.length > 0 ? definitions : this.parsePhraseDefinitions(doc),
      pronunciations: this.parsePronunciations(doc),
      metadata: {
        ...this.parseMetadata(container),
        providerId: this.id,
        providerName: this.name,
      },
    };
  }

  private parseWord(container: Element): string {
    const keyword = container.querySelector("h4 .title");
    return this.normalizeText(keyword?.textContent);
  }

  private parseCollinsDefinitions(container: Element): Definition[] {
    const definitions: Definition[] = [];
    const defNodes = container.querySelectorAll(".ol li");

    defNodes.forEach((defNode) => {
      const transNode = defNode.querySelector(".collinsMajorTrans p");
      if (!transNode) return;

      const posNode = transNode.querySelector(".additional");
      const pos = this.normalizeText(posNode?.textContent);

      let fullText = this.normalizeText(transNode.textContent);
      if (pos && fullText.startsWith(pos)) {
        fullText = this.normalizeText(fullText.substring(pos.length));
      }
      if (!fullText) return;

      const examples: Example[] = [];
      const exampleLis = defNode.querySelectorAll(".exampleLists");

      exampleLis.forEach((ex) => {
        const pTags = ex.querySelectorAll("p");
        if (pTags.length >= 2) {
          const en = this.normalizeText(pTags[0].textContent);
          const cn = this.normalizeText(pTags[1].textContent);
          if (en) examples.push({ text: en, translation: cn });
        }
      });

      definitions.push({
        partOfSpeech: pos,
        text: fullText,
        examples: examples,
      });
    });

    return definitions;
  }

  private parsePhraseDefinitions(doc: Document): Definition[] {
    const definitions: Definition[] = [];

    const container = doc.querySelector("#phrsListTab .trans-container");
    if (!container) return definitions;

    container.querySelectorAll("ul li").forEach((el) => {
      const text = this.normalizeText(el.textContent);
      const match = text.match(/^([a-z]+\.)\s*(.*)$/i);

      if (match) {
        definitions.push({
          partOfSpeech: match[1],
          text: match[2],
        });
      } else {
        definitions.push({ text });
      }
    });

    return definitions;
  }

  private parsePronunciations(doc: Document): Pronunciation[] {
    const pronunciations: Pronunciation[] = [];

    const keyword = this.normalizeText(
      doc.querySelector("#phrsListTab .wordbook-js .keyword")?.textContent,
    );
    const containers = doc.querySelectorAll(".baav .pronounce, .wordbook-js .pronounce");
    const parse = (el: Element, type: "uk" | "us") => {
      const span = el.querySelector(".phonetic");
      const text = this.normalizeText(span?.textContent);
      if (text) {
        pronunciations.push({
          text,
          type,
          audioUrl: `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(keyword || "")}&type=${type === "us" ? 2 : 1}`,
        });
      }
    };

    if (containers.length >= 2) {
      parse(containers[0], "uk");
      parse(containers[1], "us");
    } else if (containers.length === 1) {
      parse(containers[0], "uk");
    }

    return pronunciations;
  }

  private parseMetadata(container: Element): Record<string, unknown> {
    const metadata: Record<string, unknown> = {};

    const starNode = container.querySelector("h4 .star");
    const match = starNode?.className.match(/star(\d+)/);
    if (match) {
      metadata.frequency = parseInt(match[1], 10);
    }

    const rankNode = container.querySelector("h4 .rank");
    if (rankNode?.textContent) {
      metadata.tags = this.normalizeText(rankNode.textContent).split(" ").filter(Boolean);
    }

    return metadata;
  }
}
