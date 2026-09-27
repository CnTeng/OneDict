import type { ComponentChildren } from "preact";

interface SettingsRowProps {
  label: string;
  htmlFor?: string;
  description?: string;
  children: ComponentChildren;
}

export function SettingsRow({ label, htmlFor, description, children }: SettingsRowProps) {
  return (
    <div class="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(220px,320px)] sm:items-center">
      <div class="min-w-0 space-y-1">
        <label class="text-foreground text-sm font-medium" for={htmlFor}>
          {label}
        </label>
        {description && <p class="text-muted-foreground text-sm">{description}</p>}
      </div>
      <div class="min-w-0">{children}</div>
    </div>
  );
}
