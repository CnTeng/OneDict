import { cn } from "cn";
import type { ComponentChildren } from "preact";

interface CardLayoutProps {
  side: "front" | "back";
  children: ComponentChildren;
}

export function CardLayout({ side, children }: CardLayoutProps) {
  return (
    <div class={cn("mx-auto max-w-150 p-5", side === "front" ? "pt-10" : "pt-0 text-left")}>
      {children}
    </div>
  );
}
