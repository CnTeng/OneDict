import type { ComponentChildren } from "preact";
import type { SettingsDraft } from "./draft";
import { OptionsFooter } from "./footer";
import { SettingsNotice } from "./notice";

interface SettingsLayoutProps {
  title: string;
  description: string;
  children: ComponentChildren;
}

export function SettingsLayout({ title, description, children }: SettingsLayoutProps) {
  return (
    <section class="space-y-4">
      <div class="space-y-1">
        <h2 class="text-foreground text-xl font-semibold">{title}</h2>
        <p class="text-muted-foreground text-sm">{description}</p>
      </div>
      {children}
    </section>
  );
}

interface SettingsPageProps<T extends Record<string, unknown>> extends SettingsLayoutProps {
  draft: SettingsDraft<T>;
  onTest: (config: T, signal: AbortSignal) => Promise<unknown>;
  allowEditingWhileFetching?: boolean;
  footerActions?: ComponentChildren;
}

export function SettingsPage<T extends Record<string, unknown>>({
  title,
  description,
  draft,
  onTest,
  allowEditingWhileFetching = false,
  footerActions,
  children,
}: SettingsPageProps<T>) {
  const { loading, dirty, loadError, status, busy, reset, test, save } = draft;
  if (loading) return <p class="text-muted-foreground text-sm">Loading {title} settings...</p>;

  return (
    <SettingsLayout title={title} description={description}>
      <SettingsNotice
        status={
          loadError
            ? { level: "error", message: `Failed to load ${title} settings: ${loadError}` }
            : dirty
              ? {
                  level: status?.level ?? "info",
                  message: [status?.message, "Unsaved changes. Click Save to apply."]
                    .filter(Boolean)
                    .join(" "),
                }
              : status
        }
      />
      {!loadError && (
        <>
          <fieldset
            disabled={Boolean(busy) && !(allowEditingWhileFetching && busy === "fetch")}
            class="border-border divide-border divide-y rounded-md border"
          >
            {children}
          </fieldset>
          <OptionsFooter
            busy={busy}
            dirty={dirty}
            onReset={reset}
            onTest={() => void test(onTest)}
            onSave={() => void save()}
          >
            {footerActions}
          </OptionsFooter>
        </>
      )}
    </SettingsLayout>
  );
}
