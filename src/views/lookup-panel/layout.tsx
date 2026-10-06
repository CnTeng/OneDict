import { ContextEditor } from "@views/components/context-editor";
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
      <ContextEditor value={context} onChanged={onContextChange} />
    </section>
  );
}
