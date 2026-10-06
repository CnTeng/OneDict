import { cn } from "cn";
import { Badge } from "./badge";

interface ContentHeaderProps {
  text: string;
  source: string;
  className?: string;
  textClassName?: string;
}

export function ContentHeader({ text, source, className, textClassName }: ContentHeaderProps) {
  return (
    <div class={cn("mb-2.5 flex flex-wrap items-baseline gap-2.5", className)}>
      <h2
        class={cn(
          "text-foreground min-w-0 text-[1.65rem] leading-tight font-bold tracking-tight wrap-break-word",
          textClassName,
        )}
      >
        {text}
      </h2>
      <Badge class="text-[0.65rem] uppercase opacity-90">{source}</Badge>
    </div>
  );
}
