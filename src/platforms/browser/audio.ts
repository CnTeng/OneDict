import { t } from "@common/i18n";
import type { IAudioService, Pronunciation } from "@common/types";

export class HtmlAudioService implements IAudioService {
  private currentAudio?: HTMLAudioElement;

  canPlay({ audioUrl }: Pronunciation) {
    return Boolean(audioUrl);
  }

  async play({ audioUrl }: Pronunciation) {
    if (!audioUrl) throw new Error(t("errors.audio"));
    this.currentAudio?.pause();

    const audio = document.createElement("audio");
    audio.src = audioUrl;
    this.currentAudio = audio;
    await audio.play();
  }
}
