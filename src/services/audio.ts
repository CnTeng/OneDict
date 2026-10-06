import type { IAudioService, Pronunciation } from "@common/types";

export class HtmlAudioService implements IAudioService {
  private currentAudio?: HTMLAudioElement;

  constructor(private readonly createAudio: () => HTMLAudioElement) {}

  canPlay({ audioUrl }: Pronunciation) {
    return Boolean(audioUrl);
  }

  async play({ audioUrl }: Pronunciation) {
    if (!audioUrl) throw new Error("No audio is available for this pronunciation.");
    this.currentAudio?.pause();

    const audio = this.createAudio();
    audio.src = audioUrl;
    this.currentAudio = audio;
    await audio.play();
  }
}
