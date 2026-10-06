import type { IAudioService, Pronunciation } from "@common/types";
import { IconButton } from "@views/components/button";
import { cn } from "cn";
import { Play } from "lucide-preact";

interface DictionaryPronunciationsSectionProps {
  pronunciations: Pronunciation[];
  className?: string;
  audioService?: IAudioService;
}

export function DictionaryPronunciationsSection({
  pronunciations,
  className,
  audioService,
}: DictionaryPronunciationsSectionProps) {
  if (pronunciations.length === 0) return null;

  return (
    <div class={cn("flex flex-wrap", className ?? "mb-2.5 gap-3.5")}>
      {pronunciations.map((pronunciation, index) => {
        const { type, text } = pronunciation;

        return (
          <div key={`${type ?? ""}-${text ?? ""}-${index}`} class="flex items-center gap-1.5">
            {type && (
              <span class="text-muted-foreground text-xs font-semibold uppercase opacity-70">
                {type}
              </span>
            )}
            {text && <span class="text-foreground font-mono text-[0.92rem]">{text}</span>}
            {audioService?.canPlay(pronunciation, index) && (
              <IconButton
                size="xs"
                class="text-foreground/60"
                onClick={(event) => {
                  event.stopPropagation();
                  void audioService.play(pronunciation, index);
                }}
              >
                <Play />
              </IconButton>
            )}
          </div>
        );
      })}
    </div>
  );
}
