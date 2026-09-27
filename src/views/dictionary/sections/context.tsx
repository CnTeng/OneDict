import { MarkdownContent } from "@views/components/markdown";
import { cn } from "cn";

interface DictionaryContextSectionProps {
  context?: string;
  className?: string;
}

export function DictionaryContextSection({ context, className }: DictionaryContextSectionProps) {
  const value = context?.trim();
  if (!value) return null;

  return (
    <div class={cn("mt-3.5 text-left", className)}>
      <div class="text-muted-foreground mb-1.5 ml-1 text-[0.68rem] font-bold tracking-[0.14em] uppercase">
        Context
      </div>
      <div class="bg-secondary/35 text-foreground border-border/35 rounded-xl border px-4 py-3 text-[0.9rem] leading-relaxed whitespace-pre-wrap italic shadow-sm">
        <MarkdownContent source={value} />
      </div>
    </div>
  );
}
