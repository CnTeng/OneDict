import type { IAudioService } from "@common/types";

export class HtmlAudioService implements IAudioService {
  private currentAudio?: HTMLAudioElement;

  constructor(private readonly document: Document) {}

  async play(url: string) {
    this.currentAudio?.pause();

    const audio = this.document.createElement("audio");
    audio.src = url;
    this.currentAudio = audio;
    await audio.play();
  }
}
