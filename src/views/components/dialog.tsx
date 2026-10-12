import { cn } from "cn";
import type { ComponentChildren, ComponentProps } from "preact";
import { useEffect, useId, useRef } from "preact/hooks";

type DialogProps = Omit<
  ComponentProps<"dialog">,
  "open" | "ref" | "class" | "className" | "title"
> & {
  open: boolean;
  class?: string;
  title?: string;
  description?: string;
  actions?: ComponentChildren;
};

export function Dialog({
  open,
  title,
  description,
  actions,
  children,
  class: className,
  ...props
}: DialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();

  useEffect(() => {
    const element = dialog.current;
    if (!element || element.open === open) return;
    if (open) element.showModal();
    else element.close();
  }, [open]);

  return (
    <dialog
      aria-labelledby={title ? `${id}-title` : undefined}
      aria-describedby={description ? `${id}-description` : undefined}
      {...props}
      ref={dialog}
      class={cn(
        "border-border bg-background text-foreground m-auto max-h-[85vh] w-[min(32rem,calc(100%-2rem))] overflow-y-auto rounded-lg border p-6 shadow-xl backdrop:bg-black/50",
        className,
      )}
    >
      <div class="space-y-4">
        {title && (
          <h2 id={`${id}-title`} class="text-xl font-semibold">
            {title}
          </h2>
        )}
        {description && (
          <p id={`${id}-description`} class="text-muted-foreground text-sm">
            {description}
          </p>
        )}
        {children}
        {actions && <div class="flex justify-end gap-2">{actions}</div>}
      </div>
    </dialog>
  );
}
