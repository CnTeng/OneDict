import { cn } from "cn";
import { useLayoutEffect, useMemo, useRef } from "preact/hooks";
import { highlightMarkdown } from "./markdown";

interface EditorProps {
  value: string;
  ariaLabel?: string;
  disabled?: boolean;
  appearance?: "note" | "content";
  className?: string;
  placeholder?: string;
  onChanged: (value: string) => void;
}

export function Editor({
  value,
  ariaLabel,
  disabled,
  appearance = "note",
  className,
  placeholder = "",
  onChanged,
}: EditorProps) {
  const textClass =
    appearance === "content"
      ? "p-0 text-[0.95rem] leading-relaxed"
      : "p-3 font-mono text-sm leading-6";
  const highlight = useMemo(
    () => highlightMarkdown(value.endsWith("\n") ? `${value} ` : value),
    [value],
  );
  const highlightRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const syncScroll = () => {
    const highlight = highlightRef.current;
    const textarea = textareaRef.current;
    if (!highlight || !textarea) return;
    highlight.scrollTop = textarea.scrollTop;
    highlight.scrollLeft = textarea.scrollLeft;
  };

  useLayoutEffect(() => {
    syncScroll();
  }, [value]);

  return (
    <div class={cn("relative overflow-hidden", className)}>
      <div
        ref={highlightRef}
        aria-hidden="true"
        class={cn(
          "text-foreground pointer-events-none wrap-break-word whitespace-pre-wrap tab-2",
          appearance === "content" ? "min-h-24" : "absolute inset-0 overflow-auto",
          textClass,
        )}
      >
        {highlight}
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        aria-label={ariaLabel}
        disabled={disabled}
        class={cn(
          "caret-foreground placeholder:text-foreground/45 absolute inset-0 h-full w-full resize-none overflow-auto border-0 bg-transparent wrap-break-word whitespace-pre-wrap tab-2 text-transparent shadow-none outline-none",
          textClass,
        )}
        placeholder={placeholder}
        spellcheck={false}
        autocomplete="off"
        onInput={(event) => onChanged(event.currentTarget.value)}
        onScroll={syncScroll}
      />
    </div>
  );
}
