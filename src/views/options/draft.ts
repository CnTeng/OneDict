import { errorMessage } from "@common/error";
import type { IConfigStore } from "@common/types";
import { useLayoutEffect, useState } from "preact/hooks";
import type * as z from "zod";
import { useSettingsAction } from "./action";

export type SettingsDraft<T extends Record<string, unknown>> = ReturnType<
  typeof useSettingsDraft<T>
>;

export function useSettingsDraft<T extends Record<string, unknown>>(
  configService: IConfigStore<T>,
  schema: z.ZodType<T>,
  onDirtyChange?: (dirty: boolean) => void,
) {
  const [draft, setDraft] = useState(() => {
    const config = schema.parse(undefined);
    return { config, saved: config };
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const actions = useSettingsAction();
  const { cancel, clearStatus } = actions;
  const dirty = JSON.stringify(draft.config) !== JSON.stringify(draft.saved);

  useLayoutEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useLayoutEffect(() => {
    cancel();
    clearStatus();
    let active = true;
    let changed = false;
    const unsubscribe = configService.onDidChange((next) => {
      if (!active) return;
      changed = true;
      setDraft(({ config, saved }) => ({
        config: JSON.stringify(config) === JSON.stringify(saved) ? next : config,
        saved: next,
      }));
    });
    setLoading(true);
    setLoadError(undefined);
    void configService.get().then(
      (next) => {
        if (!active) return;
        if (!changed) setDraft({ config: next, saved: next });
        setLoading(false);
      },
      (error: unknown) => {
        if (!active) return;
        setLoadError(errorMessage(error));
        setLoading(false);
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [configService, cancel, clearStatus]);

  const change = (patch: Partial<T>) => {
    if (actions.busy && actions.busy !== "fetch") return;
    actions.clearStatus();
    setDraft((current) => ({ ...current, config: { ...current.config, ...patch } }));
  };

  const reset = () => {
    if (actions.busy) return;
    actions.showStatus("info", "Defaults restored.");
    setDraft((current) => ({ ...current, config: schema.parse(undefined) }));
  };

  const runWithConfig = (
    action: "save" | "test",
    operation: (config: T, signal: AbortSignal) => Promise<unknown>,
  ) =>
    actions.runAction(
      action,
      async (signal) => {
        const parsed = schema.safeParse(draft.config);
        if (!parsed.success)
          throw new Error(parsed.error.issues[0]?.message ?? "Check your settings.");
        await operation(parsed.data, signal);
        return parsed.data;
      },
      {
        pending: action === "save" ? "Saving settings..." : "Testing connection...",
        success: action === "save" ? "Settings saved." : "Connection successful!",
        onSuccess: action === "save" ? (config) => setDraft({ config, saved: config }) : undefined,
      },
    );

  return {
    ...actions,
    config: draft.config,
    loading,
    loadError,
    dirty,
    change,
    reset,
    save: () => runWithConfig("save", (config) => configService.set(config)),
    test: (operation: (config: T, signal: AbortSignal) => Promise<unknown>) =>
      runWithConfig("test", operation),
  };
}
