import { t } from "@common/i18n";
import { cn } from "cn";
import { MarkdownContent } from "../markdown";

interface ContextProps {
  context?: string;
  text?: string;
  className?: string;
}

export function Context({ context, text, className }: ContextProps) {
  const value = context?.trim();
  if (!value || (text !== undefined && [text.trim(), `**${text.trim()}**`].includes(value)))
    return null;

  return (
    <div class={cn("text-left", className)}>
      <div class="text-muted-foreground mb-1.5 ml-1 text-[0.68rem] font-bold tracking-[0.14em] uppercase">
        {t("context.title")}
      </div>
      <div class="border-border/35 bg-secondary/35 text-foreground rounded-xl border px-4 py-3 text-[0.9rem] leading-relaxed whitespace-pre-wrap italic shadow-sm">
        <MarkdownContent source={value} />
      </div>
    </div>
  );
}
