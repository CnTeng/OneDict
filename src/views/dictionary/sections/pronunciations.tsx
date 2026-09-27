import type { IAudioService, Pronunciation } from "@common/types";
import { IconButton, iconButtonClass } from "@views/components/button";
import { LucideIcon, createIconElement } from "@views/components/icon";
import { cn } from "cn";
import { Play } from "lucide";
import { useLayoutEffect, useRef } from "preact/hooks";

interface DictionaryPronunciationsSectionProps {
  pronunciations: Pronunciation[];
  className?: string;
  soundLinks?: HTMLAnchorElement[];
  audioService?: IAudioService;
}

export function DictionaryPronunciationsSection({
  pronunciations,
  className,
  soundLinks,
  audioService,
}: DictionaryPronunciationsSectionProps) {
  if (pronunciations.length === 0) return null;

  return (
    <div class={cn("flex flex-wrap", className ?? "mb-2.5 gap-3.5")}>
      {pronunciations.map(({ type, text, audioUrl }, index) => {
        const soundLink =
          soundLinks?.[index] ??
          (soundLinks && pronunciations.length === 1 ? soundLinks[0] : undefined);

        return (
          <div key={`${type ?? ""}-${text ?? ""}-${index}`} class="flex items-center gap-1.5">
            {type && (
              <span class="text-muted-foreground text-xs font-semibold uppercase opacity-70">
                {type}
              </span>
            )}
            {text && <span class="text-foreground font-mono text-[0.92rem]">{text}</span>}
            {soundLink ? (
              <AnkiSoundButton link={soundLink} />
            ) : (
              audioUrl &&
              audioService && (
                <IconButton
                  size="xs"
                  class="text-foreground/60"
                  onClick={(event) => {
                    event.stopPropagation();
                    void audioService.play(audioUrl);
                  }}
                >
                  <LucideIcon iconNode={Play} />
                </IconButton>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}

function AnkiSoundButton({ link }: { link: HTMLAnchorElement }) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Preserve Anki's native soundLink element so its playback integration still works.
    const anchor = link.cloneNode(true) as HTMLAnchorElement;
    anchor.replaceChildren(createIconElement({ doc: container.ownerDocument, iconNode: Play }));
    anchor.className = cn(iconButtonClass, "size-6");
    container.replaceChildren(anchor);
  }, [link]);

  return <span class="contents" ref={containerRef} />;
}
