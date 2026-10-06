import { cn } from "cn";
import type { LucideIcon } from "lucide-preact";

interface StatusMessageProps {
  message: string;
  icon: LucideIcon;
  error?: boolean;
  spin?: boolean;
  class?: string;
}

export function StatusMessage({
  message,
  icon: Icon,
  error = false,
  spin = false,
  class: className,
}: StatusMessageProps) {
  return (
    <div
      role={error ? "alert" : "status"}
      class={cn(
        "text-foreground/80 flex min-w-0 flex-1 flex-col items-center justify-center gap-3 p-6 text-center",
        className,
      )}
    >
      <Icon class={cn("size-6", spin && "animate-spin", error && "text-destructive")} />
      <p class={cn("text-sm", error && "text-destructive")}>{message}</p>
    </div>
  );
}
