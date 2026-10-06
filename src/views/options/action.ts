import { errorMessage } from "@common/error";
import { useCallback, useLayoutEffect, useRef, useState } from "preact/hooks";
import { useSettingsStatus } from "./notice";

export type SettingsAction = "save" | "test" | "fetch" | "template";

interface ActionMessages<T> {
  pending: string;
  success: string | ((result: T) => string);
  onSuccess?: (result: T) => void;
}

export function useSettingsAction() {
  const [busy, setBusy] = useState<SettingsAction>();
  const current = useRef<{ action: SettingsAction; controller: AbortController } | undefined>(
    undefined,
  );
  const { status, showStatus, clearStatus } = useSettingsStatus();

  const cancel = useCallback((action?: SettingsAction) => {
    if (!current.current || (action && current.current.action !== action)) return;
    current.current.controller.abort();
    current.current = undefined;
    setBusy(undefined);
  }, []);

  useLayoutEffect(() => () => current.current?.controller.abort(), []);

  const runAction = async <T>(
    action: SettingsAction,
    operation: (signal: AbortSignal) => Promise<T>,
    messages: ActionMessages<T>,
  ) => {
    if (current.current) return;
    const request = { action, controller: new AbortController() };
    current.current = request;
    setBusy(action);
    showStatus("info", messages.pending);
    await Promise.resolve()
      .then(() => {
        request.controller.signal.throwIfAborted();
        return operation(request.controller.signal);
      })
      .then((result) => {
        if (request.controller.signal.aborted) return;
        messages.onSuccess?.(result);
        showStatus(
          "success",
          typeof messages.success === "string" ? messages.success : messages.success(result),
        );
      })
      .catch((error: unknown) => {
        if (!request.controller.signal.aborted) showStatus("error", errorMessage(error));
      })
      .finally(() => {
        if (current.current !== request) return;
        current.current = undefined;
        if (!request.controller.signal.aborted) setBusy(undefined);
      });
  };

  return { busy, status, showStatus, clearStatus, cancel, runAction };
}
