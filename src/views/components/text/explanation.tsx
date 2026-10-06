import type { TextEntry } from "@common/types";
import { cn } from "cn";
import { MarkdownContent } from "../markdown";

interface TextExplanationProps extends Pick<TextEntry, "explanation"> {
  className?: string;
}

export function TextExplanation({ explanation, className }: TextExplanationProps) {
  return (
    <div
      class={cn("text-foreground text-[0.95rem] leading-relaxed whitespace-pre-wrap", className)}
    >
      <MarkdownContent source={explanation} />
    </div>
  );
}
