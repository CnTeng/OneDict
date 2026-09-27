import iconUrl from "@assets/providers/bing.png?inline";
import type { Definition, DictionaryEntry, Example, Pronunciation } from "@common/types";
import { DictionaryProvider } from "../provider";

const BING_ORIGIN = "https://cn.bing.com";

export class BingDictionary extends DictionaryProvider {
  readonly id = "bing";
  readonly name = "Bing";
  readonly iconUrl = iconUrl;
  readonly supportedLanguages = ["en"] as const;

  lookup(word: string): Promise<DictionaryEntry | null> {
    return this.fetchDocument(`${BING_ORIGIN}/dict/clientsearch`, {
      searchParams: { mkt: "zh-CN", setLang: "zh", q: word },
    }).then((doc) => this.parseDocument(doc));
  }

  public parseDocument(doc: Document): DictionaryEntry | null {
    const word = this.normalizeText(doc.querySelector(".client_def_hd_hd")?.textContent);
    const definitions = this.parseDefinitions(doc);
    const pronunciations = this.parsePronunciations(doc);
    if (!word || (definitions.length === 0 && pronunciations.length === 0)) return null;

    return {
      word,
      definitions,
      pronunciations,
      metadata: { providerId: this.id, providerName: this.name },
    };
  }

  private parseDefinitions(doc: Document): Definition[] {
    const examples = this.parseExamples(doc);
    const seen = new Set<string>();
    return Array.from(doc.querySelectorAll(".client_def_container .client_def_bar")).flatMap(
      (element, index) => {
        const partOfSpeech = this.normalizeText(
          element.querySelector(".client_def_title_bar")?.textContent,
        );
        const text = Array.from(element.querySelectorAll(".client_def_list_word_content"))
          .map((item) => this.normalizeText(item.textContent))
          .filter(Boolean)
          .join("; ");
        const key = `${partOfSpeech}\n${text}`;
        if (!text || seen.has(key)) return [];
        seen.add(key);
        return [
          {
            partOfSpeech: partOfSpeech || undefined,
            text,
            examples: index === 0 && examples.length > 0 ? examples : undefined,
          },
        ];
      },
    );
  }

  private parseExamples(doc: Document): Example[] {
    return Array.from(doc.querySelectorAll(".client_sentence_list"))
      .slice(0, 5)
      .flatMap((element) => {
        const text = this.normalizeText(element.querySelector(".client_sen_en")?.textContent);
        if (!text) return [];
        const translation = this.normalizeText(
          element.querySelector(".client_sen_cn")?.textContent,
        );
        return [{ text, translation: translation || undefined }];
      });
  }

  private parsePronunciations(doc: Document): Pronunciation[] {
    return Array.from(doc.querySelectorAll(".client_def_hd_pn_list")).flatMap((element) => {
      const label = this.normalizeText(element.querySelector(".client_def_hd_pn")?.textContent);
      const text = label.match(/\[([^\]]+)]/)?.[1];
      if (!text) return [];

      const audioElement = element.querySelector("[data-pronunciation], [data-mp3link]");
      const audioPath =
        audioElement?.getAttribute("data-pronunciation") ??
        audioElement?.getAttribute("data-mp3link");
      return [
        {
          type: /美国|美|us/i.test(label) ? "us" : /英国|英|uk/i.test(label) ? "uk" : undefined,
          text,
          audioUrl: audioPath ? new URL(audioPath, BING_ORIGIN).href : undefined,
        },
      ];
    });
  }
}
