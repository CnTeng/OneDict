import type { TextCard } from "@common/types";
import { ContextSection } from "@views/components/context-section";
import { MarkdownContent } from "@views/components/markdown";

export function TextContextSection({ text, context }: Pick<TextCard, "text" | "context">) {
  const value = context?.trim();
  if (!value || [text.trim(), `**${text.trim()}**`].includes(value)) return null;

  return <ContextSection context={value} />;
}

export function TextExplanationSection({ explanation }: Pick<TextCard, "explanation">) {
  return (
    <div class="text-foreground pt-1.5 pb-1.5 text-[0.95rem] leading-relaxed wrap-break-word whitespace-pre-wrap">
      <MarkdownContent source={explanation} />
    </div>
  );
}
