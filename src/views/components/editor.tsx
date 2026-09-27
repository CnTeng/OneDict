import { cn } from "cn";
import { useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { getMarkdownHighlightSegments } from "./markdown";

interface EditorProps {
  initialValue?: string;
  className?: string;
  placeholder?: string;
  onChanged?: (value: string) => void;
}

export function Editor({ initialValue = "", className, placeholder = "", onChanged }: EditorProps) {
  const [value, setValue] = useState(initialValue);
  const highlight = useMemo(
    () => getMarkdownHighlightSegments(value.endsWith("\n") ? `${value} ` : value),
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
        class="text-foreground pointer-events-none absolute inset-0 overflow-auto p-3 font-mono text-sm leading-6 wrap-break-word whitespace-pre-wrap tab-2"
      >
        {highlight.map(({ text, className }, index) =>
          className ? (
            <span key={index} class={className}>
              {text}
            </span>
          ) : (
            text
          ),
        )}
      </div>
      <textarea
        ref={textareaRef}
        defaultValue={initialValue}
        class="caret-foreground placeholder:text-foreground/45 absolute inset-0 h-full w-full resize-none overflow-auto border-0 bg-transparent p-3 font-mono text-sm leading-6 wrap-break-word whitespace-pre-wrap tab-2 text-transparent outline-none"
        placeholder={placeholder}
        spellcheck={false}
        autocomplete="off"
        onInput={(event) => {
          const nextValue = event.currentTarget.value;
          setValue(nextValue);
          onChanged?.(nextValue);
        }}
        onScroll={syncScroll}
      />
    </div>
  );
}
