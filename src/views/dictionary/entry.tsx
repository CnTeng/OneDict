import type {
  DictionaryEntry as DictionaryEntryData,
  IAnkiService,
  IAudioService,
} from "@common/types";
import {
  DictionaryDefinitionsSection,
  DictionaryMetadataSection,
  DictionaryPronunciationsSection,
} from "./sections";

interface DictionaryEntryProps {
  entry: DictionaryEntryData;
  context?: string;
  ankiService?: IAnkiService;
  audioService?: IAudioService;
}

export function DictionaryEntry({
  entry,
  context,
  ankiService,
  audioService,
}: DictionaryEntryProps) {
  const addDefinitionToAnki = ankiService
    ? (index: number) => {
        const definition = entry.definitions[index];
        if (!definition) return;
        return ankiService.createNote({ ...entry, context, definitions: [definition] });
      }
    : undefined;

  return (
    <div>
      <DictionaryMetadataSection metadata={entry.metadata} />
      <DictionaryPronunciationsSection
        pronunciations={entry.pronunciations}
        audioService={audioService}
      />
      <DictionaryDefinitionsSection
        definitions={entry.definitions}
        onAddClick={addDefinitionToAnki}
      />
    </div>
  );
}
