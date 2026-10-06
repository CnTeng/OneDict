import { Button } from "@views/components/button";
import { PlugZap, RotateCcw, Save } from "lucide-preact";
import type { ComponentChildren } from "preact";
import type { SettingsAction } from "./action";

interface OptionsFooterProps {
  busy?: SettingsAction;
  dirty: boolean;
  onReset: () => void;
  onTest: () => void;
  onSave: () => void;
  children?: ComponentChildren;
}

export function OptionsFooter({
  busy,
  dirty,
  onReset,
  onTest,
  onSave,
  children,
}: OptionsFooterProps) {
  return (
    <footer class="border-border flex flex-wrap gap-2 border-t pt-4">
      <Button
        variant="destructive"
        size="icon"
        title="Reset"
        aria-label="Reset"
        disabled={Boolean(busy)}
        onClick={onReset}
      >
        <RotateCcw class="size-4" />
      </Button>
      <div class="flex flex-1 flex-wrap justify-end gap-2">
        {children}
        <Button
          size="icon"
          title="Test Connection"
          aria-label="Test Connection"
          loading={busy === "test"}
          disabled={Boolean(busy)}
          onClick={onTest}
        >
          <PlugZap class="size-4" />
        </Button>
        <Button
          variant="success"
          size="icon"
          title="Save"
          aria-label="Save"
          loading={busy === "save"}
          disabled={Boolean(busy) || !dirty}
          onClick={onSave}
        >
          <Save class="size-4" />
        </Button>
      </div>
    </footer>
  );
}
