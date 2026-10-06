import { errorMessage } from "@common/error";
import { IconButton } from "@views/components/button";
import { Check, Plus, X } from "lucide-preact";
import { useState } from "preact/hooks";

type AddButtonState =
  | { status: "idle" | "loading" | "success" }
  | { status: "error"; message: string };

interface AddButtonProps {
  onAdd: () => void | Promise<void>;
  disabled?: boolean;
}

export function AddButton({ onAdd, disabled }: AddButtonProps) {
  const [state, setState] = useState<AddButtonState>({ status: "idle" });
  const blocked = disabled || state.status === "loading" || state.status === "success";

  const handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (blocked) return;

    setState({ status: "loading" });
    void Promise.resolve()
      .then(onAdd)
      .then(
        () => setState({ status: "success" }),
        (error: unknown) => setState({ status: "error", message: errorMessage(error) }),
      );
  };

  const Icon = state.status === "success" ? Check : state.status === "error" ? X : Plus;
  const label =
    state.status === "error"
      ? `Failed to add to Anki: ${state.message}`
      : state.status === "success"
        ? "Added to Anki"
        : state.status === "loading"
          ? "Adding to Anki"
          : "Add to Anki";

  return (
    <div class="flex shrink-0 flex-col items-end gap-1">
      <IconButton
        label={label}
        data-state={state.status}
        loading={state.status === "loading"}
        disabled={blocked}
        class="text-foreground/60 data-[state=error]:bg-destructive/18 data-[state=error]:text-destructive data-[state=success]:bg-success/18 data-[state=success]:text-success"
        onClick={handleClick}
      >
        <Icon />
      </IconButton>
      {state.status === "error" && (
        <p role="alert" class="text-destructive max-w-48 text-right text-xs">
          {state.message}
        </p>
      )}
    </div>
  );
}
