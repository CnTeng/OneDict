import type { Definition, Example } from "@common/types";
import { AddToAnkiButton } from "@views/components/add-to-anki-button";
import { cn } from "cn";
import { useState } from "preact/hooks";

interface DictionaryDefinitionsSectionProps {
  definitions: Definition[];
  className?: string;
  onAddClick?: (index: number) => void | Promise<void>;
  toggleTranslation?: boolean;
}

export function DictionaryDefinitionsSection({
  definitions,
  className,
  onAddClick,
  toggleTranslation = false,
}: DictionaryDefinitionsSectionProps) {
  if (definitions.length === 0) return null;

  return (
    <div class={cn("divide-border flex flex-col divide-y", className)}>
      {definitions.map((definition, index) => (
        <DefinitionRow
          key={index}
          definition={definition}
          index={index}
          onAddClick={onAddClick}
          toggleTranslation={toggleTranslation}
        />
      ))}
    </div>
  );
}

interface DefinitionRowProps {
  definition: Definition;
  index: number;
  onAddClick?: (index: number) => void | Promise<void>;
  toggleTranslation: boolean;
}

function DefinitionRow({ definition, index, onAddClick, toggleTranslation }: DefinitionRowProps) {
  const [translationVisible, setTranslationVisible] = useState(!toggleTranslation);

  return (
    <div
      data-def-index={index}
      data-state={translationVisible ? "open" : "closed"}
      role={toggleTranslation ? "button" : undefined}
      class={cn(
        "flex flex-1 flex-col gap-1 py-3.5 first:pt-1.5 last:pb-1.5",
        toggleTranslation && "group cursor-pointer outline-none",
      )}
      onClick={
        toggleTranslation
          ? (event) => {
              event.stopPropagation();
              setTranslationVisible((visible) => !visible);
            }
          : undefined
      }
    >
      <div class="flex flex-1 items-start justify-between gap-2">
        <DefinitionContent definition={definition} />
        {onAddClick && <AddToAnkiButton onAdd={() => onAddClick(index)} />}
      </div>
      <Examples examples={definition.examples} />
    </div>
  );
}

function DefinitionContent({ definition }: { definition: Definition }) {
  return (
    <div class="leading-relaxed">
      {definition.partOfSpeech && (
        <span class="text-muted-foreground mr-2 font-serif text-xs font-medium italic">
          {definition.partOfSpeech}
        </span>
      )}
      <span class="text-foreground text-[0.95rem] leading-relaxed">{definition.text}</span>
    </div>
  );
}

function Examples({ examples }: { examples?: Example[] }) {
  if (!examples?.length) return null;

  return (
    <ul class="mt-1.5 list-disc flex-col space-y-1.5 pl-4">
      {examples.map((example, index) => (
        <li key={index} class="text-muted-foreground text-sm leading-relaxed">
          <span>{example.text}</span>
          {example.translation && (
            <span
              class={cn(
                "ml-1",
                "group-data-[state=closed]:bg-secondary",
                "group-data-[state=closed]:text-transparent!",
                "group-data-[state=closed]:select-none",
                "group-data-[state=closed]:rounded",
                "group-data-[state=closed]:px-1",
                "group-data-[state=closed]:py-0.5",
              )}
            >
              {` ${example.translation}`}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
