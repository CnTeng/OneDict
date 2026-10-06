import type { IAudioService, WordEntry } from "@common/types";
import { Context } from "@views/components/context";
import {
  WordDefinitions,
  WordHeader,
  WordMetadata,
  WordPronunciations,
} from "@views/components/word";
import { CardLayout } from "./card-layout";

interface WordCardFrontProps {
  entry: WordEntry;
  context?: string;
  audioService: IAudioService;
}

export function WordCardFront({ entry, context, audioService }: WordCardFrontProps) {
  return (
    <CardLayout side="front">
      <WordHeader
        word={entry.word}
        source={entry.metadata.providerName}
        className="mb-4 justify-center"
      />
      <WordMetadata metadata={entry.metadata} className="mb-4 justify-center" />
      <WordPronunciations
        pronunciations={entry.pronunciations}
        audioService={audioService}
        className="text-foreground/60 justify-center gap-6 text-[1rem]"
      />
      <Context context={context} className="mt-3.5" />
    </CardLayout>
  );
}

interface WordCardBackProps {
  entry: WordEntry;
}

export function WordCardBack({ entry }: WordCardBackProps) {
  return (
    <CardLayout side="back">
      <div id="onedict-definitions">
        <WordDefinitions
          definitions={entry.definitions}
          toggleTranslation
          defaultTranslationVisible={false}
        />
      </div>
    </CardLayout>
  );
}
