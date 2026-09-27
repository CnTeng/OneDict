import type { DictionaryEntry, IAudioService } from "@common/types";
import {
  DictionaryContextSection,
  DictionaryDefinitionsSection,
  DictionaryHeaderSection,
  DictionaryMetadataSection,
  DictionaryPronunciationsSection,
} from "./sections";

interface AnkiCardFrontProps {
  entry: DictionaryEntry;
  soundLinks?: HTMLAnchorElement[];
  audioService?: IAudioService;
}

export function AnkiCardFront({ entry, soundLinks = [], audioService }: AnkiCardFrontProps) {
  return (
    <div class="mx-auto max-w-150 p-5 pt-10">
      <DictionaryHeaderSection
        word={entry.word}
        provider={entry.metadata.providerName}
        className="mb-4 flex items-baseline justify-center gap-3"
      />
      <DictionaryMetadataSection metadata={entry.metadata} className="mb-4 justify-center" />
      <DictionaryPronunciationsSection
        pronunciations={entry.pronunciations}
        soundLinks={soundLinks}
        audioService={audioService}
        className="text-foreground/60 justify-center gap-6 text-[1rem]"
      />
      <DictionaryContextSection context={entry.context} />
    </div>
  );
}

interface AnkiCardBackProps {
  entry: DictionaryEntry;
}

export function AnkiCardBack({ entry }: AnkiCardBackProps) {
  return (
    <div class="mx-auto max-w-150 p-5 pt-0 text-left">
      <div id="onedict-definitions">
        <DictionaryDefinitionsSection
          definitions={entry.definitions}
          toggleTranslation
          className="text-foreground leading-relaxed"
        />
      </div>
    </div>
  );
}
