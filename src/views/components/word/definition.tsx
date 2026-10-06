import type { Definition, Example } from "@common/types";
import { cn } from "cn";
import type { ComponentChildren, ComponentProps } from "preact";
import { useState } from "preact/hooks";

interface WordDefinitionProps extends Omit<
  ComponentProps<"div">,
  "children" | "class" | "className"
> {
  definition: Definition;
  index: number;
  actions?: ComponentChildren;
  toggleTranslation?: boolean;
  defaultTranslationVisible?: boolean;
  className?: string;
}

export function WordDefinition({
  definition,
  index,
  actions,
  toggleTranslation = false,
  defaultTranslationVisible = true,
  className,
  onClick,
  ...props
}: WordDefinitionProps) {
  const [translationVisible, setTranslationVisible] = useState(defaultTranslationVisible);

  return (
    <div
      {...props}
      role={toggleTranslation ? "button" : props.role}
      data-def-index={index}
      data-state={translationVisible ? "open" : "closed"}
      class={cn(
        "flex flex-1 flex-col gap-1 py-3.5 first:pt-1.5 last:pb-1.5",
        (toggleTranslation || !translationVisible) && "group",
        toggleTranslation && "cursor-pointer outline-none",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!toggleTranslation || event.defaultPrevented) return;
        event.stopPropagation();
        setTranslationVisible((visible) => !visible);
      }}
    >
      <div class="flex flex-1 items-start justify-between gap-2">
        <DefinitionContent definition={definition} />
        {actions}
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

interface WordDefinitionsProps {
  definitions: Definition[];
  toggleTranslation?: boolean;
  defaultTranslationVisible?: boolean;
  className?: string;
}

export function WordDefinitions({
  definitions,
  toggleTranslation,
  defaultTranslationVisible,
  className,
}: WordDefinitionsProps) {
  if (!definitions.length) return null;

  return (
    <div
      class={cn("divide-border text-foreground flex flex-col divide-y leading-relaxed", className)}
    >
      {definitions.map((definition, index) => (
        <WordDefinition
          key={index}
          definition={definition}
          index={index}
          toggleTranslation={toggleTranslation}
          defaultTranslationVisible={defaultTranslationVisible}
        />
      ))}
    </div>
  );
}
