import { t } from "@common/i18n";
import type { ComponentChildren } from "preact";
import type { SettingsDraft } from "./draft";
import { SettingsFooter } from "./footer";
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
  if (loading)
    return <p class="text-muted-foreground text-sm">{t("settings.loading", { title })}</p>;

  return (
    <SettingsLayout title={title} description={description}>
      <SettingsNotice
        status={
          loadError
            ? {
                level: "error",
                message: t("settings.loadFailed", {
                  title,
                  error: loadError,
                }),
              }
            : dirty
              ? {
                  level: status?.level ?? "info",
                  message: [status?.message, t("settings.dirty")].filter(Boolean).join(" "),
                }
              : status
        }
      />
      {!loadError && (
        <>
          <fieldset
            disabled={Boolean(busy) && !(allowEditingWhileFetching && busy === "fetch")}
            class="divide-border border-border divide-y rounded-md border"
          >
            {children}
          </fieldset>
          <SettingsFooter
            busy={busy}
            dirty={dirty}
            onReset={reset}
            onTest={() => void test(onTest)}
            onSave={() => void save()}
          >
            {footerActions}
          </SettingsFooter>
        </>
      )}
    </SettingsLayout>
  );
}
