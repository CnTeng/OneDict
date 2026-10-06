import type { DictionaryEntry, IAudioService } from "@common/types";
import { ContentHeader } from "@views/components/content-header";
import { ContextSection } from "@views/components/context-section";
import {
  DictionaryDefinitionsSection,
  DictionaryMetadataSection,
  DictionaryPronunciationsSection,
} from "@views/dictionary/sections";
import { CardLayout } from "./components/card-layout";

interface WordCardFrontProps {
  entry: DictionaryEntry;
  audioService: IAudioService;
}

export function WordCardFront({ entry, audioService }: WordCardFrontProps) {
  return (
    <CardLayout side="front">
      <ContentHeader
        text={entry.word}
        source={entry.metadata.providerName}
        className="mb-4 justify-center"
      />
      <DictionaryMetadataSection metadata={entry.metadata} className="mb-4 justify-center" />
      <DictionaryPronunciationsSection
        pronunciations={entry.pronunciations}
        audioService={audioService}
        className="text-foreground/60 justify-center gap-6 text-[1rem]"
      />
      <ContextSection context={entry.context} />
    </CardLayout>
  );
}

interface WordCardBackProps {
  entry: DictionaryEntry;
}

export function WordCardBack({ entry }: WordCardBackProps) {
  return (
    <CardLayout side="back">
      <div id="onedict-definitions">
        <DictionaryDefinitionsSection
          definitions={entry.definitions}
          toggleTranslation
          className="text-foreground leading-relaxed"
        />
      </div>
    </CardLayout>
  );
}
