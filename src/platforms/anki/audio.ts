import type { IAudioService, Pronunciation } from "@common/types";

export class AnkiAudioService implements IAudioService {
  private readonly links: readonly (HTMLAnchorElement | undefined)[];

  constructor(pronunciations: readonly Pronunciation[], soundLinks: readonly HTMLAnchorElement[]) {
    const audioPronunciations = pronunciations.filter(({ audioUrl }) => audioUrl);
    // Older notes can contain native audio without pronunciation URLs.
    this.links = pronunciations.map(
      (pronunciation, index) =>
        soundLinks[audioPronunciations.length ? audioPronunciations.indexOf(pronunciation) : index],
    );
  }

  canPlay(_pronunciation: Pronunciation, index: number): boolean {
    return Boolean(this.links[index]);
  }

  async play(_pronunciation: Pronunciation, index: number): Promise<void> {
    const link = this.links[index];
    if (!link) throw new Error("No Anki audio is available for this pronunciation.");
    // Activate the original element, preserving Anki's handlers and media bridge.
    link.click();
  }
}
