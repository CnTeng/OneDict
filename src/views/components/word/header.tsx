import { cn } from "cn";
import { Badge } from "../badge";

interface WordHeaderProps {
  word: string;
  source: string;
  className?: string;
}

export function WordHeader({ word, source, className }: WordHeaderProps) {
  return (
    <div class={cn("flex flex-wrap items-baseline gap-2.5", className)}>
      <h2 class="text-foreground min-w-0 text-[1.65rem] leading-tight font-bold tracking-tight wrap-break-word">
        {word}
      </h2>
      <Badge class="text-[0.65rem] uppercase opacity-90">{source}</Badge>
    </div>
  );
}
