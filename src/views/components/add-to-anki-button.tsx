import { errorMessage } from "@common/error";
import { IconButton } from "@views/components/button";
import { cn } from "cn";
import { Check, LoaderCircle, Plus, X } from "lucide-preact";
import { useState } from "preact/hooks";

type AddButtonState =
  | { status: "idle" | "loading" | "success" }
  | { status: "error"; error: unknown };

const stateClasses: Record<"loading" | "success" | "error", string> = {
  loading: cn("cursor-wait opacity-70"),
  success: cn("bg-[color-mix(in_srgb,var(--success)_18%,var(--background))] text-[var(--success)]"),
  error: cn(
    "bg-[color-mix(in_srgb,var(--destructive)_18%,var(--background))] text-[var(--destructive)]",
  ),
};

interface AddToAnkiButtonProps {
  onAdd: () => void | Promise<void>;
  disabled?: boolean;
}

export function AddToAnkiButton({ onAdd, disabled }: AddToAnkiButtonProps) {
  const [state, setState] = useState<AddButtonState>({ status: "idle" });

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (disabled || state.status === "loading" || state.status === "success") return;

    setState({ status: "loading" });
    void Promise.resolve()
      .then(onAdd)
      .then(
        () => setState({ status: "success" }),
        (error: unknown) => setState({ status: "error", error }),
      );
  };

  const Icon = state.status === "success" ? Check : state.status === "error" ? X : Plus;
  const label =
    state.status === "error"
      ? `Failed to add to Anki: ${errorMessage(state.error)}`
      : state.status === "success"
        ? "Added to Anki"
        : state.status === "loading"
          ? "Adding to Anki"
          : "Add to Anki";

  return (
    <div class="flex shrink-0 flex-col items-end gap-1">
      <IconButton
        title={label}
        aria-label={label}
        data-state={state.status}
        disabled={disabled || state.status === "loading" || state.status === "success"}
        class={cn("text-foreground/60", state.status !== "idle" && stateClasses[state.status])}
        onClick={handleClick}
      >
        {state.status === "loading" ? <LoaderCircle class="size-4 animate-spin" /> : <Icon />}
      </IconButton>
      {state.status === "error" && (
        <p role="alert" class="text-destructive max-w-48 text-right text-xs">
          {errorMessage(state.error)}
        </p>
      )}
    </div>
  );
}
