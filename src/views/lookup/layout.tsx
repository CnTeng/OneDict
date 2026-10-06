import { ContextEditor } from "@views/components/context";
import type { ComponentChildren } from "preact";

interface LookupLayoutProps {
  label: string;
  busy?: boolean;
  context: string;
  onContextChange: (value: string) => void;
  children: ComponentChildren;
}

export function LookupLayout({
  label,
  busy,
  context,
  onContextChange,
  children,
}: LookupLayoutProps) {
  return (
    <section
      aria-label={label}
      aria-busy={busy}
      class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <div class="min-h-0 flex-1 overflow-y-auto px-4 py-3">{children}</div>
      <div class="border-border/80 bg-muted/80 shrink-0 border-t">
        <ContextEditor value={context} onChanged={onContextChange} className="h-[20%] min-h-24" />
      </div>
    </section>
  );
}
