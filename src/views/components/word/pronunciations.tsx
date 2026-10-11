import { t } from "@common/i18n";
import type { IAudioService, Pronunciation } from "@common/types";
import { cn } from "cn";
import { Play } from "lucide-preact";
import { IconButton } from "../button";

interface WordPronunciationsProps {
  pronunciations: Pronunciation[];
  className?: string;
  audioService?: IAudioService;
}

export function WordPronunciations({
  pronunciations,
  className,
  audioService,
}: WordPronunciationsProps) {
  if (pronunciations.length === 0) return null;

  return (
    <div class={cn("flex flex-wrap", className)}>
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
                label={type ? t("audio.playType", { type }) : t("audio.play")}
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
