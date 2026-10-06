import type { IAudioService, Pronunciation } from "@common/types";

export function createAnkiAudioService(
  pronunciations: readonly Pronunciation[],
  soundLinks: readonly HTMLAnchorElement[],
  fallback: IAudioService,
): IAudioService {
  const audioPronunciations = pronunciations.filter(({ audioUrl }) => audioUrl);
  // Older notes can contain native audio without pronunciation URLs.
  const links = pronunciations.map(
    (pronunciation, index) =>
      soundLinks[audioPronunciations.length ? audioPronunciations.indexOf(pronunciation) : index],
  );

  return {
    canPlay: (pronunciation, index) =>
      Boolean(links[index]) || fallback.canPlay(pronunciation, index),
    async play(pronunciation, index) {
      const link = links[index];
      if (link) {
        // Activate the original element, preserving Anki's handlers and media bridge.
        link.click();
        return;
      }
      await fallback.play(pronunciation, index);
    },
  };
}
