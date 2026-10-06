import type { IAudioService, Pronunciation } from "@common/types";

export class ZoteroAudioService implements IAudioService {
  private currentAudio?: HTMLAudioElement;

  canPlay({ audioUrl }: Pronunciation) {
    return Boolean(audioUrl);
  }

  async play({ audioUrl }: Pronunciation) {
    if (!audioUrl) throw new Error("No audio is available for this pronunciation.");
    this.currentAudio?.pause();

    const audio = Zotero.getMainWindow().document.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "audio",
    ) as HTMLAudioElement;
    audio.src = audioUrl;
    this.currentAudio = audio;
    await audio.play();
  }
}
