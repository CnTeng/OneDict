import { cn } from "cn";
import type { ComponentChildren } from "preact";

interface BadgeProps {
  children: ComponentChildren;
  variant?: "muted" | "secondary";
  class?: string;
}

export function Badge({ children, variant = "muted", class: className }: BadgeProps) {
  return (
    <span
      class={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-medium",
        variant === "muted"
          ? "border-border/50 bg-muted/70 text-muted-foreground"
          : "bg-secondary text-secondary-foreground border-[color-mix(in_srgb,var(--border)_70%,transparent)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
