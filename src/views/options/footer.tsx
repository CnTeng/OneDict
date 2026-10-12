import { t } from "@common/i18n";
import { Button } from "@views/components/button";
import { PlugZap, RotateCcw, Save } from "lucide-preact";
import type { ComponentChildren } from "preact";
import type { SettingsAction } from "./action";

interface SettingsFooterProps {
  busy?: SettingsAction;
  dirty: boolean;
  onReset?: () => void;
  onTest?: () => void;
  onSave?: () => void;
  children?: ComponentChildren;
}

export function SettingsFooter({
  busy,
  dirty,
  onReset,
  onTest,
  onSave,
  children,
}: SettingsFooterProps) {
  return (
    <footer class="border-border flex flex-wrap gap-2 border-t pt-4">
      {onReset && (
        <Button
          variant="destructive"
          size="icon"
          label={t("settings.reset")}
          disabled={Boolean(busy)}
          onClick={onReset}
        >
          <RotateCcw class="size-4" />
        </Button>
      )}
      <div class="flex flex-1 flex-wrap justify-end gap-2">
        {children}
        {onTest && (
          <Button
            size="icon"
            label={t("settings.test")}
            loading={busy === "test"}
            disabled={Boolean(busy)}
            onClick={onTest}
          >
            <PlugZap class="size-4" />
          </Button>
        )}
        {onSave && (
          <Button
            variant="success"
            size="icon"
            label={t("settings.save")}
            loading={busy === "save"}
            disabled={Boolean(busy) || !dirty}
            onClick={onSave}
          >
            <Save class="size-4" />
          </Button>
        )}
      </div>
    </footer>
  );
}
