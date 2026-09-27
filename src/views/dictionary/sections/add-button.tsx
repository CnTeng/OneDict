import { errorMessage } from "@common/error";
import { IconButton } from "@views/components/button";
import { LucideIcon } from "@views/components/icon";
import { cn } from "cn";
import { Check, Plus, X } from "lucide";
import { useState } from "preact/hooks";

type AddButtonState =
  | { status: "idle" | "loading" | "success" }
  | { status: "error"; error: unknown };

const stateClasses: Record<"loading" | "success" | "error", string> = {
  loading: "cursor-wait opacity-70",
  success: "bg-[color-mix(in_srgb,var(--success)_18%,var(--background))] text-[var(--success)]",
  error:
    "bg-[color-mix(in_srgb,var(--destructive)_18%,var(--background))] text-[var(--destructive)]",
};

interface AddButtonProps {
  index: number;
  onAddClick: (index: number) => void | Promise<void>;
}

export function AddButton({ index, onAddClick }: AddButtonProps) {
  const [state, setState] = useState<AddButtonState>({ status: "idle" });

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (state.status === "loading") return;

    setState({ status: "loading" });
    void Promise.resolve()
      .then(() => onAddClick(index))
      .then(
        () => setState({ status: "success" }),
        (error: unknown) => setState({ status: "error", error }),
      );
  };

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
        data-def-index={index}
        data-state={state.status}
        disabled={state.status === "loading"}
        class={cn("text-foreground/60", state.status !== "idle" && stateClasses[state.status])}
        onClick={handleClick}
      >
        {state.status === "loading" ? (
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <LucideIcon
            iconNode={state.status === "success" ? Check : state.status === "error" ? X : Plus}
          />
        )}
      </IconButton>
      {state.status === "error" && (
        <p role="alert" class="text-destructive max-w-48 text-right text-xs">
          {errorMessage(state.error)}
        </p>
      )}
    </div>
  );
}
