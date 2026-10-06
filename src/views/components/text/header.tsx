import { cn } from "cn";
import { Badge } from "../badge";

interface TextHeaderProps {
  text: string;
  source: string;
  className?: string;
}

export function TextHeader({ text, source, className }: TextHeaderProps) {
  return (
    <div class={cn("flex flex-wrap items-baseline gap-2.5", className)}>
      <h2 class="text-foreground min-w-0 text-center text-[1.65rem] leading-tight font-bold tracking-tight wrap-break-word whitespace-pre-wrap">
        {text}
      </h2>
      <Badge class="text-[0.65rem] uppercase opacity-90">{source}</Badge>
    </div>
  );
}
