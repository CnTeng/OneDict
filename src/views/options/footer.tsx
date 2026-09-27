import { errorMessage } from "@common/error";
import type { IConfigService } from "@common/types";
import { Button } from "@views/components/button";
import { LucideIcon } from "@views/components/icon";
import { RotateCcw } from "lucide";

interface OptionsFooterProps {
  ownerDocument: Document;
  configService: IConfigService;
}

export function OptionsFooter({ ownerDocument, configService }: OptionsFooterProps) {
  const reset = async () => {
    if (
      !ownerDocument.defaultView?.confirm("Are you sure you want to reset all options to defaults?")
    ) {
      return;
    }

    await configService
      .reset()
      .catch((error: unknown) =>
        ownerDocument.defaultView?.alert(`Failed to reset options: ${errorMessage(error)}`),
      );
  };

  return (
    <footer class="border-border bg-muted/20 border-t px-4 py-4 sm:px-6">
      <Button
        title="Reset all options to default"
        variant="ghost"
        class="text-destructive w-full sm:w-auto"
        onClick={() => void reset()}
      >
        <LucideIcon iconNode={RotateCcw} customAttrs={{ width: 16, height: 16 }} />
        Reset Defaults
      </Button>
    </footer>
  );
}
