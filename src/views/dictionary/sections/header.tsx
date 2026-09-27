import { Badge } from "@views/components/badge";

interface DictionaryHeaderSectionProps {
  word: string;
  provider: string;
  className?: string;
}

export function DictionaryHeaderSection({
  word,
  provider,
  className,
}: DictionaryHeaderSectionProps) {
  return (
    <div class={className ?? "mb-2.5 flex items-center justify-between"}>
      <div class="flex items-baseline gap-2.5">
        <h2 class="text-foreground text-[1.65rem] leading-tight font-bold tracking-tight">
          {word}
        </h2>
        <Badge class="text-[0.65rem] uppercase opacity-90">{provider}</Badge>
      </div>
    </div>
  );
}
